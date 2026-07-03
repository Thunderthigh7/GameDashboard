# Roblox Presence Service

Reference Luau files for the Roblox-side presence heartbeat and dashboard command receiver.
Teleport and kick commands still run through MessagingService because they need a live server.
Ban and unban commands are handled directly by the website through Roblox Open Cloud User Restrictions.

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
[PresenceService] Subscribed to command topic: kick
[PresenceService] Heartbeat payload: endpoint ... players ...
[PresenceService] Heartbeat response: liveServers ... commands ...
[PresenceService] Heartbeat sent: 200 ...
```

This folder is synced by `default.project.json` and is not used by the website server.
