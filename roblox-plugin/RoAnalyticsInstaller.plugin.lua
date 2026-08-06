local ChangeHistoryService = game:GetService("ChangeHistoryService")
local DataStoreService = game:GetService("DataStoreService")
local HttpService = game:GetService("HttpService")
local ScriptEditorService = game:GetService("ScriptEditorService")
local ServerScriptService = game:GetService("ServerScriptService")

local DASHBOARD_BASE_URL = "https://game-dashboard-zaya.onrender.com"
local PAIRING_POLL_SECONDS = 2
local PLAYER_DATA_RELAY_POLL_SECONDS = 2
local PLAYER_DATA_RELAY_RETRY_SECONDS = 5
local MAX_PLAYER_DATA_JSON_BYTES = 256 * 1024
local MAX_CATALOG_DATA_STORES = 100
local MAX_CATALOG_SAMPLE_KEYS = 10
local CATALOG_LIST_DELAY_SECONDS = 12

local toolbar = plugin:CreateToolbar("RoAnalytics")
local toggleButton = toolbar:CreateButton(
	"RoAnalytics Installer",
	"Connect this experience and install RoAnalytics in one click.",
	""
)

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Right,
	false,
	false,
	390,
	410,
	330,
	360
)
local widget = plugin:CreateDockWidgetPluginGui("RoAnalyticsInstallerWidget", widgetInfo)
widget.Title = "RoAnalytics Installer"

local function create(className, properties, parent)
	local instance = Instance.new(className)
	for key, value in properties do
		instance[key] = value
	end
	instance.Parent = parent
	return instance
end

local root = create("Frame", {
	BackgroundColor3 = Color3.fromRGB(15, 20, 33),
	BorderSizePixel = 0,
	Size = UDim2.fromScale(1, 1),
}, widget)

create("UIPadding", {
	PaddingTop = UDim.new(0, 18),
	PaddingBottom = UDim.new(0, 18),
	PaddingLeft = UDim.new(0, 18),
	PaddingRight = UDim.new(0, 18),
}, root)

create("UIListLayout", {
	FillDirection = Enum.FillDirection.Vertical,
	SortOrder = Enum.SortOrder.LayoutOrder,
	Padding = UDim.new(0, 12),
}, root)

create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.GothamBold,
	LayoutOrder = 1,
	Size = UDim2.new(1, 0, 0, 26),
	Text = "Install RoAnalytics",
	TextColor3 = Color3.fromRGB(248, 250, 252),
	TextSize = 20,
	TextXAlignment = Enum.TextXAlignment.Left,
}, root)

create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.Gotham,
	LayoutOrder = 2,
	Size = UDim2.new(1, 0, 0, 54),
	Text = "Connect this experience and install RoAnalytics automatically. Player-data discovery is optional and stays available in the plugin.",
	TextColor3 = Color3.fromRGB(148, 163, 184),
	TextSize = 13,
	TextWrapped = true,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextYAlignment = Enum.TextYAlignment.Top,
}, root)

local codeCard = create("Frame", {
	BackgroundColor3 = Color3.fromRGB(24, 31, 49),
	BorderSizePixel = 0,
	LayoutOrder = 3,
	Size = UDim2.new(1, 0, 0, 68),
}, root)
create("UICorner", { CornerRadius = UDim.new(0, 9) }, codeCard)

create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.GothamMedium,
	Position = UDim2.fromOffset(12, 9),
	Size = UDim2.new(1, -24, 0, 16),
	Text = "INSTALL STATUS",
	TextColor3 = Color3.fromRGB(139, 92, 246),
	TextSize = 10,
	TextXAlignment = Enum.TextXAlignment.Left,
}, codeCard)

local codeLabel = create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.Code,
	Position = UDim2.fromOffset(12, 26),
	Size = UDim2.new(1, -24, 0, 32),
	Text = "---- ----",
	TextColor3 = Color3.fromRGB(226, 232, 240),
	TextSize = 23,
	TextXAlignment = Enum.TextXAlignment.Left,
}, codeCard)

