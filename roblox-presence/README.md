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

## Logging custom events

Require the service API from a server script, then call `Log` with an event name, a flat information table, and the player. Events are delivered in the existing heartbeat batch and automatically appear on the website's **Events** page.

```lua
local ServerScriptService = game:GetService("ServerScriptService")
local Logger = require(ServerScriptService.Server.Services.Game.PresenceService.API)

Logger.Log("weapon_equipped", {
	weapon = "Iron Sword",
	rarity = "Common",
}, player)
```

Event names must start with a letter and may contain letters, numbers, `_`, `.`, `:`, or `-`. Keep names stable and lowercase, such as `weapon_equipped` or `tutorial.step_completed`.

Information values must be strings, numbers, or booleans. Up to 20 properties are accepted per event. The logger automatically includes the universe, place, server, event time, player, player session, and current character position. Pass the `Player` as the third argument so the event can participate in player funnels later.

Server-wide events may omit the player:

```lua
Logger.Log("round_started", {
	map = "Castle",
	round = 4,
})
```

Do not require this module or place the project secret in a `LocalScript`. Client actions should be validated by your server before the server calls `Logger.Log`.
