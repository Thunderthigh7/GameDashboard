local HttpService = game:GetService("HttpService")
local Workspace = game:GetService("Workspace")

local DASHBOARD_BASE_URL = "https://game-dashboard-zaya.onrender.com"
local FOLDER_NAME = "DashboardStudioHeatmap"
local MAP_CHUNK_TARGET_BYTES = 100000
local MAP_CHUNK_COOLDOWN_SECONDS = 0.45
local MAP_MAX_PARTS_PER_CHUNK = 750

local toolbar = plugin:CreateToolbar("Dashboard")
local toggleButton = toolbar:CreateButton(
	"Dashboard",
	"Export the current map snapshot to the dashboard.",
	""
)

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Right,
	false,
	false,
	360,
	220,
	300,
	180
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

createLabel("Dashboard secret", 1)
local secretInput = createInput("", "Paste this game's secret from the website", 2)

local exportMapButton = createButton("Export Map To Dashboard", 3)
exportMapButton.BackgroundColor3 = Color3.fromRGB(55, 121, 82)

local statusLabel = create("TextLabel", {
	BackgroundTransparency = 1,
	Font = Enum.Font.Gotham,
	LayoutOrder = 4,
	Size = UDim2.new(1, 0, 0, 70),
	Text = "Paste the secret for this game, then export the current Workspace map.",
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

local function buildMapUploadUrl()
	return DASHBOARD_BASE_URL:gsub("/+$", "") .. "/api/roblox/map-snapshot"
end

local function getUniverseId()
	if game.GameId <= 0 then
		error("Publish/open the Roblox experience first so Studio can read the universe ID.")
	end

	return tostring(game.GameId)
end

local function getDashboardSecret()
	local secret = secretInput.Text:gsub("^%s+", ""):gsub("%s+$", "")
	if secret == "" then
		error("Enter the project Roblox secret before exporting the map.")
	end

	return secret
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
					local errorText = string.lower(tostring(uploadResult))
					if string.find(errorText, "usage_limit", 1, true) or string.find(errorText, "limit reached", 1, true) then
						error(tostring(uploadResult))
					end
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

exportMapButton.MouseButton1Click:Connect(exportMap)

toggleButton.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
