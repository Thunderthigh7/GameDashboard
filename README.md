# RoAnalytics Dashboard

The dashboard requires Node.js 20 or newer. Install the locked production dependencies and start the web service with:

```bash
npm ci
npm start
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env` and fill in the dashboard session secret, Roblox presence secret, and optional OpenAI values before starting the server.

## Roblox Login And Roblox Setup

The dashboard uses Roblox OAuth login for user accounts. After signing in with Roblox:

1. Open the Connect Universe tab.
2. Pick one of the public games owned by your Roblox account or by a group you own.
3. Click Connect game.
4. Download and install `roblox-plugin/RoAnalyticsInstaller.plugin.lua` in Studio.
5. Open the experience, click **Pair & Install**, and compare the short code with Connect Universe.
6. Approve the matching request. The plugin installs the complete current package and fills its credential automatically.
7. Enable **Allow HTTP Requests** under Experience Settings -> Security if needed, then publish.

The claim token and installer credential are never shown in the browser. Pairing requests expire after ten minutes. Use Connect Universe -> Connected games -> Regenerate secret to revoke the primary secret and every plugin-installed credential for a connected game. The regenerated secret box is a manual/Rojo fallback and names the exact game and universe it belongs to. Use Unlink to disconnect a game from the account and delete its stored analytics data; Roblox analytics requests using that game's secret will stop working.

Each account only sees universes it added. The old shared `PRESENCE_SECRET` still works as an admin/internal fallback, but normal Roblox games should use the per-universe secret from the website.

New accounts use Roblox OAuth. Universe connection uses the logged-in Roblox account and only allows public experiences owned by that account or by a group that account owns. Configure a Roblox OAuth app in Creator Dashboard, add this redirect URL, and set these environment variables:

```env
ROBLOX_OAUTH_CLIENT_ID=your-roblox-oauth-client-id
ROBLOX_OAUTH_CLIENT_SECRET=your-roblox-oauth-client-secret
ROBLOX_OAUTH_REDIRECT_URI=https://game-dashboard-zaya.onrender.com/api/roblox/oauth/callback
ROBLOX_OAUTH_SCOPES=openid profile
ROBLOX_OAUTH_LIVE_ACTION_SCOPES=openid profile universe-messaging-service:publish
ROBLOX_OAUTH_ASSET_SCOPES=openid profile asset:read asset:write
ROBLOX_OAUTH_GROUP_SCOPES=openid profile group:read group:write
```

The extra live-action scope is requested only when a universe owner authorizes **Integrations → Roblox**. The resulting access and rotating refresh tokens are encrypted at rest. Disconnecting the integration revokes the Roblox authorization.

The Assets page requests `asset:read` and `asset:write` only when a user authorizes asset publishing. Add both scopes to the Roblox OAuth app. The server always includes these required scopes even if Render has an older `ROBLOX_OAUTH_ASSET_SCOPES` value. Roblox decides when account selection and consent are required for the authorization request. The callback stores a completed authorization and lets the Assets API enforce its effective permissions instead of rejecting it from the token response's advisory scope text. Bulk-upload files are saved to B2 when it is configured, with a local `data/asset-drafts` fallback for development. The defaults are 20 MB per file, 250 MB and 100 files per saved batch, and 50 saved batches per experience.

The Groups page uses OAuth only. Use the Roblox OAuth app's **Creation & Productivity Tools** category, add `group:read` and `group:write`, and set `ROBLOX_OAUTH_GROUP_SCOPES=openid profile group:read group:write` on Render. The server always adds both required group scopes even when the environment value is stale. Group actions are limited by the authorizing account's Roblox group permissions and rank. Auto-accept presets only act on the explicit username/user-ID allowlist saved for that group, check once per minute, and process at most 10 approvals per worker run.

For local testing, use:

```env
ROBLOX_OAUTH_REDIRECT_URI=http://localhost:3000/api/roblox/oauth/callback
```

To show the Admin user monitor, set this environment variable on Render:

