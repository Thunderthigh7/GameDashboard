local Settings = {}

Settings.Endpoint = "https://game-dashboard-zaya.onrender.com/api/roblox/presence"
Settings.GroupRankEndpoint = "https://game-dashboard-zaya.onrender.com/api/roblox/group-rank"
Settings.PlayerDataRequestEndpoint = "https://game-dashboard-zaya.onrender.com/api/roblox/player-data/requests"
Settings.PlayerDataResultEndpoint = "https://game-dashboard-zaya.onrender.com/api/roblox/player-data/results"
Settings.Secret = "paste-project-roblox-secret-here"

Settings.HeartbeatInterval = 20
Settings.MaxPlayersPerPayload = 100
Settings.MaxChatLogsPerPayload = 100
Settings.MaxPendingChatLogs = 500
Settings.MaxChatMessageLength = 500
Settings.MovementSampleInterval = 2
Settings.MovementRollupInterval = 60
Settings.MovementRollupGridSize = 12
Settings.SendRawMovementSamples = false
Settings.MaxMovementSamplesPerPayload = 200
Settings.MaxPendingMovementSamples = 1000
Settings.MaxMovementRollupsPerPayload = 300
Settings.MaxPendingMovementRollups = 2000
Settings.MovementPositionPrecision = 1
Settings.MaxDeathSamplesPerPayload = 100
Settings.MaxPendingDeathSamples = 500
Settings.MaxLeaveSamplesPerPayload = 100
Settings.MaxPendingLeaveSamples = 500
Settings.MaxCustomEventsPerPayload = 200
Settings.MaxPendingCustomEvents = 1000
Settings.MaxCustomEventPayloadBytes = 96 * 1024
Settings.MaxCustomEventProperties = 20
Settings.MaxCustomEventPropertyPathLength = 96
Settings.MaxCustomEventPropertyDepth = 3
Settings.MaxCustomEventArrayItems = 10
Settings.MaxCustomEventPropertyObservations = 40
Settings.MaxCustomEventStringLength = 240
Settings.CollectRobloxPlayerSegments = true
Settings.LiveActionsEnabled = true
Settings.LiveActionsTopic = "roanalytics-live-actions-v1"
Settings.MaxProcessedLiveActionIds = 250
Settings.PlayerDataBridgeEnabled = true
Settings.MaxPlayerDataJsonBytes = 256 * 1024
Settings.ShutdownFlushTimeout = 8

return Settings