local installButton = create("TextButton", {
	BackgroundColor3 = Color3.fromRGB(124, 58, 237),
	BorderSizePixel = 0,
	Font = Enum.Font.GothamBold,
	LayoutOrder = 4,
	Size = UDim2.new(1, 0, 0, 40),
	Text = "Connect & Install",
	TextColor3 = Color3.fromRGB(255, 255, 255),
	TextSize = 13,
}, root)
create("UICorner", { CornerRadius = UDim.new(0, 8) }, installButton)

local statusLabel = create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.Gotham,
	LayoutOrder = 5,
	Size = UDim2.new(1, 0, 0, 72),
	Text = "Start pairing. The website now auto-approves this request and sends the package back automatically.",
	TextColor3 = Color3.fromRGB(148, 163, 184),
	TextSize = 12,
	TextWrapped = true,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextYAlignment = Enum.TextYAlignment.Top,
}, root)

local pairingGeneration = 0
local pairingActive = false
local relayGeneration = 0
local relayConnected = false
local catalogScanActive = false

local function trim(value)
	return string.match(tostring(value or ""), "^%s*(.-)%s*$") or ""
end

local settingsSuffix = tostring(game.GameId)
local relayCredential = tostring(plugin:GetSetting("RoAnalyticsRelayCredential_" .. settingsSuffix) or "")
local relayId = tostring(plugin:GetSetting("RoAnalyticsRelayId_" .. settingsSuffix) or "")
if relayId == "" then
	relayId = HttpService:GenerateGUID(false)
	plugin:SetSetting("RoAnalyticsRelayId_" .. settingsSuffix, relayId)
end

local function setStatus(text, state)
	statusLabel.Text = text
	statusLabel.TextColor3 = if state == "error"
		then Color3.fromRGB(252, 165, 165)
		elseif state == "success"
		then Color3.fromRGB(134, 239, 172)
		else Color3.fromRGB(148, 163, 184)
end

local function postJson(url, body, extraHeaders)
	local headers = { ["Content-Type"] = "application/json" }
	if typeof(extraHeaders) == "table" then
		for key, value in extraHeaders do
			headers[tostring(key)] = tostring(value)
		end
	end
	local response = HttpService:RequestAsync({
		Url = url,
		Method = "POST",
		Headers = headers,
		Body = HttpService:JSONEncode(body),
	})
	local decoded = {}
	if tostring(response.Body or "") ~= "" then
		local ok, value = pcall(function()
			return HttpService:JSONDecode(response.Body)
		end)
		if ok and typeof(value) == "table" then
			decoded = value
		end
	end
	if not response.Success then
		error(tostring(decoded.error or ("Website request failed with HTTP " .. tostring(response.StatusCode))))
	end
	return decoded
end

local function scriptNameFromPath(filePath)
	local fileName = string.match(filePath, "([^/]+)$") or filePath
	return fileName:gsub("%.server%.lua$", ""):gsub("%.lua$", "")
end

local function getOrCreateFolder(parent, name)
	local existing = parent:FindFirstChild(name)
	if existing then
		if not existing:IsA("Folder") then
			error("Cannot install because " .. existing:GetFullName() .. " is not a Folder.")
		end
		return existing
	end
	return create("Folder", { Name = name }, parent)
end

local function createPackageFile(rootFolder, file)
	local filePath = tostring(file.path or "")
	if not string.match(filePath, "^[%w_./%-]+$")
		or string.find(filePath, "..", 1, true)
		or string.sub(filePath, 1, 1) == "/"
		or string.sub(filePath, -1) == "/"
	then
		error("Installer returned an invalid package path.")
	end
	local className = tostring(file.className or "")
	if className ~= "ModuleScript" and className ~= "Script" then
		error("Installer returned an unsupported script class.")
	end
	if typeof(file.source) ~= "string" then
		error("Installer returned missing script source.")
	end

	local segments = string.split(filePath, "/")
	local parent = rootFolder
	for index = 1, #segments - 1 do
		parent = getOrCreateFolder(parent, segments[index])
	end
	local scriptObject = Instance.new(className)
	scriptObject.Name = scriptNameFromPath(filePath)
	if scriptObject:IsA("Script") then
		scriptObject.Enabled = false
	end
	scriptObject.Parent = parent
	ScriptEditorService:UpdateSourceAsync(scriptObject, function()
		return file.source
	end)
	return scriptObject
