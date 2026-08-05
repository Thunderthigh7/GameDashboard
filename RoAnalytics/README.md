# RoAnalytics

Reference Luau files for the Roblox-side analytics heartbeat.

Place this exact tree directly under `ServerScriptService`:

```txt
ServerScriptService/
  RoAnalytics/
    Start.server.lua
    API.lua
    Core/
      Methods.lua
    Config/
      Settings.lua
```

`API`, `Start`, `Core`, and `Config` are siblings under `RoAnalytics`:

- `API.lua` requires `script.Parent.Core.Methods`.
- `Core/Methods.lua` requires `script.Parent.Parent.Config.Settings`.
- `Start.server.lua` requires `script.Parent.API` and calls `Start()`.

This folder is synced by `default.project.json` and is not used by the website server. It does not emit routine warning or debug output.

`RoAnalytics.SendHeartbeat()` returns `success, errorMessage, statusCode`. It does not print routine logs. For a manual connection check:

```lua
local RoAnalytics = require(game.ServerScriptService.RoAnalytics.API)
local success, errorMessage, statusCode = RoAnalytics.SendHeartbeat()
print(success, errorMessage, statusCode)
```

## Automatic system events

RoAnalytics records these events automatically with the same player session ID used by custom events:

- `player_died` when a tracked Humanoid dies.
- `player_left` when a player leaves or the server shuts down; it includes the server-measured session duration.
- `chat_message` when `Player.Chatted` fires.

They appear on the dashboard's **Events** page, the map's **Events** mode, and in funnel step selectors. Their names are reserved and cannot be replaced by custom events.

## Logging custom events

Require the API from trusted server code, then call `Log` with an event name, information table, and optional player:

```lua
local ServerScriptService = game:GetService("ServerScriptService")
local RoAnalytics = require(ServerScriptService.RoAnalytics.API)

RoAnalytics.Log("weapon_equipped", {
	weapon = {
		name = "Iron Sword",
		rarity = "Common",
		stats = {
			damage = 51,
		},
	},
	tags = { "melee", "starter" },
}, player)
```

Event names must start with a letter and may contain letters, numbers, `_`, `.`, `:`, or `-`. Keep names stable and lowercase, such as `weapon_equipped` or `tutorial.step_completed`.

Property leaves must be strings, finite numbers, or booleans. Nested tables are flattened into stable paths such as `weapon.name` and `weapon.stats.damage`; arrays become repeated values such as `tags[]`. One event accepts up to 20 property paths, 3 nested levels, 10 array items, and 40 total values. Strings are limited to 240 characters.

The heartbeat includes `game.PlaceVersion` and marks each batch as `production` or `studio`. Every event inherits its universe, place, server, release, event time, player session, and current character position. Pass the `Player` as the third argument so the event can participate in player funnels.

Server-wide events may omit the player:

```lua
RoAnalytics.Log("round_started", {
	map = "Castle",
	round = 4,
})
```

Do not require RoAnalytics or expose its project secret from a `LocalScript`. Validate client actions through the game's normal server-authoritative networking before logging them.

## Player context

RoAnalytics calls `AnalyticsService:GetPlayerSegmentsAsync()` and attaches Roblox's `WhenUserFirstPlayed` bucket when available. If trusted server handling already receives a validated device category, it can supply that context:

```lua
RoAnalytics.SetPlayerContext(player, {
	platform = "Mobile", -- Desktop, Mobile, Tablet, Console, or VR
})
```

Until context is supplied, the dashboard reports the player's platform as **Unknown**.

## Live actions

Register every action the website is allowed to invoke from trusted server code. The website sends only an action key and validated JSON parameters; it never sends executable Luau.

```lua
local ServerScriptService = game:GetService("ServerScriptService")
local RoAnalytics = require(ServerScriptService.RoAnalytics.API)

RoAnalytics.RegisterLiveAction("hourly_event.start", function(parameters, context)
	local eventId = tostring(parameters.eventId or "default")
	-- Call your existing server-authoritative event service here.
end)
```

`RoAnalytics.Start()` subscribes each live server to the fixed `roanalytics-live-actions-v1` MessagingService topic and routes messages to the matching registered action key. Live-action execution does not add any HTTPS requests or status fields to analytics heartbeats. Recent deliveries records whether Roblox Open Cloud accepted the publish; it does not claim that a game server executed it.

Keep handlers idempotent when practical because MessagingService delivery is best effort, and validate parameters again before changing gameplay.

## Player moderation

Kick and ban commands from the **Player Moderation** page are built in for the dashboard user who owns the connected universe. Do not register a handler for `roanalytics.moderation`.

An authorized Roblox Open Cloud connection delivers the action immediately through the existing MessagingService subscription. The normal heartbeat response also contains moderation commands, so permanent bans are enforced on future joins and Kick/Ban still have a fallback if an immediate publish is missed. Every action requires a reason and is stored in the dashboard's moderation history.
