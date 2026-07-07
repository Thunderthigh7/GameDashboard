# Dashboard

Blank local starter.

```bash
npm start
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env` and fill in the dashboard password, Roblox presence secret, and optional OpenAI values before starting the server.

For Backblaze B2 raw analytics storage, add the values from your B2 bucket and application key:

```env
B2_BUCKET_NAME=your-bucket-name
B2_ENDPOINT=https://s3.your-region.backblazeb2.com
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
```

Do not commit `.env`. It is ignored by git.

To start the dashboard and Rojo together:

```bash
npm run start:all
```

Optional quick tunnel:

```bash
npm run start:all -- --tunnel
```

The tunnel command creates a new temporary URL for local testing only. Roblox games should keep `roblox-presence/Config/Settings.lua` pointed at `https://game-dashboard-zaya.onrender.com/api/roblox/presence`.

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

The Studio heatmap plugin lives in `roblox-plugin/`; see `roblox-plugin/README.md` for local plugin install steps.

## Backblaze B2 Analytics Storage

When all `B2_*` environment variables are configured, incoming Roblox presence batches are also stored as compressed JSONL files in B2:

```txt
raw/{universeId}/{yyyy}/{mm}/{dd}/{hour}/{jobId}-{receivedAt}-{batchId}.jsonl.gz
```

The current dashboard still keeps recent data in memory for fast local testing. B2 is the durable raw analytics source for the scalable rollup pipeline.

To verify B2 writes after starting the server:

1. Send a Roblox presence heartbeat.
2. Open `/api/health` while logged in.
3. Check `storage.objectStorageConnected`, `storage.objectStorageLastObjectKey`, and your B2 bucket's `raw/` folder.