end

local function installPackage(package)
	if typeof(package) ~= "table" or package.name ~= "RoAnalytics" or typeof(package.files) ~= "table" then
		error("The website returned an invalid RoAnalytics package.")
	end
	local recording = ChangeHistoryService:TryBeginRecording("Install RoAnalytics")
	if not recording then
		error("Studio could not start an undo recording. Try again after the current plugin operation finishes.")
	end

	local temporaryName = "RoAnalytics_Installing_" .. HttpService:GenerateGUID(false):gsub("%-", "")
	local temporaryFolder = create("Folder", {
		Name = temporaryName,
	}, ServerScriptService)
	local createdScripts = {}
	local ok, installError = pcall(function()
		for _, file in package.files do
			table.insert(createdScripts, createPackageFile(temporaryFolder, file))
		end
		local existing = ServerScriptService:FindFirstChild("RoAnalytics")
		if existing then
			existing:Destroy()
		end
		temporaryFolder.Name = "RoAnalytics"
		temporaryFolder:SetAttribute("InstallerVersion", tostring(package.version or ""))
		for _, scriptObject in createdScripts do
			if scriptObject:IsA("Script") then
				scriptObject.Enabled = true
			end
		end
	end)

	if ok then
		ChangeHistoryService:FinishRecording(recording, Enum.FinishRecordingOperation.Commit)
		return
	end
	if temporaryFolder.Parent then
		temporaryFolder:Destroy()
	end
	ChangeHistoryService:FinishRecording(recording, Enum.FinishRecordingOperation.Cancel)
	error(installError)
end

local function getUniverseId()
	if game.GameId <= 0 then
		error("Publish or open the experience under its Roblox universe before pairing.")
	end
	return game.GameId
end

local function getPlayerDataLocation(request)
	local dataStoreName = trim(request.dataStoreName)
	local keyPrefix = trim(request.keyPrefix)
	if dataStoreName == "" or #dataStoreName > 50 then
		error("The website did not send a valid discovered DataStore name.")
	end
	if #keyPrefix > 40 then
		error("The discovered player-key prefix is too long.")
	end
	local numericUserId = tonumber(request.userId)
	if not numericUserId or numericUserId <= 0 then
		error("The website sent an invalid Roblox user ID.")
	end
	local key = keyPrefix .. tostring(math.floor(numericUserId))
	if #key > 50 then
		error("The discovered player DataStore key exceeds Roblox's 50-byte limit.")
	end
	return dataStoreName, key
end

local function isJsonDataStoreValue(value)
	local valueType = typeof(value)
	return valueType == "table" or valueType == "string" or valueType == "number" or valueType == "boolean"
end

local function sendStudioPlayerDataResult(pollResult, request, status, data, version, encoding, errorMessage)
	return postJson(DASHBOARD_BASE_URL .. "/api/roblox/player-data/results", {
		universeId = getUniverseId(),
		requestId = tostring(request.id or ""),
		jobId = tostring(pollResult.relayJobId or ""),
		status = status,
		data = data,
		version = tostring(version or ""),
		encoding = tostring(encoding or "native"),
		error = tostring(errorMessage or ""),
	}, {
		["X-Dashboard-Secret"] = relayCredential,
	})
end

