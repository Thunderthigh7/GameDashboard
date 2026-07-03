local HttpService = game:GetService("HttpService")
local MessagingService = game:GetService("MessagingService")
local Players = game:GetService("Players")
local TeleportService = game:GetService("TeleportService")

local Settings = require(script.Parent.Parent.Config.Settings)

local Methods = {}
local playerJoinTimes = {}
local playerConnections = {}
local pendingChatLogs = {}
local processedCommandIds = {}
local serverStartedAt = os.time()
local chatLogCounter = 0

local COMMAND_TOPIC_PREFIX = "dashboard-command-"
local KICK_COMMAND_TOPIC = "kick"
local MAX_PROCESSED_COMMAND_IDS = 100

local started = false
local sending = false

local function debugWarn(...)
	if Settings.Debug then
		warn("[PresenceService]", ...)
	end
end

local function getPlayerSummary()
	local summaries = {}

	for _, player in Players:GetPlayers() do
		table.insert(summaries, player.Name .. ":" .. tostring(player.UserId))
	end

	return table.concat(summaries, ", ")
end

local function getMaxChatLogsPerPayload()
	return Settings.MaxChatLogsPerPayload or 100
end

local function getMaxPendingChatLogs()
	return Settings.MaxPendingChatLogs or 500
end

local function trimChatMessage(message)
	local text = tostring(message or "")
	local maxLength = Settings.MaxChatMessageLength or 500

	if #text > maxLength then
		return string.sub(text, 1, maxLength)
	end

	return text
end

local function queueChatLog(player, message)
	local text = trimChatMessage(message)
	if text == "" then
		return
	end

	chatLogCounter += 1
	table.insert(pendingChatLogs, {
		id = game.JobId .. ":" .. tostring(chatLogCounter),
		userId = player.UserId,
		username = player.Name,
		displayName = player.DisplayName,
		message = text,
		sentAt = os.time(),
	})

	while #pendingChatLogs > getMaxPendingChatLogs() do
		table.remove(pendingChatLogs, 1)
	end

	debugWarn("Queued chat log:", player.Name, player.UserId, text)
end

local function trackPlayer(player)
	playerJoinTimes[player.UserId] = playerJoinTimes[player.UserId] or os.time()
	debugWarn("Tracking player:", player.Name, player.UserId, "joinedAt", playerJoinTimes[player.UserId])
end

local function watchPlayer(player)
	trackPlayer(player)

	if playerConnections[player] then
		return
	end

	playerConnections[player] = player.Chatted:Connect(function(message)
		queueChatLog(player, message)
	end)

	debugWarn("Watching chat for player:", player.Name, player.UserId)
end

local function untrackPlayer(player)
	debugWarn("Untracking player:", player.Name, player.UserId)
	playerJoinTimes[player.UserId] = nil

	local connection = playerConnections[player]
	if connection then
		connection:Disconnect()
		playerConnections[player] = nil
	end
end

local function processTeleportCommand(command)
	local target = command.target
	if typeof(target) ~= "table" then
		return
	end

	local placeId = tonumber(target.placeId)
	local jobId = target.jobId

	if not placeId or type(jobId) ~= "string" or jobId == "" then
		return
	end

	for _, userId in command.playerUserIds or {} do
		local player = Players:GetPlayerByUserId(tonumber(userId))
		if player then
			local ok, err = pcall(function()
				TeleportService:TeleportToPlaceInstance(placeId, jobId, player)
			end)

			if not ok then
				debugWarn("Teleport failed:", player.Name, err)
			end
		end
	end
end

local function getModerationReason(command, fallback)
	if type(command.reason) == "string" and command.reason ~= "" then
		return command.reason
	end

	return fallback
end

local function processKickCommand(command)
	local reason = getModerationReason(command, "Kicked by an administrator.")
	local kickedCount = 0
	local requestedUserIds = {}

	for _, userId in command.userIds or {} do
		local numericUserId = tonumber(userId)
		table.insert(requestedUserIds, tostring(numericUserId or userId))

		local player = numericUserId and Players:GetPlayerByUserId(numericUserId)
		if player then
			kickedCount += 1
			debugWarn("Kicking player:", player.Name, player.UserId)
			player:Kick(reason)
		end
	end

	debugWarn("Kick command processed:", kickedCount, "player(s)")
	debugWarn("Kick requested userIds:", table.concat(requestedUserIds, ", "))
	debugWarn("Current server players:", getPlayerSummary())
end

local function markCommandProcessed(command)
	if type(command.id) ~= "string" or command.id == "" then
		return false
	end

	if processedCommandIds[command.id] then
		return true
	end

	processedCommandIds[command.id] = os.clock()

	local count = 0
	for commandId in processedCommandIds do
		count += 1
		if count > MAX_PROCESSED_COMMAND_IDS then
			processedCommandIds[commandId] = nil
		end
	end

	return false
end

local function processCommand(command)
	if typeof(command) ~= "table" then
		return
	end

	if markCommandProcessed(command) then
		return
	end

	debugWarn("Command received:", command.type or "unknown", command.id or "no-id")

	if command.type == "teleportPlayersToServer" then
		processTeleportCommand(command)
	elseif command.type == "kickPlayers" then
		processKickCommand(command)
	end
end

