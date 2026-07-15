# Roblox Presence Service

Reference Luau files for the Roblox-side analytics heartbeat.

Paste this exact tree into Roblox:

```txt
ServerScriptService/Server/Services/Game/PresenceService/
  Start.server.lua
  API.lua
  Core/
    Methods.lua
  Config/
    Settings.lua
```

`API`, `Start`, `Core`, and `Config` are siblings under `PresenceService`. The paths are:

- `API.lua` requires `script.Parent.Core.Methods`
- `Core/Methods.lua` requires `script.Parent.Parent.Config.Settings`
- `Start.server.lua` requires `script.Parent.API` and calls `Start()`

With `Settings.Debug = true`, startup should print:

```txt
[PresenceService] API Start called: ...
[PresenceService] Starting: script ... universe ... place ... job ...
[PresenceService] Settings: endpoint ... interval ... maxPlayers ... debug true
[PresenceService] Players at start: ...
[PresenceService] Heartbeat payload: endpoint ... players ...
[PresenceService] Heartbeat response: savedChatCount ...
[PresenceService] Heartbeat sent: 200 ...
```

This folder is synced by `default.project.json` and is not used by the website server.

## Automatic system events

The service records these events automatically, with the same player session ID used by custom events:

- `player_died` when a tracked Humanoid dies
- `player_left` when a player leaves or the server shuts down
- `chat_message` when `Player.Chatted` fires

They appear in the dashboard's **Events** page, the map's **Events** mode, and funnel step selectors. Do not call `Logger.Log` for them; their names are reserved so they cannot be duplicated or replaced by custom events.

## Logging custom events

Require the service API from a server script, then call `Log` with an event name, an information table, and the player. Events are delivered in the existing heartbeat batch and automatically appear on the website's **Events** page.

```lua
local ServerScriptService = game:GetService("ServerScriptService")
local Logger = require(ServerScriptService.Server.Services.Game.PresenceService.API)

Logger.Log("weapon_equipped", {
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

Event names must start with a letter and may contain letters, numbers, `_`, `.`, `:`, or `-`. Keep names stable and lowercase, such as `weapon_equipped` or `tutorial.step_completed`. The automatic names `player_died`, `player_left`, and `chat_message` are reserved.

Property leaves must be strings, finite numbers, or booleans. Nested tables are flattened into stable paths such as `weapon.name` and `weapon.stats.damage`; arrays become repeated values such as `tags[]`. The Events page discovers every path automatically and lets you switch between their breakdowns.

To keep analytics payloads bounded, one event accepts up to 20 property paths, 3 nested levels, 10 items from an array, and 40 total values. Strings are limited to 240 characters. The event is still logged if a value is unsupported or exceeds a limit, and Data Health reports that some properties were omitted. For item-level relationships inside a large array, log one event per item instead of sending a large inventory table.

The logger automatically includes the universe, place, server, event time, player, player session, and current character position. Pass the `Player` as the third argument so the event can participate in player funnels later.

Server-wide events may omit the player:

```lua
Logger.Log("round_started", {
	map = "Castle",
	round = 4,
})
```

Do not require this module or place the project secret in a `LocalScript`. Client actions should be validated by your server before the server calls `Logger.Log`.