local function processStudioPlayerDataRequest(pollResult)
	local request = pollResult.request
	if typeof(request) ~= "table" then
		return
	end
	local requestId = tostring(request.id or "")
	local operation = tostring(request.operation or "")
	if requestId == "" or (operation ~= "read" and operation ~= "write") then
		return
	end

	setStatus("Player Data request received. Accessing the selected DataStore...", "")
	local operationOk, operationResult = pcall(function()
		local dataStoreName, key = getPlayerDataLocation(request)
		local dataStore = DataStoreService:GetDataStore(dataStoreName)
		if operation == "read" then
			local options = Instance.new("DataStoreGetOptions")
			options.UseCache = false
			local data, keyInfo = dataStore:GetAsync(key, options)
			if data == nil then
				error("No player data exists at key " .. key .. ".")
			end
			if not isJsonDataStoreValue(data) then
				error("The player key must contain a JSON-compatible value.")
			end
			local resultData = data
			local resultEncoding = "native"
			if typeof(data) == "string" then
				local decodedOk, decoded = pcall(function()
					return HttpService:JSONDecode(data)
				end)
				if decodedOk and isJsonDataStoreValue(decoded) then
					resultData = decoded
					resultEncoding = "json_string"
				end
			end
			local encoded = HttpService:JSONEncode(resultData)
			if #encoded > MAX_PLAYER_DATA_JSON_BYTES then
				error("The player data is larger than the website's 256 KiB limit.")
			end
			return {
				data = resultData,
				encoding = resultEncoding,
				version = if keyInfo then keyInfo.Version else "",
			}
		end

		if not isJsonDataStoreValue(request.data) then
			error("The website update did not contain a JSON-compatible value.")
		end
		local storedData = request.data
		if tostring(request.dataEncoding or "") == "json_string" then
			storedData = HttpService:JSONEncode(request.data)
		end
		local expectedVersion = tostring(request.expectedVersion or "")
		local rejection = nil
		local updatedData, updatedKeyInfo = dataStore:UpdateAsync(key, function(currentData, currentKeyInfo)
			if currentData == nil then
				rejection = "That player-data key no longer exists. Reload before saving."
				return nil
			end
			local currentVersion = if currentKeyInfo then tostring(currentKeyInfo.Version) else ""
			if expectedVersion ~= "" and currentVersion ~= expectedVersion then
				rejection = "Player data changed after it was loaded. Reload before saving."
				return nil
			end
			local userIds = if currentKeyInfo then currentKeyInfo:GetUserIds() else { tonumber(request.userId) }
			local metadata = if currentKeyInfo then currentKeyInfo:GetMetadata() else {}
			return storedData, userIds, metadata
		end)
		if rejection then
			error(rejection)
		end
		if updatedData == nil then
			error("Roblox cancelled the DataStore update. Reload and try again.")
		end
		return {
			version = if updatedKeyInfo then updatedKeyInfo.Version else "",
		}
	end)

	if operationOk then
		local sent, sendError = pcall(
			sendStudioPlayerDataResult,
			pollResult,
			request,
			"completed",
			operationResult.data,
			operationResult.version,
			operationResult.encoding,
			nil
		)
		if sent then
			setStatus("Player Data " .. operation .. " completed through the Studio plugin.", "success")
		else
			setStatus("DataStore operation completed, but the website result failed: " .. tostring(sendError), "error")
		end
		return
	end

	local failureMessage = "Studio DataStore access failed: " .. tostring(operationResult)
	local sent, sendError = pcall(
		sendStudioPlayerDataResult,
		pollResult,
		request,
		"failed",
		nil,
		nil,
		nil,
		failureMessage
	)
	if sent then
		setStatus(failureMessage .. " Enable Studio Access to API Services under Experience Settings > Security.", "error")
	else
		setStatus(failureMessage .. " The error result also could not reach the website: " .. tostring(sendError), "error")
	end
end

local function uploadStudioDataStoreCatalog(stores, complete, errorMessage)
	return postJson(DASHBOARD_BASE_URL .. "/api/roblox/studio-player-data/catalog", {
		universeId = getUniverseId(),
		placeId = game.PlaceId,
		relayId = relayId,
		stores = stores,
		complete = complete == true,
		error = tostring(errorMessage or ""),
	}, {
		["X-Dashboard-Secret"] = relayCredential,
	})
