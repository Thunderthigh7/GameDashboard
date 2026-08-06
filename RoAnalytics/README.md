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

## Group rank event requests

Create an event-to-role rule on the dashboard's **Groups** page, then request it from trusted server code:

```lua
local ServerScriptService = game:GetService("ServerScriptService")
local RoAnalytics = require(ServerScriptService.RoAnalytics.API)

local success, errorMessage, statusCode, result = RoAnalytics.RequestGroupRank(player, "vip_purchase")
if not success then
	warn(errorMessage, statusCode)
end
```

The event key only selects a dashboard preset. Roblox code never supplies a group ID or role ID. The website authenticates the request with the universe's existing project secret, checks the saved OAuth group permissions, confirms the player is a lower-ranked member, and assigns the preset role. Duplicate request IDs are ignored, and Studio requests never change live group membership.

`RequestGroupRank` sends immediately instead of waiting for the analytics heartbeat. It returns `success, errorMessage, statusCode, result`; `result.results` reports `assigned`, `already_assigned`, `not_member`, or `protected_member` for each matching rule. Keep the call in server-authoritative purchase, reward, or progression handling. The group OAuth connection must remain authorized with `group:read group:write`.

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

An authorized Roblox Open Cloud connection delivers the action immediately through the existing MessagingService subscription. The normal heartbeat response also contains moderation commands. Permanent bans are enforced on every future join, while a kick fallback is scoped to only the exact live server session that existed when the kick was confirmed. Every action requires a reason and is stored in the dashboard's moderation history. Dashboard users can target a live row or enter any Roblox username or user ID manually.

## Automatic player data

The Studio installer asks for the DataStore name and exact key prefix used before each user ID. With `PlayerData` and `Player_`, for example, user `123` is loaded from `PlayerData` key `Player_123`. The installed package automatically provides the Player Data page with read and write access when a published production server is live.

Automatic reads bypass Roblox's local read cache. Automatic writes use `UpdateAsync`, reject a stale version, and retain existing key metadata and user IDs. Direct access refuses online players so an active profile cannot overwrite the edit afterward. It expects one JSON-compatible table under a standard DataStore key.

For ProfileStore, session-locked profiles, multiple keys, or transformed data, register explicit read and write functions from trusted server code. This custom adapter replaces automatic access so your existing DataService layer keeps ownership of locks, schema validation, and saves:

```lua
local ServerScriptService = game:GetService("ServerScriptService")
local RoAnalytics = require(ServerScriptService.RoAnalytics.API)

RoAnalytics.RegisterPlayerDataAdapter({
	Read = function(userId, context)
		return DataService.GetOfflineData(userId)
	end,
	Write = function(userId, newData, context)
		return DataService.SetOfflineData(userId, newData, context.expectedVersion)
	end,
})
```

Replace the example calls with your game's real server data API. `Read` must return a JSON-compatible table and may return a version as its second value. `Write` receives that value as `context.expectedVersion`; return `false, "reason"` to reject the update, or return the new version on success.

Requests run only in published production servers. Offline players use a live server that registered either adapter. A custom adapter may support an online player through the server that owns that profile, but it must enforce that ownership itself. The website requires a successful read before a write, consumes each read snapshot once, encrypts temporary request data, expires it after 15 minutes, and caps JSON at 256 KiB.
