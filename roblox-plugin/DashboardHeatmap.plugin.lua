local HttpService = game:GetService("HttpService")
local Workspace = game:GetService("Workspace")

local DEFAULT_BASE_URL = "https://game-dashboard-zaya.onrender.com"
local FOLDER_NAME = "DashboardStudioHeatmap"
local DEFAULT_POINT_SIZE = 4
local DEFAULT_MAX_POINTS = 700
local MAP_CHUNK_TARGET_BYTES = 100000
local MAP_CHUNK_COOLDOWN_SECONDS = 0.45
local MAP_MAX_PARTS_PER_CHUNK = 750

local toolbar = plugin:CreateToolbar("Dashboard")
local toggleButton = toolbar:CreateButton(
	"Heatmap",
	"Fetch movement heatmap data from the dashboard and draw it in Workspace.",
	""
)

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Right,
	false,
	false,
	360,
	680,
	300,
	360
)

local widget = plugin:CreateDockWidgetPluginGui("DashboardHeatmapWidget", widgetInfo)
widget.Title = "Dashboard Heatmap"

local function create(className, properties, parent)
	local instance = Instance.new(className)
	for key, value in properties do
		instance[key] = value
	end
	instance.Parent = parent
	return instance
end

local root = create("Frame", {
	BackgroundColor3 = Color3.fromRGB(28, 31, 39),
	BorderSizePixel = 0,
	Size = UDim2.fromScale(1, 1),
}, widget)

create("UIPadding", {
	PaddingTop = UDim.new(0, 12),
	PaddingBottom = UDim.new(0, 12),
	PaddingLeft = UDim.new(0, 12),
	PaddingRight = UDim.new(0, 12),
}, root)

local layout = create("UIListLayout", {
	FillDirection = Enum.FillDirection.Vertical,
	SortOrder = Enum.SortOrder.LayoutOrder,
	Padding = UDim.new(0, 10),
}, root)

local function createLabel(text, order)
	return create("TextLabel", {
		BackgroundTransparency = 1,
		Font = Enum.Font.GothamMedium,
		LayoutOrder = order,
		Size = UDim2.new(1, 0, 0, 18),
		Text = text,
		TextColor3 = Color3.fromRGB(201, 209, 217),
		TextSize = 13,
		TextXAlignment = Enum.TextXAlignment.Left,
	}, root)
end

local function createInput(text, placeholder, order)
	return create("TextBox", {
		BackgroundColor3 = Color3.fromRGB(16, 20, 28),
		BorderColor3 = Color3.fromRGB(48, 54, 61),
		ClearTextOnFocus = false,
		Font = Enum.Font.Gotham,
		LayoutOrder = order,
		PlaceholderText = placeholder,
		Size = UDim2.new(1, 0, 0, 34),
		Text = text,
		TextColor3 = Color3.fromRGB(240, 246, 252),
		TextSize = 13,
		TextXAlignment = Enum.TextXAlignment.Left,
	}, root)
end

local function createButton(text, order)
	return create("TextButton", {
		BackgroundColor3 = Color3.fromRGB(35, 86, 160),
		BorderSizePixel = 0,
		Font = Enum.Font.GothamBold,
		LayoutOrder = order,
		Size = UDim2.new(1, 0, 0, 34),
		Text = text,
		TextColor3 = Color3.fromRGB(255, 255, 255),
		TextSize = 13,
	}, root)
end

local function createPresetButton(text, seconds, order)
	local button = createButton(text, order)
	button.BackgroundColor3 = Color3.fromRGB(42, 48, 60)
	button:SetAttribute("PresetSeconds", seconds)
	return button
end

createLabel("Dashboard URL", 1)
local urlInput = createInput(DEFAULT_BASE_URL, "https://game-dashboard-zaya.onrender.com", 2)

createLabel("Dashboard secret", 3)
local secretInput = createInput("", "Project Roblox secret", 4)

createLabel("Universe ID", 5)
local universeInput = createInput(game.GameId > 0 and tostring(game.GameId) or "", "Universe ID", 6)

createLabel("Player filter", 7)
local playerInput = createInput("", "Username or user ID", 8)

createLabel("From time", 9)
local fromInput = createInput("", "ISO time, epoch, or blank", 10)

createLabel("To time", 11)
local toInput = createInput("", "ISO time, epoch, or blank", 12)

