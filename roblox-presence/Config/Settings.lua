local Settings = {}

Settings.Endpoint = "https://game-dashboard-zaya.onrender.com/api/roblox/presence"
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
Settings.MaxCustomEventStringLength = 240
Settings.ShutdownFlushTimeout = 8
Settings.Debug = true

return Settings