```env
ADMIN_USERNAMES=your_dashboard_username
```

Use Roblox user IDs when possible, and use commas for multiple admins. Admins can see usernames, Roblox identities, sign-up times, last login times, and connected universes. Legacy passwords are stored as hashes and cannot be viewed.

For Backblaze B2 raw analytics storage, add the values from your B2 bucket and application key:

```env
ANALYTICS_STORAGE_MODE=b2
B2_BUCKET_NAME=your-bucket-name
B2_ENDPOINT=https://s3.your-region.backblazeb2.com
B2_REGION=your-region
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_CONNECTION_TIMEOUT_MS=5000
B2_REQUEST_TIMEOUT_MS=60000
B2_SOCKET_TIMEOUT_MS=30000
B2_MAX_ATTEMPTS=3
OBJECT_STORAGE_REQUEST_TIMEOUT_MS=5000
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

The tunnel command creates a new temporary URL for local testing only. Roblox games should keep `RoAnalytics/Config/Settings.lua` pointed at `https://game-dashboard-zaya.onrender.com/api/roblox/presence`.

## RoAnalytics Sync

This repo includes a Rojo project for RoAnalytics:

```bash
rojo serve default.project.json
```

In Roblox Studio, use the Rojo plugin to connect to the local server. It syncs to:

```txt
ServerScriptService
  RoAnalytics
    Start
    API
    Core
      Methods
    Config
      Settings
```

`Start` is a server Script that requires `RoAnalytics.API` and calls `Start()`.

The service automatically records `player_died`, `player_left`, and `chat_message`. These use the same player session IDs as custom events and appear under **Events**, in the map's **Events** mode, and as funnel steps. Their names are reserved; game code should not log duplicates.

Game server scripts can use that same API to send custom events:

```lua
local RoAnalytics = require(game.ServerScriptService.RoAnalytics.API)

RoAnalytics.Log("weapon_equipped", {
	weapon = {
		name = "Iron Sword",
		rarity = "Common",
		stats = { damage = 51 },
	},
}, player)
```

The event is included in the existing batched heartbeat and appears automatically under **Events** in the dashboard. The property explorer discovers flat and nested values such as `weapon.name` and `weapon.stats.damage`. RoAnalytics adds player session, server time, universe, place, `game.PlaceVersion`, production/studio environment, and character position. See `RoAnalytics/README.md` for naming, property limits, and server-only requirements.

The **Groups** page can also save a server event key to a lower group role. After saving a rule, trusted server code can call `RoAnalytics.RequestGroupRank(player, "vip_purchase")`. The request is sent immediately with the connected universe's project secret; the website owns the group and role mapping, ignores Studio requests, verifies the authorized Roblox account can manage the target role, and only assigns it to an existing lower-ranked member.

The **Events** page also includes an event builder. Select **New event** to name an event and define up to 20 properties before writing the Roblox code. New property paths are added automatically when Roblox sends them. Unwanted properties can be hidden from breakdowns without deleting their raw values, then restored later. The builder generates a copyable Roblox Luau `RoAnalytics.Log(...)` example; saved definitions are immediately available to Funnels even before their first record arrives.

Custom events can be reopened to edit their visible or hidden properties and generated Luau. Deleting an event removes its definition and stored dashboard history. A later Roblox log with the same name is treated as new activity and can create the event again.

Authenticated projects can verify release tagging with `GET /api/version-health?universeId={id}`. It reports production coverage, unversioned history, studio observations, the latest production version per place, and counts for every observed version.

The release-cohort API remains available at `GET /api/releases?universeId={id}` for automated comparisons. Event timelines and date-range selectors continue to show the exact production release times reported by Roblox.

Completed-purchase tracking recognizes stable success names such as `item_purchased`, `product_purchased`, `gamepass_purchased`, `purchase_completed`, and `checkout_completed`. Prompt, started, cancelled, failed, and refunded events are intentionally not counted as purchases.

