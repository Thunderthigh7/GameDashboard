# Dashboard

Blank local starter.

```bash
npm start
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env` and fill in the Roblox OAuth and Open Cloud values before starting the server. When using a Cloudflare tunnel, set `PUBLIC_BASE_URL` to the current `https://...trycloudflare.com` URL and add `PUBLIC_BASE_URL/auth/roblox/callback` to the Roblox OAuth app redirect URIs.

Player data lookup lists DataStores, lets you select one, then reads a specific username or user ID directly. Entry browsing is not used for lookup; the server samples a few keys from the selected DataStore to infer common prefixes such as `Player_`. DataStore entry listing returns one page of up to 100 keys when used directly.

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