local function processEncodedCommand(encoded)
	if typeof(encoded) == "table" then
		debugWarn("Received table command from MessagingService")
		processCommand(encoded)
		return
	end

	if type(encoded) ~= "string" then
		debugWarn("Ignored command with non-string data type:", typeof(encoded))
		return
	end

	debugWarn("Received encoded command:", encoded)

	local ok, command = pcall(function()
		return HttpService:JSONDecode(encoded)
	end)

	if ok then
		processCommand(command)
	else
		debugWarn("Failed to decode command:", command)
	end
end

local function processHeartbeatResponse(response)
	if not response.Body or response.Body == "" then
		debugWarn("Heartbeat response has no body")
		return
	end

	local ok, payload = pcall(function()
		return HttpService:JSONDecode(response.Body)
	end)

	if not ok or typeof(payload) ~= "table" then
		debugWarn("Failed to decode heartbeat response:", payload)
		return
	end

	local commands = payload.commands or {}
	debugWarn("Heartbeat response:", "liveServers", payload.liveServers or "?", "commands", #commands)

	for _, command in commands do
		processCommand(command)
	end
end

local function subscribeToTopic(topic)
	local ok, err = pcall(function()
		MessagingService:SubscribeAsync(topic, function(message)
			debugWarn("Message received on topic:", topic)
			processEncodedCommand(message.Data)
		end)
	end)

	if ok then
		debugWarn("Subscribed to command topic:", topic)
	else
		debugWarn("Command subscription failed:", topic, err)
	end
end

local function subscribeToCommandTopics()
	subscribeToTopic(KICK_COMMAND_TOPIC)
	subscribeToTopic(COMMAND_TOPIC_PREFIX .. game.JobId)
end

local function getPlayersPayload()
	local players = {}

	for _, player in Players:GetPlayers() do
		if #players >= Settings.MaxPlayersPerPayload then
			debugWarn("MaxPlayersPerPayload reached:", Settings.MaxPlayersPerPayload, "actual players", #Players:GetPlayers())
			break
		end

		trackPlayer(player)

		table.insert(players, {
			userId = player.UserId,
			username = player.Name,
			displayName = player.DisplayName,
			joinedAt = playerJoinTimes[player.UserId],
		})
	end

	return players
end

local function getChatLogsPayload()
	local chatLogs = {}
	local maxChatLogs = getMaxChatLogsPerPayload()

	for index = 1, math.min(#pendingChatLogs, maxChatLogs) do
		table.insert(chatLogs, pendingChatLogs[index])
	end

	return chatLogs
end

local function clearSentChatLogs(count)
	for _ = 1, math.min(count, #pendingChatLogs) do
		table.remove(pendingChatLogs, 1)
	end
end

local function buildPayload()
	return {
		universeId = game.GameId,
		placeId = game.PlaceId,
		jobId = game.JobId,
		serverStartedAt = serverStartedAt,
		updatedAt = os.time(),
		playerCount = #Players:GetPlayers(),
		players = getPlayersPayload(),
		chatLogs = getChatLogsPayload(),
	}
end

function Methods.SendHeartbeat()
	if sending then
		debugWarn("Skipping heartbeat because previous heartbeat is still sending")
		return false
	end

	sending = true

	local payload = buildPayload()
	local body = HttpService:JSONEncode(payload)

	local playerSummaries = {}
	for _, player in payload.players do
		table.insert(playerSummaries, player.username .. ":" .. tostring(player.userId))
	end
	debugWarn("Heartbeat payload:", "endpoint", Settings.Endpoint, "universe", payload.universeId, "place", payload.placeId, "job", payload.jobId, "uptime", os.time() - serverStartedAt, "players", payload.playerCount, table.concat(playerSummaries, ", "), "chatLogs", #payload.chatLogs)

	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = Settings.Endpoint,
			Method = "POST",
			Headers = {
				["Content-Type"] = "application/json",
				["X-Dashboard-Secret"] = Settings.Secret,
			},
			Body = body,
		})
	end)

	sending = false

	if not success then
		debugWarn("Heartbeat request failed:", response)

		return false
	end

	if not response.Success then
		debugWarn("Heartbeat rejected:", response.StatusCode, response.Body)

		return false
	end

	clearSentChatLogs(#payload.chatLogs)
	processHeartbeatResponse(response)

	debugWarn("Heartbeat sent:", response.StatusCode, response.Body or "", "remainingChatLogs", #pendingChatLogs)

	return true
end

function Methods.Start()
	if started then
		return
	end

	started = true

	debugWarn("Starting:", "script", script:GetFullName(), "universe", game.GameId, "place", game.PlaceId, "job", game.JobId)
	debugWarn("Settings:", "endpoint", Settings.Endpoint, "interval", Settings.HeartbeatInterval, "maxPlayers", Settings.MaxPlayersPerPayload, "debug", Settings.Debug)
	debugWarn("Players at start:", #Players:GetPlayers(), getPlayerSummary())

	Players.PlayerAdded:Connect(watchPlayer)
	Players.PlayerRemoving:Connect(untrackPlayer)

	for _, player in Players:GetPlayers() do
		watchPlayer(player)
	end

	subscribeToCommandTopics()

	task.spawn(function()
		task.wait(3)

		while true do
			Methods.SendHeartbeat()
			task.wait(Settings.HeartbeatInterval)
		end
	end)

	game:BindToClose(function()
		Methods.SendHeartbeat()
	end)
end

return Methods
