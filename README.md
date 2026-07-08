# Dashboard

Blank local starter.

```bash
npm start
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env` and fill in the dashboard session secret, Roblox presence secret, and optional OpenAI values before starting the server.

## User Accounts And Roblox Setup

The dashboard uses username/password accounts. After signing in:

1. Add your Roblox universe ID in the sidebar.
2. Copy the Roblox secret that appears once.
3. Put that secret in `roblox-presence/Config/Settings.lua` as `Settings.Secret`.
4. Use the same secret in the Studio heatmap plugin when exporting a map.

Each account only sees universes it added. The old shared `PRESENCE_SECRET` still works as an admin/internal fallback, but normal Roblox games should use the per-universe secret from the website.

To show the Admin user monitor, set this environment variable on Render:

```env
ADMIN_USERNAMES=your_dashboard_username
```

Use commas for multiple admins. Admins can see usernames, sign-up times, last login times, and connected universes. Passwords are stored as hashes and cannot be viewed.

For Backblaze B2 raw analytics storage, add the values from your B2 bucket and application key:

```env
ANALYTICS_STORAGE_MODE=b2
B2_BUCKET_NAME=your-bucket-name
B2_ENDPOINT=https://s3.your-region.backblazeb2.com
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
```

Do not commit `.env`. It is ignored by git.

`ANALYTICS_STORAGE_MODE=b2` keeps the high-volume analytics path on B2. Incoming Roblox batches are still kept briefly in memory for live dashboard testing, but MongoDB analytics writes and startup hydration are skipped.

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
maps/{universeId}/latest.json.gz
maps/{universeId}/{receivedAt}.json.gz
```

The current dashboard still keeps recent data in memory for fast local testing. B2 is the durable raw analytics and map snapshot source for the scalable rollup pipeline.

To verify B2 writes after starting the server:

1. Send a Roblox presence heartbeat.
2. Open `/api/health` while logged in.
3. Check `storage.objectStorageConnected`, `storage.objectStorageLastObjectKey`, and your B2 bucket's `raw/` folder.

### Generate Rollups

Run the batch processor manually:

```bash
npm run rollups
```

It reads recent `raw/` `.jsonl.gz` objects from B2 and writes:

```txt
rollups/{universeId}/latest.json
rollups/{universeId}/{yyyy}/{mm}/{dd}/{hour}.json.gz
```

Useful environment variables:

```env
ROLLUP_LOOKBACK_HOURS=24
ROLLUP_MAX_RAW_OBJECTS=5000
ROLLUP_UNIVERSE_IDS=
```

For a large production setup, set `ROLLUP_UNIVERSE_IDS` on separate scheduled workers so each worker only scans its assigned universe ids.

### Generate Scheduled AI Reports

Run the AI report trigger manually:

```bash
npm run ai-report
```

The command calls the dashboard service, which checks the website automation setting. When automation is enabled, it analyzes each active universe and writes:

```txt
reports/{universeId}/latest.json
reports/{universeId}/{generatedAt}.json
reports/{universeId}/manifest.json
settings/ai-automation/{universeId}.json
```

Use a Render cron job with this command for hourly reports:

```bash
npm run ai-report
```

Schedule:

```txt
0 * * * *
```

Required environment variables for the AI cron:

```env
AI_REPORT_BASE_URL=https://game-dashboard-zaya.onrender.com
AI_REPORT_SECRET=your-presence-secret
```

The dashboard AI panel includes an Auto hourly toggle for the selected game. Turning it off stores manual mode in B2 for that universe and causes the cron job to skip AI calls for that universe.

Every manual or scheduled AI run is saved. Use the Saved runs dropdown in the AI panel to reload an older report without paying for another AI call.