local tenMinuteButton = createPresetButton("Last 10 minutes", 600, 13)
local hourButton = createPresetButton("Last 1 hour", 3600, 14)
local dayButton = createPresetButton("Last 1 day", 86400, 15)

createLabel("Max points", 16)
local maxPointsInput = createInput(tostring(DEFAULT_MAX_POINTS), "700", 17)

local exportMapButton = createButton("Export Map To Dashboard", 18)
exportMapButton.BackgroundColor3 = Color3.fromRGB(55, 121, 82)

local fetchButton = createButton("Fetch Heatmap", 19)
local clearButton = createButton("Clear Heatmap", 20)
clearButton.BackgroundColor3 = Color3.fromRGB(63, 68, 78)

local statusLabel = create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.Gotham,
	LayoutOrder = 21,
	Size = UDim2.new(1, 0, 0, 70),
	Text = "Ready.",
	TextColor3 = Color3.fromRGB(139, 148, 158),
	TextSize = 13,
	TextWrapped = true,
	TextXAlignment = Enum.TextXAlignment.Left,
	TextYAlignment = Enum.TextYAlignment.Top,
}, root)

local function setStatus(text, isError)
	statusLabel.Text = text
	statusLabel.TextColor3 = isError and Color3.fromRGB(255, 167, 167) or Color3.fromRGB(139, 148, 158)
end

local function getHeatmapFolder()
	local folder = Workspace:FindFirstChild(FOLDER_NAME)
	if folder then
		folder.Archivable = false
		return folder
	end

	folder = Instance.new("Folder")
	folder.Name = FOLDER_NAME
	folder.Archivable = false
	folder.Parent = Workspace
	return folder
end

local function clearHeatmap()
	local folder = Workspace:FindFirstChild(FOLDER_NAME)
	if folder then
		folder:ClearAllChildren()
	end
end

local function getHeatmapColor(intensity)
	local alpha = math.clamp(tonumber(intensity) or 0, 0, 1)
	local cold = Color3.fromRGB(34, 132, 255)
	local warm = Color3.fromRGB(255, 231, 76)
	local hot = Color3.fromRGB(255, 65, 54)

	if alpha < 0.5 then
		return cold:Lerp(warm, alpha / 0.5)
	end

	return warm:Lerp(hot, (alpha - 0.5) / 0.5)
end

