local Settings = {}

Settings.Endpoint = "https://game-dashboard-zaya.onrender.com/api/roblox/presence"
Settings.Secret = "local-dev-presence-secret"

Settings.HeartbeatInterval = 20
Settings.MaxPlayersPerPayload = 100
Settings.MaxChatLogsPerPayload = 100
Settings.MaxPendingChatLogs = 500
Settings.MaxChatMessageLength = 500
Settings.MovementSampleInterval = 2
Settings.MaxMovementSamplesPerPayload = 200
Settings.MaxPendingMovementSamples = 1000
Settings.MovementPositionPrecision = 1
Settings.MaxDeathSamplesPerPayload = 100
Settings.MaxPendingDeathSamples = 500
Settings.MaxLeaveSamplesPerPayload = 100
Settings.MaxPendingLeaveSamples = 500
Settings.ShutdownFlushTimeout = 8
Settings.Debug = true

return Settings
