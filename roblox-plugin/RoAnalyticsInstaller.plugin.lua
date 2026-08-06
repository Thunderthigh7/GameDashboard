local ChangeHistoryService = game:GetService("ChangeHistoryService")
local HttpService = game:GetService("HttpService")
local ScriptEditorService = game:GetService("ScriptEditorService")
local ServerScriptService = game:GetService("ServerScriptService")

local DASHBOARD_BASE_URL = "https://game-dashboard-zaya.onrender.com"
local PAIRING_POLL_SECONDS = 2

local toolbar = plugin:CreateToolbar("RoAnalytics")
local toggleButton = toolbar:CreateButton(
	"RoAnalytics Installer",
	"Pair this experience and install or update the RoAnalytics server package.",
	""
)

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Right,
	false,
	false,
	390,
	330,
	330,
	260
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
	Text = "Connect this game on the website, then approve the matching code. The complete server package and secret are installed automatically.",
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
	Text = "PAIRING CODE",
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
	Text = "Pair & Install",
	TextColor3 = Color3.fromRGB(255, 255, 255),
	TextSize = 13,
}, root)
create("UICorner", { CornerRadius = UDim.new(0, 8) }, installButton)

local statusLabel = create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.Gotham,
	LayoutOrder = 5,
	Size = UDim2.new(1, 0, 0, 72),
	Text = "Open a published experience, then start pairing.",
	TextColor3 = Color3.fromRGB(148, 163, 184),
	TextSize = 12,
	TextWrapped = true,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextYAlignment = Enum.TextYAlignment.Top,
}, root)

local pairingGeneration = 0

local function setStatus(text, state)
	statusLabel.Text = text
	statusLabel.TextColor3 = if state == "error"
		then Color3.fromRGB(252, 165, 165)
		elseif state == "success"
		then Color3.fromRGB(134, 239, 172)
		else Color3.fromRGB(148, 163, 184)
end

local function postJson(url, body)
	local response = HttpService:RequestAsync({
		Url = url,
		Method = "POST",
		Headers = { ["Content-Type"] = "application/json" },
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
				setStatus("Install failed: " .. tostring(installError), "error")
				return
			end
			codeLabel.Text = "INSTALLED"
			local nextStep = if HttpService.HttpEnabled
				then "Publish the game to activate it."
				else "Enable Allow HTTP Requests under Experience Settings > Security, then publish the game."
			setStatus("RoAnalytics is installed in ServerScriptService with the secret already configured. " .. nextStep, "success")
			return
		elseif not ok then
			installButton.Active = true
			installButton.Text = "Try Again"
			setStatus("Pairing failed: " .. tostring(result), "error")
			return
		end
	end
	if generation == pairingGeneration then
		installButton.Active = true
		installButton.Text = "Start New Pairing"
		setStatus("The pairing code expired. Start a new pairing and approve it on the website.", "error")
	end
end

local function startPairing()
	pairingGeneration += 1
	local generation = pairingGeneration
	installButton.Active = false
	installButton.Text = "Starting..."
	codeLabel.Text = "---- ----"
	setStatus("Contacting the RoAnalytics website...", "")

	local ok, result = pcall(function()
		return postJson(DASHBOARD_BASE_URL .. "/api/roblox/studio-pairings", {
			universeId = getUniverseId(),
			placeId = game.PlaceId,
		})
	end)
	if not ok then
		installButton.Active = true
		installButton.Text = "Try Again"
		setStatus("Could not start pairing: " .. tostring(result), "error")
		return
	end

	codeLabel.Text = tostring(result.code or "---- ----")
	installButton.Text = "Waiting for Approval..."
	setStatus("On RoAnalytics, open Connect Universe and approve the request showing this exact code.", "")
	task.spawn(
		pollPairing,
		generation,
		tostring(result.pairingId or ""),
		tostring(result.claimToken or ""),
		tonumber(result.expiresAt) or 0
	)
end

installButton.MouseButton1Click:Connect(startPairing)
toggleButton.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
