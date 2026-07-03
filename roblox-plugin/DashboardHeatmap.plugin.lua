local HttpService = game:GetService("HttpService")
local Workspace = game:GetService("Workspace")

local DEFAULT_BASE_URL = "https://game-dashboard-zaya.onrender.com"
local FOLDER_NAME = "DashboardStudioHeatmap"
local DEFAULT_POINT_SIZE = 4
local DEFAULT_MAX_POINTS = 700

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
	360,
	300,
	260
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

createLabel("Dashboard URL", 1)
local urlInput = createInput(DEFAULT_BASE_URL, "https://game-dashboard-zaya.onrender.com", 2)

createLabel("Universe ID", 3)
local universeInput = createInput(game.GameId > 0 and tostring(game.GameId) or "", "Universe ID", 4)

createLabel("Max points", 5)
local maxPointsInput = createInput(tostring(DEFAULT_MAX_POINTS), "700", 6)

local fetchButton = createButton("Fetch Heatmap", 7)
local clearButton = createButton("Clear Heatmap", 8)
clearButton.BackgroundColor3 = Color3.fromRGB(63, 68, 78)

local statusLabel = create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.Gotham,
	LayoutOrder = 9,
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
		return folder
	end

	folder = Instance.new("Folder")
	folder.Name = FOLDER_NAME
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

	if baseUrl == "" then
		error("Enter a dashboard URL.")
	end

	if universeId == "" then
		error("Enter a universe ID.")
	end

	return baseUrl .. "/api/roblox/heatmap?universeId=" .. HttpService:UrlEncode(universeId)
end

local function fetchHeatmap()
	setStatus("Fetching heatmap...", false)

	local ok, result = pcall(function()
		local response = HttpService:GetAsync(buildHeatmapUrl())
		local heatmap = HttpService:JSONDecode(response)
		local rendered = renderHeatmap(heatmap)
		return {
			rendered = rendered,
			sampleCount = tonumber(heatmap.sampleCount) or 0,
			pointCount = tonumber(heatmap.pointCount) or 0,
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

fetchButton.MouseButton1Click:Connect(fetchHeatmap)
clearButton.MouseButton1Click:Connect(function()
	clearHeatmap()
	setStatus("Cleared heatmap markers.", false)
end)

toggleButton.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
