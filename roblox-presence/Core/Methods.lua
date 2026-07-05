local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local Settings = require(script.Parent.Parent.Config.Settings)

local Methods = {}
local playerJoinTimes = {}
local playerConnections = {}
local characterConnections = {}
local pendingChatLogs = {}
local pendingMovementSamples = {}
local pendingDeathSamples = {}
local pendingLeaveSamples = {}
local lastPlayerPositions = {}
local leaveSampledUserIds = {}
local serverStartedAt = os.time()
local chatLogCounter = 0
local movementSampleCounter = 0
local deathSampleCounter = 0
local leaveSampleCounter = 0

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

local function getMaxMovementSamplesPerPayload()
	return Settings.MaxMovementSamplesPerPayload or 200
end

local function getMaxPendingMovementSamples()
	return Settings.MaxPendingMovementSamples or 1000
end

local function getMaxDeathSamplesPerPayload()
	return Settings.MaxDeathSamplesPerPayload or 100
end

local function getMaxPendingDeathSamples()
	return Settings.MaxPendingDeathSamples or 500
end

local function getMaxLeaveSamplesPerPayload()
	return Settings.MaxLeaveSamplesPerPayload or 100
end

local function getMaxPendingLeaveSamples()
	return Settings.MaxPendingLeaveSamples or 500
end

local function getShutdownFlushTimeout()
	return Settings.ShutdownFlushTimeout or 8
end

local function roundPosition(value)
	local precision = Settings.MovementPositionPrecision or 1
	if precision <= 0 then
		return value
	end

	return math.floor((value / precision) + 0.5) * precision
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

	local character = player.Character
	local rootPart = character and character:FindFirstChild("HumanoidRootPart")
	local position = rootPart and rootPart.Position or lastPlayerPositions[player.UserId]
	if rootPart then
		lastPlayerPositions[player.UserId] = rootPart.Position
	end

	chatLogCounter += 1
	local chatLog = {
		id = game.JobId .. ":" .. tostring(chatLogCounter),
		userId = player.UserId,
		username = player.Name,
		displayName = player.DisplayName,
		message = text,
		sentAt = os.time(),
	}

	if position then
		chatLog.x = roundPosition(position.X)
		chatLog.y = roundPosition(position.Y)
		chatLog.z = roundPosition(position.Z)
	end

	table.insert(pendingChatLogs, chatLog)

	while #pendingChatLogs > getMaxPendingChatLogs() do
		table.remove(pendingChatLogs, 1)
	end

	debugWarn("Queued chat log:", player.Name, player.UserId, text, position)
end

local function queueMovementSample(player)
	local character = player.Character
	local rootPart = character and character:FindFirstChild("HumanoidRootPart")
	if not rootPart then
		return
	end

	local position = rootPart.Position
	lastPlayerPositions[player.UserId] = position
	movementSampleCounter += 1
	table.insert(pendingMovementSamples, {
		id = game.JobId .. ":move:" .. tostring(movementSampleCounter),
		userId = player.UserId,
		username = player.Name,
		displayName = player.DisplayName,
		x = roundPosition(position.X),
		y = roundPosition(position.Y),
		z = roundPosition(position.Z),
		sampledAt = os.time(),
	})

	while #pendingMovementSamples > getMaxPendingMovementSamples() do
		table.remove(pendingMovementSamples, 1)
	end
end

local function queueDeathSample(player, character)
	local rootPart = character and character:FindFirstChild("HumanoidRootPart")
	if not rootPart then
		return
	end

	local position = rootPart.Position
	lastPlayerPositions[player.UserId] = position
	deathSampleCounter += 1
	table.insert(pendingDeathSamples, {
		id = game.JobId .. ":death:" .. tostring(deathSampleCounter),
		userId = player.UserId,
		username = player.Name,
		displayName = player.DisplayName,
		x = roundPosition(position.X),
		y = roundPosition(position.Y),
		z = roundPosition(position.Z),
		diedAt = os.time(),
	})

	while #pendingDeathSamples > getMaxPendingDeathSamples() do
		table.remove(pendingDeathSamples, 1)
	end

	debugWarn("Queued death sample:", player.Name, player.UserId, position)
end

local function queueLeaveSample(player)
	local character = player.Character
	local rootPart = character and character:FindFirstChild("HumanoidRootPart")
	local position = rootPart and rootPart.Position or lastPlayerPositions[player.UserId]
	if not position or leaveSampledUserIds[player.UserId] then
		return
	end

	leaveSampledUserIds[player.UserId] = true
	leaveSampleCounter += 1
	table.insert(pendingLeaveSamples, {
		id = game.JobId .. ":leave:" .. tostring(leaveSampleCounter),
		userId = player.UserId,
		username = player.Name,
		displayName = player.DisplayName,
		x = roundPosition(position.X),
		y = roundPosition(position.Y),
		z = roundPosition(position.Z),
		leftAt = os.time(),
	})

	while #pendingLeaveSamples > getMaxPendingLeaveSamples() do
		table.remove(pendingLeaveSamples, 1)
	end

	debugWarn("Queued leave sample:", player.Name, player.UserId, position)
end

local function samplePlayerMovement()
	for _, player in Players:GetPlayers() do
		queueMovementSample(player)
	end
end

local function disconnectCharacterWatch(player)
	local connections = characterConnections[player]
	if not connections then
		return
	end

	for _, connection in connections do
		connection:Disconnect()
	end

	characterConnections[player] = nil
end

