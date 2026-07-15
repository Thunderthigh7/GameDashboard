local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local Settings = require(script.Parent.Parent.Config.Settings)

local Methods = {}
local SYSTEM_EVENT_NAMES = {
	player_died = true,
	player_left = true,
	chat_message = true,
}
local playerJoinTimes = {}
local playerConnections = {}
local characterConnections = {}
local pendingChatLogs = {}
local pendingMovementSamples = {}
local pendingMovementRollups = {}
local pendingMovementRollupOrder = {}
local pendingDeathSamples = {}
local pendingLeaveSamples = {}
local pendingCustomEvents = {}
local lastPlayerPositions = {}
local leaveSampledUserIds = {}
local serverStartedAt = os.time()
local runtimeEnvironment = if RunService:IsStudio() then "studio" else "production"
local chatLogCounter = 0
local movementSampleCounter = 0
local movementRollupCounter = 0
local deathSampleCounter = 0
local leaveSampleCounter = 0
local customEventCounter = 0

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

local function getMovementRollupInterval()
	return math.max(Settings.MovementRollupInterval or 60, 1)
end

local function getMovementRollupGridSize()
	return math.max(Settings.MovementRollupGridSize or 12, 1)
end

local function getMaxMovementRollupsPerPayload()
	return Settings.MaxMovementRollupsPerPayload or 300
end

local function getMaxPendingMovementRollups()
	return Settings.MaxPendingMovementRollups or 2000
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

local function getMaxCustomEventsPerPayload()
	return Settings.MaxCustomEventsPerPayload or 200
end

local function getMaxPendingCustomEvents()
	return Settings.MaxPendingCustomEvents or 1000
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

