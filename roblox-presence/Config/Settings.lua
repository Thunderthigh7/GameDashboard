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
Settings.AnnouncementTopic = "dashboard-global-announcement"
Settings.AnnouncementDuration = 6
Settings.MaxAnnouncementLength = 240
Settings.Debug = true

return Settings