local function watchCharacter(player, character)
	disconnectCharacterWatch(player)

	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then
		local connection
		connection = character.ChildAdded:Connect(function(child)
			if child:IsA("Humanoid") then
				connection:Disconnect()
				watchCharacter(player, character)
			end
		end)

		characterConnections[player] = { connection }
		return
	end

	local diedConnection = humanoid.Died:Connect(function()
		queueDeathSample(player, character)
	end)

	characterConnections[player] = { diedConnection }
end

local function trackPlayer(player)
	playerJoinTimes[player.UserId] = playerJoinTimes[player.UserId] or os.time()
	leaveSampledUserIds[player.UserId] = nil
	debugWarn("Tracking player:", player.Name, player.UserId, "joinedAt", playerJoinTimes[player.UserId])
end

local function watchPlayer(player)
	trackPlayer(player)

	if playerConnections[player] then
		return
	end

	local chatConnection = player.Chatted:Connect(function(message)
		queueChatLog(player, message)
	end)

	local characterAddedConnection = player.CharacterAdded:Connect(function(character)
		watchCharacter(player, character)
	end)

	playerConnections[player] = { chatConnection, characterAddedConnection }

	if player.Character then
		watchCharacter(player, player.Character)
	end

	debugWarn("Watching chat for player:", player.Name, player.UserId)
end

local function untrackPlayer(player)
	debugWarn("Untracking player:", player.Name, player.UserId)
	queueLeaveSample(player)

	task.defer(function()
		Methods.SendHeartbeat()
	end)

	playerJoinTimes[player.UserId] = nil

	local connection = playerConnections[player]
	if connection then
		for _, item in connection do
			item:Disconnect()
		end
		playerConnections[player] = nil
	end

	disconnectCharacterWatch(player)
	lastPlayerPositions[player.UserId] = nil
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

	debugWarn("Heartbeat response:", "savedChatCount", payload.savedChatCount or 0, "savedMovementCount", payload.savedMovementCount or 0, "savedDeathCount", payload.savedDeathCount or 0, "savedLeaveCount", payload.savedLeaveCount or 0)
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

local function getMovementSamplesPayload()
	local movementSamples = {}
	local maxMovementSamples = getMaxMovementSamplesPerPayload()

	for index = 1, math.min(#pendingMovementSamples, maxMovementSamples) do
		table.insert(movementSamples, pendingMovementSamples[index])
	end

	return movementSamples
end

local function getDeathSamplesPayload()
	local deathSamples = {}
	local maxDeathSamples = getMaxDeathSamplesPerPayload()

	for index = 1, math.min(#pendingDeathSamples, maxDeathSamples) do
		table.insert(deathSamples, pendingDeathSamples[index])
	end

	return deathSamples
end

local function getLeaveSamplesPayload()
	local leaveSamples = {}
	local maxLeaveSamples = getMaxLeaveSamplesPerPayload()

	for index = 1, math.min(#pendingLeaveSamples, maxLeaveSamples) do
		table.insert(leaveSamples, pendingLeaveSamples[index])
	end

	return leaveSamples
end

local function clearSentChatLogs(count)
	for _ = 1, math.min(count, #pendingChatLogs) do
		table.remove(pendingChatLogs, 1)
	end
end

local function clearSentMovementSamples(count)
	for _ = 1, math.min(count, #pendingMovementSamples) do
		table.remove(pendingMovementSamples, 1)
	end
end

local function clearSentDeathSamples(count)
	for _ = 1, math.min(count, #pendingDeathSamples) do
		table.remove(pendingDeathSamples, 1)
	end
end

local function clearSentLeaveSamples(count)
	for _ = 1, math.min(count, #pendingLeaveSamples) do
		table.remove(pendingLeaveSamples, 1)
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
		movementSamples = getMovementSamplesPayload(),
		deathSamples = getDeathSamplesPayload(),
		leaveSamples = getLeaveSamplesPayload(),
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
	debugWarn("Heartbeat payload:", "endpoint", Settings.Endpoint, "universe", payload.universeId, "place", payload.placeId, "job", payload.jobId, "uptime", os.time() - serverStartedAt, "players", payload.playerCount, table.concat(playerSummaries, ", "), "chatLogs", #payload.chatLogs, "movementSamples", #payload.movementSamples, "deathSamples", #payload.deathSamples, "leaveSamples", #payload.leaveSamples)

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
	clearSentMovementSamples(#payload.movementSamples)
	clearSentDeathSamples(#payload.deathSamples)
	clearSentLeaveSamples(#payload.leaveSamples)
	processHeartbeatResponse(response)

	debugWarn("Heartbeat sent:", response.StatusCode, response.Body or "", "remainingChatLogs", #pendingChatLogs)

	return true
end

function Methods.FlushBeforeShutdown()
	for _, player in Players:GetPlayers() do
		queueLeaveSample(player)
	end

	local timeoutAt = os.clock() + getShutdownFlushTimeout()
	while sending and os.clock() < timeoutAt do
		task.wait(0.1)
	end

	if sending then
		debugWarn("Shutdown flush skipped because heartbeat is still in flight")
		return false
	end

	return Methods.SendHeartbeat()
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

	task.spawn(function()
		while true do
			samplePlayerMovement()
			task.wait(Settings.MovementSampleInterval or 2)
		end
	end)

	task.spawn(function()
		task.wait(3)

		while true do
			Methods.SendHeartbeat()
			task.wait(Settings.HeartbeatInterval)
		end
	end)

	game:BindToClose(function()
		Methods.FlushBeforeShutdown()
	end)
end

return Methods