local function getPlayerSessionId(player, fallbackAt)
	if not player then
		return game.JobId
	end

	local joinedAt = playerJoinTimes[player.UserId] or fallbackAt or os.time()
	return game.JobId .. ":" .. tostring(player.UserId) .. ":" .. tostring(joinedAt)
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
	local sentAt = os.time()
	local chatLog = {
		id = game.JobId .. ":" .. tostring(chatLogCounter),
		userId = player.UserId,
		username = player.Name,
		displayName = player.DisplayName,
		sessionId = getPlayerSessionId(player, sentAt),
		message = text,
		sentAt = sentAt,
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
	local sampledAt = os.time()
	lastPlayerPositions[player.UserId] = position
	movementSampleCounter += 1

	if Settings.SendRawMovementSamples ~= false then
		table.insert(pendingMovementSamples, {
			id = game.JobId .. ":move:" .. tostring(movementSampleCounter),
			userId = player.UserId,
			username = player.Name,
			displayName = player.DisplayName,
			x = roundPosition(position.X),
			y = roundPosition(position.Y),
			z = roundPosition(position.Z),
			sampledAt = sampledAt,
		})

		while #pendingMovementSamples > getMaxPendingMovementSamples() do
			table.remove(pendingMovementSamples, 1)
		end
	end

	local bucketSize = getMovementRollupInterval()
	local gridSize = getMovementRollupGridSize()
	local bucketStart = sampledAt - (sampledAt % bucketSize)
	local gridX = math.floor(position.X / gridSize)
	local gridZ = math.floor(position.Z / gridSize)
	local rollupKey = tostring(bucketStart) .. ":" .. tostring(gridX) .. ":" .. tostring(gridZ)
	local rollup = pendingMovementRollups[rollupKey]

	if not rollup then
		movementRollupCounter += 1
		rollup = {
			id = game.JobId .. ":move-rollup:" .. tostring(movementRollupCounter),
			bucketStart = bucketStart,
			bucketSizeSeconds = bucketSize,
			gridSize = gridSize,
			gridX = gridX,
			gridZ = gridZ,
			x = 0,
			y = 0,
			z = 0,
			movementCount = 0,
			sampleCount = 0,
			uniquePlayerCount = 0,
			playerIds = {},
			sampledAt = sampledAt,
		}
		pendingMovementRollups[rollupKey] = rollup
		table.insert(pendingMovementRollupOrder, rollupKey)
	end

	local nextCount = rollup.movementCount + 1
	rollup.x = ((rollup.x * rollup.movementCount) + roundPosition(position.X)) / nextCount
	rollup.y = ((rollup.y * rollup.movementCount) + roundPosition(position.Y)) / nextCount
	rollup.z = ((rollup.z * rollup.movementCount) + roundPosition(position.Z)) / nextCount
	rollup.movementCount = nextCount
	rollup.sampleCount = nextCount
	rollup.sampledAt = sampledAt

	local playerKey = tostring(player.UserId)
	if not rollup.playerIds[playerKey] then
		rollup.playerIds[playerKey] = true
		rollup.uniquePlayerCount += 1
	end

	while #pendingMovementRollupOrder > getMaxPendingMovementRollups() do
		local removedKey = table.remove(pendingMovementRollupOrder, 1)
		pendingMovementRollups[removedKey] = nil
	end
end

local function queueDeathSample(player, character)
	local rootPart = character and character:FindFirstChild("HumanoidRootPart")
	local position = rootPart and rootPart.Position or lastPlayerPositions[player.UserId]
	if not position then
		debugWarn("Skipped death sample because no position was available:", player.Name, player.UserId)
		return
	end

	lastPlayerPositions[player.UserId] = position
	deathSampleCounter += 1
	local diedAt = os.time()
	table.insert(pendingDeathSamples, {
		id = game.JobId .. ":death:" .. tostring(deathSampleCounter),
		userId = player.UserId,
		username = player.Name,
		displayName = player.DisplayName,
		sessionId = getPlayerSessionId(player, diedAt),
		x = roundPosition(position.X),
		y = roundPosition(position.Y),
		z = roundPosition(position.Z),
		diedAt = diedAt,
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
	local leftAt = os.time()
	local joinedAt = playerJoinTimes[player.UserId] or leftAt
	table.insert(pendingLeaveSamples, {
		id = game.JobId .. ":leave:" .. tostring(leaveSampleCounter),
		userId = player.UserId,
		username = player.Name,
		displayName = player.DisplayName,
		sessionId = getPlayerSessionId(player, leftAt),
		x = roundPosition(position.X),
		y = roundPosition(position.Y),
		z = roundPosition(position.Z),
		sessionDurationSeconds = math.max(0, leftAt - joinedAt),
		leftAt = leftAt,
	})

	while #pendingLeaveSamples > getMaxPendingLeaveSamples() do
		table.remove(pendingLeaveSamples, 1)
	end

	debugWarn("Queued leave sample:", player.Name, player.UserId, position)
end

local function normalizeEventName(value)
	local eventName = string.lower(tostring(value or ""))
	if #eventName < 1 or #eventName > 64 or not string.match(eventName, "^[%a][%w_%.:%-]*$") then
		return nil
	end
	return eventName
end

local function normalizeEventProperties(value)
	if typeof(value) ~= "table" then
		return {}, false
	end

	local maxProperties = Settings.MaxCustomEventProperties or 20
	local maxPathLength = Settings.MaxCustomEventPropertyPathLength or 96
	local maxDepth = Settings.MaxCustomEventPropertyDepth or 3
	local maxArrayItems = Settings.MaxCustomEventArrayItems or 10
	local maxObservations = Settings.MaxCustomEventPropertyObservations or 40
	local maxStringLength = Settings.MaxCustomEventStringLength or 240
	local observationsByPath = {}
	local propertyCount = 0
	local observationCount = 0
	local visiting = {}
	local truncated = false

	local function isValidPath(path)
		return #path >= 1
			and #path <= maxPathLength
			and string.match(path, "^[%a][%w_%.:%-%[%]]*$") ~= nil
	end

	local function addObservation(path, rawValue)
		if not isValidPath(path) then
			truncated = true
			return
		end
		local valueType = typeof(rawValue)
		local normalizedValue = rawValue
		if valueType == "number" then
			if rawValue ~= rawValue or rawValue == math.huge or rawValue == -math.huge then
				truncated = true
				return
			end
		elseif valueType == "string" then
			if #rawValue > maxStringLength then
				truncated = true
			end
			normalizedValue = string.sub(rawValue, 1, maxStringLength)
		elseif valueType ~= "boolean" then
			truncated = true
			return
		end

		if observationCount >= maxObservations then
			truncated = true
			return
		end
		local observations = observationsByPath[path]
		if not observations then
			if propertyCount >= maxProperties then
				truncated = true
				return
			end
			observations = {}
			observationsByPath[path] = observations
			propertyCount += 1
		end
		table.insert(observations, normalizedValue)
		observationCount += 1
	end

	local function getArrayLength(entry)
		local count = 0
		local maximum = 0
		for key in entry do
			if typeof(key) ~= "number" or key < 1 or key % 1 ~= 0 then
				return nil
			end
			count += 1
			maximum = math.max(maximum, key)
		end
		if count == 0 then
			return nil
		end
		return count == maximum and maximum or nil
	end

	local visit
	visit = function(entry, path, depth)
		local valueType = typeof(entry)
		if valueType == "string" or valueType == "number" or valueType == "boolean" then
			addObservation(path, entry)
			return
		end
		if valueType ~= "table" then
			truncated = true
			return
		end
		if depth >= maxDepth or visiting[entry] then
			truncated = true
			return
		end
		visiting[entry] = true

		local arrayLength = getArrayLength(entry)
		if arrayLength then
			local arrayPath = string.find(path, "%[%]") and path or (path .. "[]")
			if arrayLength > maxArrayItems then
				truncated = true
			end
			for index = 1, math.min(arrayLength, maxArrayItems) do
				visit(entry[index], arrayPath, depth + 1)
			end
			visiting[entry] = nil
			return
		end

		local keys = {}
		for rawKey in entry do
			if typeof(rawKey) == "string" then
				table.insert(keys, rawKey)
			else
				truncated = true
			end
		end
		table.sort(keys)
		for _, key in keys do
			local childPath = path == "" and key or (path .. "." .. key)
			visit(entry[key], childPath, depth + 1)
		end
		visiting[entry] = nil
	end

	visit(value, "", 0)
	local properties = {}
	for path, observations in observationsByPath do
		if #observations == 1 then
			properties[path] = observations[1]
		else
			properties[path] = observations
		end
	end
	return properties, truncated
end

function Methods.Log(eventName, info, player)
	local normalizedName = normalizeEventName(eventName)
	if not normalizedName then
		debugWarn("Rejected custom event with invalid name:", eventName)
		return false
	end
	if SYSTEM_EVENT_NAMES[normalizedName] then
		debugWarn("Rejected reserved system event name:", normalizedName)
		return false
	end
	if player ~= nil and (typeof(player) ~= "Instance" or not player:IsA("Player")) then
		debugWarn("Rejected custom event with invalid player:", normalizedName)
		return false
	end

	local position
	if player then
		local character = player.Character
		local rootPart = character and character:FindFirstChild("HumanoidRootPart")
		position = rootPart and rootPart.Position or lastPlayerPositions[player.UserId]
		if rootPart then
			lastPlayerPositions[player.UserId] = rootPart.Position
		end
	end

	customEventCounter += 1
	local occurredAt = os.time()
	local properties, propertiesTruncated = normalizeEventProperties(info)
	local event = {
		id = game.JobId .. ":event:" .. tostring(customEventCounter),
		eventName = normalizedName,
		userId = player and player.UserId or nil,
		username = player and player.Name or nil,
		displayName = player and player.DisplayName or nil,
		sessionId = getPlayerSessionId(player, occurredAt),
		occurredAt = occurredAt,
		properties = properties,
		propertiesTruncated = propertiesTruncated or nil,
	}
	if typeof(info) == "table" and typeof(info.value) == "number" and info.value == info.value and info.value > -math.huge and info.value < math.huge then
		event.value = info.value
	end
	if position then
		event.x = roundPosition(position.X)
		event.y = roundPosition(position.Y)
		event.z = roundPosition(position.Z)
	end

	table.insert(pendingCustomEvents, event)
	while #pendingCustomEvents > getMaxPendingCustomEvents() do
		table.remove(pendingCustomEvents, 1)
	end
	if propertiesTruncated then
		debugWarn("Custom event properties reached a safety limit:", normalizedName)
	end
	debugWarn("Queued custom event:", normalizedName, player and player.Name or "server")
	return true
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

	debugWarn("Heartbeat response:", "savedChatCount", payload.savedChatCount or 0, "savedMovementCount", payload.savedMovementCount or 0, "savedDeathCount", payload.savedDeathCount or 0, "savedLeaveCount", payload.savedLeaveCount or 0, "savedCustomEventCount", payload.savedCustomEventCount or 0)
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

local function getMovementRollupsPayload()
	local movementRollups = {}
	local maxMovementRollups = getMaxMovementRollupsPerPayload()

	for index = 1, math.min(#pendingMovementRollupOrder, maxMovementRollups) do
		local rollup = pendingMovementRollups[pendingMovementRollupOrder[index]]
		if rollup then
			table.insert(movementRollups, {
				id = rollup.id,
				bucketStart = rollup.bucketStart,
				bucketSizeSeconds = rollup.bucketSizeSeconds,
				gridSize = rollup.gridSize,
				gridX = rollup.gridX,
				gridZ = rollup.gridZ,
				x = roundPosition(rollup.x),
				y = roundPosition(rollup.y),
				z = roundPosition(rollup.z),
				movementCount = rollup.movementCount,
				sampleCount = rollup.sampleCount,
				uniquePlayerCount = rollup.uniquePlayerCount,
				sampledAt = rollup.sampledAt,
			})
		end
	end

	return movementRollups
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

local function getCustomEventsPayload()
	local customEvents = {}
	local maxCustomEvents = getMaxCustomEventsPerPayload()
	local maxPayloadBytes = Settings.MaxCustomEventPayloadBytes or (96 * 1024)
	local payloadBytes = 0

	for index = 1, math.min(#pendingCustomEvents, maxCustomEvents) do
		local event = pendingCustomEvents[index]
		local encodedOk, encoded = pcall(function()
			return HttpService:JSONEncode(event)
		end)
		if encodedOk then
			local eventBytes = #encoded + 1
			if #customEvents > 0 and payloadBytes + eventBytes > maxPayloadBytes then
				break
			end
			table.insert(customEvents, event)
			payloadBytes += eventBytes
		end
	end

	return customEvents
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

local function clearSentMovementRollups(count)
	for _ = 1, math.min(count, #pendingMovementRollupOrder) do
		local key = table.remove(pendingMovementRollupOrder, 1)
		pendingMovementRollups[key] = nil
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

local function clearSentCustomEvents(count)
	for _ = 1, math.min(count, #pendingCustomEvents) do
		table.remove(pendingCustomEvents, 1)
	end
end

local function buildPayload()
	return {
		universeId = game.GameId,
		placeId = game.PlaceId,
		placeVersion = game.PlaceVersion,
		environment = runtimeEnvironment,
		jobId = game.JobId,
		serverStartedAt = serverStartedAt,
		updatedAt = os.time(),
		playerCount = #Players:GetPlayers(),
		players = getPlayersPayload(),
		chatLogs = getChatLogsPayload(),
		movementSamples = getMovementSamplesPayload(),
		movementRollups = getMovementRollupsPayload(),
		deathSamples = getDeathSamplesPayload(),
		leaveSamples = getLeaveSamplesPayload(),
		customEvents = getCustomEventsPayload(),
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
	debugWarn("Heartbeat payload:", "endpoint", Settings.Endpoint, "universe", payload.universeId, "place", payload.placeId, "placeVersion", payload.placeVersion, "environment", payload.environment, "job", payload.jobId, "uptime", os.time() - serverStartedAt, "players", payload.playerCount, table.concat(playerSummaries, ", "), "chatLogs", #payload.chatLogs, "movementSamples", #payload.movementSamples, "movementRollups", #payload.movementRollups, "deathSamples", #payload.deathSamples, "leaveSamples", #payload.leaveSamples, "customEvents", #payload.customEvents)

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
	clearSentMovementRollups(#payload.movementRollups)
	clearSentDeathSamples(#payload.deathSamples)
	clearSentLeaveSamples(#payload.leaveSamples)
	clearSentCustomEvents(#payload.customEvents)
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

	debugWarn("Starting:", "script", script:GetFullName(), "universe", game.GameId, "place", game.PlaceId, "placeVersion", game.PlaceVersion, "environment", runtimeEnvironment, "job", game.JobId)
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