The generated demo universe includes production versions `120` and `121`, including deliberate onboarding, session-duration, boss-funnel, and purchase changes for testing release-aware analytics without publishing a Roblox experience.

## Website Funnels

After events arrive, open **Funnels** and select **New**. A funnel can mix custom events with `player_died`, `player_left`, and `chat_message`, and contains 2–10 ordered event names plus a conversion window. Funnel definitions are saved per account and universe, so changing a funnel does not require another Roblox publish.

Conversion is session-based: a session enters when it reaches step one, and it only reaches later steps when matching events occur after the previous step and inside the selected conversion window. The dashboard shows entry sessions, completed sessions, overall conversion, step drop-off, unique players, and time between steps. Results use the dashboard's current From/To date filters and refresh every 15 seconds while the Funnels page is open.

The Studio installer lives in `roblox-plugin/`; see `roblox-plugin/README.md` for local plugin install steps. It only installs or updates the server package. It contains no Studio heatmap, map scan, or map upload behavior.

## Player Data Bridge

The **Player Data** page can read and update one player's JSON without another Roblox OAuth scope. It sends a short-lived request to the installed package in a published server. Existing `universe-messaging-service:publish` authorization is used when available for immediate delivery; otherwise the regular authenticated heartbeat carries the request.

RoAnalytics does not guess a DataStore name or directly open a live profile. Register the game-specific server adapter that already owns your session locking and validation:

```lua
local RoAnalytics = require(game.ServerScriptService.RoAnalytics.API)

RoAnalytics.RegisterPlayerDataAdapter({
	Read = function(userId, context)
		return DataService.GetOfflineData(userId)
	end,
	Write = function(userId, newData, context)
		return DataService.SetOfflineData(userId, newData, context.expectedVersion)
	end,
})
```

Replace those example calls with the real API in your game. Reads and writes only execute in published production servers. A successful read is required before a write, each read snapshot can be used once, payloads are capped at 256 KiB, and encrypted request data expires after 15 minutes. Your adapter remains responsible for preventing writes over a profile that another server owns and for rejecting stale versions.

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
ROLLUP_READ_CONCURRENCY=8
ROLLUP_MAX_VERSIONS=50
ROLLUP_UNIVERSE_IDS=
```

For a large production setup, set `ROLLUP_UNIVERSE_IDS` on separate scheduled workers so each worker only scans its assigned universe ids.

### Production B2 Maintenance

Run the maintenance worker from cron instead of relying only on request-time cleanup:

```bash
npm run b2-maintenance
```

It enforces raw analytics retention, refreshes rollups, writes a maintenance report, and exits non-zero if the scan was capped or any object failed to process.

Recommended schedule:

```txt
15 * * * *
```

Useful environment variables:

```env
B2_MAINTENANCE_RETENTION_DAYS=14
B2_MAINTENANCE_LOOKBACK_HOURS=24
B2_MAINTENANCE_MAX_RAW_OBJECTS=10000
B2_MAINTENANCE_MAX_DELETE_OBJECTS=5000
B2_MAINTENANCE_READ_CONCURRENCY=8
B2_MAINTENANCE_UNIVERSE_IDS=
B2_MAINTENANCE_DRY_RUN=false
B2_STORAGE_USD_PER_TB_MONTH=6.95
```

Reports are written to:

```txt
maintenance/b2/latest.json
maintenance/b2/{yyyy}/{mm}/{dd}/{hour}-{generatedAt}.json
```

The report includes universes processed, raw objects scanned, raw objects deleted, rollups written, retained raw bytes, rollup bytes, and projected monthly B2 storage cost per universe.

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
AI_REPORT_TIMEOUT_MS=600000
```

The dashboard AI panel includes an Auto hourly toggle for the selected game. Turning it off stores manual mode in B2 for that universe and causes the cron job to skip AI calls for that universe.

Every manual or scheduled AI run is saved. Use the Saved runs dropdown in the AI panel to reload an older report without paying for another AI call.