local function renderHeatmap(heatmap)
	local points = heatmap.points
	if typeof(points) ~= "table" then
		error("Dashboard response did not include heatmap points.")
	end

	clearHeatmap()

	local folder = getHeatmapFolder()
	local maxPoints = tonumber(maxPointsInput.Text) or DEFAULT_MAX_POINTS
	local baseSize = DEFAULT_POINT_SIZE
	local rendered = 0

	for index = 1, math.min(#points, maxPoints) do
		local point = points[index]
		local x = tonumber(point.x)
		local y = tonumber(point.y)
		local z = tonumber(point.z)

		if x and y and z then
			local intensity = math.clamp(tonumber(point.intensity) or 0, 0, 1)
			local marker = Instance.new("Part")
			marker.Name = "HeatPoint_" .. tostring(index)
			marker.Archivable = false
			marker.Shape = Enum.PartType.Ball
			marker.Anchored = true
			marker.CanCollide = false
			marker.CanTouch = false
			marker.CanQuery = false
			marker.Material = Enum.Material.Neon
			marker.Color = getHeatmapColor(intensity)
			marker.Transparency = 0.12
			marker.Size = Vector3.new(1, 1, 1) * (baseSize + intensity * baseSize * 2)
			marker.Position = Vector3.new(x, y, z)
			marker:SetAttribute("SampleCount", tonumber(point.count) or 0)
			marker:SetAttribute("Intensity", intensity)
			marker.Parent = folder
			rendered += 1
		end
	end

	return rendered
end

local function buildHeatmapUrl()
	local baseUrl = urlInput.Text:gsub("%s+", "")
	baseUrl = baseUrl:gsub("/+$", "")
	local universeId = universeInput.Text:gsub("%s+", "")
	local player = playerInput.Text:gsub("^%s+", ""):gsub("%s+$", "")
	local from = fromInput.Text:gsub("^%s+", ""):gsub("%s+$", "")
	local to = toInput.Text:gsub("^%s+", ""):gsub("%s+$", "")

	if baseUrl == "" then
		error("Enter a dashboard URL.")
	end

	if universeId == "" then
		error("Enter a universe ID.")
	end

	local url = baseUrl .. "/api/roblox/heatmap?universeId=" .. HttpService:UrlEncode(universeId)
	if player ~= "" then
		url ..= "&target=" .. HttpService:UrlEncode(player)
	end
	if from ~= "" then
		url ..= "&from=" .. HttpService:UrlEncode(from)
	end
	if to ~= "" then
		url ..= "&to=" .. HttpService:UrlEncode(to)
	end

	return url
end

local function buildMapUploadUrl()
	local baseUrl = urlInput.Text:gsub("%s+", "")
	baseUrl = baseUrl:gsub("/+$", "")

	if baseUrl == "" then
		error("Enter a dashboard URL.")
	end

	return baseUrl .. "/api/roblox/map-snapshot"
end

local function getUniverseId()
	local universeId = universeInput.Text:gsub("%s+", "")
	if universeId == "" then
		error("Enter a universe ID.")
	end

	return universeId
end

local function getDashboardSecret()
	local secret = secretInput.Text:gsub("^%s+", ""):gsub("%s+$", "")
	if secret == "" then
		error("Enter the project Roblox secret before exporting the map.")
	end

	return secret
end

local function applyPreset(seconds)
	local now = os.time()
	fromInput.Text = os.date("!%Y-%m-%dT%H:%M:%SZ", now - seconds)
	toInput.Text = os.date("!%Y-%m-%dT%H:%M:%SZ", now)
end

local function fetchHeatmap()
	setStatus("Fetching heatmap...", false)

	local ok, result = pcall(function()
		local response = HttpService:RequestAsync({
			Url = buildHeatmapUrl(),
			Method = "GET",
			Headers = {
				["X-Dashboard-Secret"] = getDashboardSecret(),
			},
		})
		if not response.Success then
			error("HTTP " .. tostring(response.StatusCode) .. ": " .. tostring(response.Body))
		end

		local heatmap = HttpService:JSONDecode(response.Body)
		local rendered = renderHeatmap(heatmap)
		return {
			rendered = rendered,
			sampleCount = tonumber(heatmap.sampleCount) or 0,
			pointCount = tonumber(heatmap.pointCount) or 0,
			filters = heatmap.filters,
		}
	end)

	if not ok then
		setStatus("Fetch failed: " .. tostring(result), true)
		return
	end

	setStatus(
		"Rendered " .. tostring(result.rendered)
			.. " points from " .. tostring(result.sampleCount)
			.. " movement samples.",
		false
	)
end

local function serializeCFrame(cframe)
	return { cframe:GetComponents() }
end

local function serializeVector3(vector)
	return { vector.X, vector.Y, vector.Z }
end

local function serializeColor3(color)
	return {
		math.floor(color.R * 255 + 0.5),
		math.floor(color.G * 255 + 0.5),
		math.floor(color.B * 255 + 0.5),
	}
end

local function shouldExportPart(part)
	local heatmapFolder = Workspace:FindFirstChild(FOLDER_NAME)
	if heatmapFolder and part:IsDescendantOf(heatmapFolder) then
		return false
	end

	if part.Transparency >= 1 then
		return false
	end

	return true
end

local function serializeMapPart(part)
	local payload = {
		path = part:GetFullName(),
		name = part.Name,
		className = part.ClassName,
		material = part.Material.Name,
		color = serializeColor3(part.Color),
		transparency = part.Transparency,
		cframe = serializeCFrame(part.CFrame),
		size = serializeVector3(part.Size),
	}

	if part:IsA("Part") then
		payload.shape = part.Shape.Name
	elseif part:IsA("MeshPart") then
		payload.shape = "MeshPart"
		payload.meshId = part.MeshId
		payload.textureId = part.TextureID
	else
		payload.shape = part.ClassName
	end

	return payload
end

local function collectMapParts()
	local parts = {}

	for _, instance in Workspace:GetDescendants() do
		if instance:IsA("BasePart") and shouldExportPart(instance) then
			table.insert(parts, serializeMapPart(instance))
		end
	end

	return parts
end

local function buildMapChunks(parts, universeId, uploadId, targetBytes)
	local chunks = {}
	local current = {}

	local function makeBody(chunkParts, chunkIndex, chunkCount)
		return {
			uploadId = uploadId,
			universeId = universeId,
			placeId = game.PlaceId,
			rootName = Workspace.Name,
			exportedAt = os.date("!%Y-%m-%dT%H:%M:%SZ", os.time()),
			totalParts = #parts,
			chunkIndex = chunkIndex,
			chunkCount = chunkCount,
			parts = chunkParts,
		}
	end

	local function encodedLength(chunkParts)
		return #HttpService:JSONEncode(makeBody(chunkParts, 1, 1))
	end

	for _, part in parts do
		table.insert(current, part)

		if #current >= MAP_MAX_PARTS_PER_CHUNK or encodedLength(current) > targetBytes then
			local overflow = table.remove(current)
			if #current > 0 then
				table.insert(chunks, current)
			end
			current = { overflow }
		end
	end

	if #current > 0 then
		table.insert(chunks, current)
	end

	local bodies = {}
	for index, chunkParts in chunks do
		table.insert(bodies, makeBody(chunkParts, index, #chunks))
	end

	return bodies
end

local function postJson(url, body, secret)
	local response = HttpService:RequestAsync({
		Url = url,
		Method = "POST",
		Headers = {
			["Content-Type"] = "application/json",
			["X-Dashboard-Secret"] = secret,
		},
		Body = HttpService:JSONEncode(body),
	})

	if not response.Success then
		error("HTTP " .. tostring(response.StatusCode) .. ": " .. tostring(response.Body))
	end

	if response.Body and response.Body ~= "" then
		return HttpService:JSONDecode(response.Body)
	end

	return {}
end

local function exportMap()
	setStatus("Scanning Workspace map parts...", false)

	local ok, result = pcall(function()
		local universeId = getUniverseId()
		local secret = getDashboardSecret()
		local uploadUrl = buildMapUploadUrl()
		local parts = collectMapParts()

		if #parts == 0 then
			error("No visible BaseParts found in Workspace.")
		end

		local targetBytes = MAP_CHUNK_TARGET_BYTES
		local lastError = nil

		for attempt = 1, 5 do
			local uploadId = HttpService:GenerateGUID(false)
			local chunks = buildMapChunks(parts, universeId, uploadId, targetBytes)
			local uploadedAll = true

			for index, body in chunks do
				setStatus(
					"Uploading map chunk " .. tostring(index)
						.. "/" .. tostring(#chunks)
						.. " (" .. tostring(#body.parts) .. " parts, attempt " .. tostring(attempt) .. ")...",
					false
				)

				local uploadOk, uploadResult = pcall(function()
					return postJson(uploadUrl, body, secret)
				end)

				if not uploadOk then
					lastError = uploadResult
					uploadedAll = false
					break
				end

				task.wait(MAP_CHUNK_COOLDOWN_SECONDS)
			end

			if uploadedAll then
				return {
					partCount = #parts,
					chunkCount = #chunks,
				}
			end

			targetBytes = math.max(12000, math.floor(targetBytes / 2))
			task.wait(1)
		end

		error("Upload failed after smaller chunk retries: " .. tostring(lastError))
	end)

	if not ok then
		setStatus("Map export failed: " .. tostring(result), true)
		return
	end

	setStatus(
		"Exported " .. tostring(result.partCount)
			.. " map parts in " .. tostring(result.chunkCount)
			.. " chunk(s). Refresh the website heatmap.",
		false
	)
end

tenMinuteButton.MouseButton1Click:Connect(function()
	applyPreset(tenMinuteButton:GetAttribute("PresetSeconds"))
	fetchHeatmap()
end)

hourButton.MouseButton1Click:Connect(function()
	applyPreset(hourButton:GetAttribute("PresetSeconds"))
	fetchHeatmap()
end)

dayButton.MouseButton1Click:Connect(function()
	applyPreset(dayButton:GetAttribute("PresetSeconds"))
	fetchHeatmap()
end)

exportMapButton.MouseButton1Click:Connect(exportMap)
fetchButton.MouseButton1Click:Connect(fetchHeatmap)
clearButton.MouseButton1Click:Connect(function()
	clearHeatmap()
	setStatus("Cleared heatmap markers.", false)
end)

toggleButton.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