end

local function discoverStudioDataStores(generation)
	if catalogScanActive or relayCredential == "" then
		return
	end
	catalogScanActive = true
	setStatus("Discovering standard DataStores and player-key patterns...", "")
	local scanOk, scanError = pcall(function()
		local stores = {}
		local seenStoreNames = {}
		local pages = DataStoreService:ListDataStoresAsync("", MAX_CATALOG_DATA_STORES)
		while generation == relayGeneration do
			for _, info in pages:GetCurrentPage() do
				local name = tostring(info.DataStoreName or "")
				if name ~= "" and not seenStoreNames[name] and #stores < MAX_CATALOG_DATA_STORES then
					seenStoreNames[name] = true
					table.insert(stores, { name = name, sampleKeys = {} })
				end
			end
			if #stores >= MAX_CATALOG_DATA_STORES or pages.IsFinished then
				break
			end
			task.wait(CATALOG_LIST_DELAY_SECONDS)
			pages:AdvanceToNextPageAsync()
		end
		if generation ~= relayGeneration then
			return
		end
		table.sort(stores, function(left, right)
			return left.name < right.name
		end)
		uploadStudioDataStoreCatalog(stores, #stores == 0, "")

		for index, store in stores do
			if generation ~= relayGeneration then
				return
			end
			if index > 1 then
				task.wait(CATALOG_LIST_DELAY_SECONDS)
			end
			local keysOk, keysOrError = pcall(function()
				local keyPages = DataStoreService:GetDataStore(store.name):ListKeysAsync(
					"",
					MAX_CATALOG_SAMPLE_KEYS,
					nil,
					true
				)
				local keys = {}
				for _, keyInfo in keyPages:GetCurrentPage() do
					if #keys >= MAX_CATALOG_SAMPLE_KEYS then
						break
					end
					table.insert(keys, tostring(keyInfo.KeyName or ""))
				end
				return keys
			end)
			if keysOk then
				store.sampleKeys = keysOrError
				store.error = nil
			else
				store.error = tostring(keysOrError)
			end
			uploadStudioDataStoreCatalog(stores, index == #stores, "")
		end
	end)
	catalogScanActive = false
	if generation ~= relayGeneration then
		return
	end
	if scanOk then
		setStatus("DataStore discovery finished. Player Data is ready on the website.", "success")
	else
		pcall(uploadStudioDataStoreCatalog, {}, false, tostring(scanError))
		setStatus(
			"DataStore discovery failed: " .. tostring(scanError) .. " Enable Studio Access to API Services, then scan again from the website.",
			"error"
		)
	end
end

local function pollStudioPlayerDataRelay(generation)
	while generation == relayGeneration do
		local ok, result = pcall(function()
			return postJson(DASHBOARD_BASE_URL .. "/api/roblox/studio-player-data/poll", {
				universeId = getUniverseId(),
				placeId = game.PlaceId,
				relayId = relayId,
			}, {
				["X-Dashboard-Secret"] = relayCredential,
			})
		end)
		if generation ~= relayGeneration then
			return
		end
		if ok then
			relayConnected = true
			if result.refreshCatalog == true and not catalogScanActive then
				task.spawn(discoverStudioDataStores, generation)
			end
			if not pairingActive and not catalogScanActive and typeof(result.request) ~= "table" then
				setStatus(
					"Studio Player Data is connected. Keep this experience open to load and save offline players without a live server.",
					"success"
				)
			end
			if typeof(result.request) == "table" then
				processStudioPlayerDataRequest(result)
			end
			task.wait(math.max(tonumber(result.pollAfterSeconds) or PLAYER_DATA_RELAY_POLL_SECONDS, 1))
		else
			relayConnected = false
			if not pairingActive then
				setStatus("Studio Player Data disconnected: " .. tostring(result), "error")
			end
			task.wait(PLAYER_DATA_RELAY_RETRY_SECONDS)
		end
	end
end

local function startStudioPlayerDataRelay(credential)
	relayCredential = trim(credential)
	if relayCredential == "" or game.GameId <= 0 then
		return false
	end
	plugin:SetSetting("RoAnalyticsRelayCredential_" .. settingsSuffix, relayCredential)
	relayGeneration += 1
	relayConnected = false
	task.spawn(pollStudioPlayerDataRelay, relayGeneration)
	task.spawn(discoverStudioDataStores, relayGeneration)
	return true
end

local function pollPairing(generation, pairingId, claimToken, expiresAt)
	while generation == pairingGeneration and DateTime.now().UnixTimestampMillis < expiresAt do
		task.wait(PAIRING_POLL_SECONDS)
		if generation ~= pairingGeneration then
			return
		end
		local ok, result = pcall(function()
			return postJson(
				DASHBOARD_BASE_URL .. "/api/roblox/studio-pairings/" .. HttpService:UrlEncode(pairingId) .. "/claim",
				{ claimToken = claimToken }
			)
		end)
		if ok and result.status == "approved" and typeof(result.package) == "table" then
			setStatus("Approval received. Installing the current server package...", "")
			local installed, installError = pcall(installPackage, result.package)
			installButton.Active = true
			installButton.Text = "Update RoAnalytics"
			if not installed then
				pairingActive = false
				setStatus("Install failed: " .. tostring(installError), "error")
				return
			end
			codeLabel.Text = "INSTALLED"
			pairingActive = false
			local studioRelay = result.studioRelay
			if typeof(studioRelay) == "table"
				and startStudioPlayerDataRelay(tostring(studioRelay.credential or ""))
			then
				setStatus(
					"RoAnalytics is installed. Enable Allow HTTP Requests and publish for live analytics. Player relay needs Studio Access to API Services.",
					"success"
				)
			else
				setStatus("RoAnalytics installed, but the Studio Player Data credential was missing. Pair again.", "error")
			end
			return
		elseif not ok then
			pairingActive = false
			installButton.Active = true
			installButton.Text = "Try Again"
			setStatus("Pairing failed: " .. tostring(result), "error")
			return
		end
	end
	if generation == pairingGeneration then
		pairingActive = false
		installButton.Active = true
		installButton.Text = "Start New Pairing"
		setStatus("Pairing timed out. Click Connect & Install to try again.", "error")
	end
end

local function startPairing()
	pairingGeneration += 1
	local generation = pairingGeneration
	pairingActive = true
	installButton.Active = false
	installButton.Text = "Starting..."
	codeLabel.Text = "---- ----"
	setStatus("Contacting the RoAnalytics website...", "")

	local ok, result = pcall(function()
		return postJson(DASHBOARD_BASE_URL .. "/api/roblox/studio-pairings", {
			universeId = getUniverseId(),
			placeId = game.PlaceId,
			gameName = game.Name,
		})
	end)
	if not ok then
		pairingActive = false
		installButton.Active = true
		installButton.Text = "Try Again"
		setStatus("Could not start pairing: " .. tostring(result), "error")
		return
	end
	codeLabel.Text = tostring(result.code or "Auto install")
	installButton.Text = "Waiting for package..."
	setStatus("RoAnalytics accepted the request. Waiting for package delivery.", "")
	task.spawn(
		pollPairing,
		generation,
		tostring(result.pairingId or ""),
		tostring(result.claimToken or ""),
		tonumber(result.expiresAt) or 0
	)
end

if relayCredential ~= "" and game.GameId > 0 then
	setStatus("Reconnecting Studio Player Data...", "")
	startStudioPlayerDataRelay(relayCredential)
end

installButton.MouseButton1Click:Connect(startPairing)
toggleButton.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
plugin.Unloading:Connect(function()
	relayGeneration += 1
	pairingGeneration += 1
end)
