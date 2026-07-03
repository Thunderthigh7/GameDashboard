# Dashboard

Blank local starter.

```bash
npm start
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env` and fill in the Roblox OAuth and Open Cloud values before starting the server.

To start the dashboard and Rojo together:

```bash
npm run start:all
```

Optional quick tunnel:

```bash
npm run start:all -- --tunnel
```

The tunnel command creates a new temporary URL, so update `roblox-presence/Config/Settings.lua` if you use it.

## Roblox Presence Sync

This repo includes a Rojo project for the Roblox presence service:

```bash
rojo serve default.project.json
```

In Roblox Studio, use the Rojo plugin to connect to the local server. It syncs to:

```txt
ServerScriptService
  Server
    Services
      Game
        PresenceService
          Start
          API
          Core
            Methods
          Config
            Settings
```

`Start` is a server Script that requires `PresenceService.API` and calls `Start()`.
