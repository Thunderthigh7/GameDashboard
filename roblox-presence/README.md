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
