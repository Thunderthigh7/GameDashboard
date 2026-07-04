local HttpService = game:GetService("HttpService")
local MessagingService = game:GetService("MessagingService")
local Players = game:GetService("Players")
local TeleportService = game:GetService("TeleportService")
local TextService = game:GetService("TextService")

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
local processedCommandIds = {}
local serverStartedAt = os.time()
local chatLogCounter = 0
local movementSampleCounter = 0
local deathSampleCounter = 0
local leaveSampleCounter = 0

local COMMAND_TOPIC_PREFIX = "dashboard-command-"
local KICK_COMMAND_TOPIC = "kick"
local ANNOUNCEMENT_TOPIC = Settings.AnnouncementTopic or "dashboard-global-announcement"
local ANNOUNCEMENT_GUI_NAME = "DashboardGlobalAnnouncement"
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

local function trimAnnouncementMessage(message)
	local text = tostring(message or "")
	local maxLength = Settings.MaxAnnouncementLength or 240

	if #text > maxLength then
		return string.sub(text, 1, maxLength)
	end

	return text
end

local function getAnnouncementDuration(command)
	local duration = tonumber(command.durationSeconds) or Settings.AnnouncementDuration or 6
	return math.clamp(duration, 3, 20)
end

local function filterAnnouncementMessage(message, fromUserId)
	local numericUserId = tonumber(fromUserId)
	if not numericUserId or numericUserId <= 0 then
		debugWarn("Announcement skipped because requestedBy is missing or invalid")
		return nil
	end

	local ok, result = pcall(function()
		local filterResult = TextService:FilterStringAsync(message, numericUserId, Enum.TextFilterContext.PublicChat)
		return filterResult:GetNonChatStringForBroadcastAsync()
	end)

	if not ok then
		debugWarn("Announcement skipped because filtering failed:", result)
		return nil
	end

	return result
end

local function showAnnouncement(player, message, duration, commandId)
	local playerGui = player:FindFirstChildOfClass("PlayerGui")
	if not playerGui then
		return
	end

	local existing = playerGui:FindFirstChild(ANNOUNCEMENT_GUI_NAME)
	if existing then
		existing:Destroy()
	end

	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = ANNOUNCEMENT_GUI_NAME
	screenGui.ResetOnSpawn = false
	screenGui.IgnoreGuiInset = true
	screenGui.DisplayOrder = 1000
	screenGui:SetAttribute("CommandId", commandId or "")
	screenGui.Parent = playerGui

	local frame = Instance.new("Frame")
	frame.Name = "MessageFrame"
	frame.AnchorPoint = Vector2.new(0.5, 0)
	frame.Position = UDim2.new(0.5, 0, 0, 28)
	frame.Size = UDim2.new(0.9, 0, 0, 92)
	frame.BackgroundColor3 = Color3.fromRGB(15, 19, 28)
	frame.BackgroundTransparency = 0.08
	frame.BorderSizePixel = 0
	frame.Parent = screenGui

	local sizeLimit = Instance.new("UISizeConstraint")
	sizeLimit.MaxSize = Vector2.new(620, 120)
	sizeLimit.MinSize = Vector2.new(260, 72)
	sizeLimit.Parent = frame

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 10)
	corner.Parent = frame

	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(80, 142, 255)
	stroke.Thickness = 2
	stroke.Transparency = 0.15
	stroke.Parent = frame

	local padding = Instance.new("UIPadding")
	padding.PaddingTop = UDim.new(0, 14)
	padding.PaddingBottom = UDim.new(0, 14)
	padding.PaddingLeft = UDim.new(0, 18)
	padding.PaddingRight = UDim.new(0, 18)
	padding.Parent = frame

	local label = Instance.new("TextLabel")
	label.Name = "Message"
	label.BackgroundTransparency = 1
	label.Size = UDim2.fromScale(1, 1)
	label.Font = Enum.Font.GothamBold
	label.Text = message
	label.TextColor3 = Color3.fromRGB(245, 248, 255)
	label.TextSize = 24
	label.TextWrapped = true
	label.TextXAlignment = Enum.TextXAlignment.Center
	label.TextYAlignment = Enum.TextYAlignment.Center
	label.Parent = frame

	task.delay(duration, function()
		if screenGui.Parent and screenGui:GetAttribute("CommandId") == (commandId or "") then
			screenGui:Destroy()
		end
	end)
end

local function processAnnouncementCommand(command)
	local message = trimAnnouncementMessage(command.message)
	if message == "" then
		return
	end

	local filteredMessage = filterAnnouncementMessage(message, command.requestedBy)
	if not filteredMessage or filteredMessage == "" then
		return
	end

	local duration = getAnnouncementDuration(command)
	local shownCount = 0
	local targetUserIds = {}
	local targetServerUserIds = {}

	for _, userId in command.playerUserIds or {} do
		local numericUserId = tonumber(userId)
		if numericUserId then
			targetUserIds[numericUserId] = true
		end
	end

	for _, userId in command.targetServerUserIds or {} do
		local numericUserId = tonumber(userId)
		if numericUserId then
			targetServerUserIds[numericUserId] = true
		end
	end

	if next(targetServerUserIds) ~= nil then
		local targetFoundInServer = false
		for _, player in Players:GetPlayers() do
			if targetServerUserIds[player.UserId] then
				targetFoundInServer = true
				break
			end
		end

		if not targetFoundInServer then
			return
		end
	end

	for _, player in Players:GetPlayers() do
		if next(targetUserIds) ~= nil and not targetUserIds[player.UserId] then
			continue
		end

		showAnnouncement(player, filteredMessage, duration, command.id)
		shownCount += 1
	end

	debugWarn("Global announcement shown:", shownCount, "player(s)")
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
	elseif command.type == "globalAnnouncement" then
		processAnnouncementCommand(command)
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
	subscribeToTopic(ANNOUNCEMENT_TOPIC)
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

	subscribeToCommandTopics()

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
