# RoAnalytics Studio Installer

Install `RoAnalyticsInstaller.plugin.lua` as a local Roblox Studio plugin or publish it as a Roblox plugin.

The plugin installs and updates the server-side RoAnalytics package and securely relays Player Data requests while the paired experience is open. It contains no heatmap, map scanning, or Workspace upload behavior.

1. Sign in to RoAnalytics and connect the experience.
2. Open that published experience in Studio.
3. Click **RoAnalytics Installer**, then click **Pair & Install**.
4. On the website's **Connect Universe** page, approve the request with the same short code.
5. The plugin downloads the current `RoAnalytics` package, inserts it into `ServerScriptService`, and writes the one-time install credential into `Config/Settings.lua` automatically.
6. Enable **Studio Access to API Services** under Experience Settings -> Security so the plugin can read and save Player Data.
7. Enable **Allow HTTP Requests** and publish when you also want live analytics and the published-server fallback.

The pairing expires after ten minutes. The website never sends a credential until the signed-in owner approves the exact code. Regenerating the game's secret on the website also revokes plugin-issued install credentials.

No live server is required for Player Data. Keep the paired experience open in Studio and the plugin automatically lists up to 100 standard DataStores, samples keys at a rate that respects Roblox's list budget, and reports numeric-suffix patterns such as `Player_{userId}` to the website. Choose the DataStore and pattern there. Loads and saves use stale-version protection. Numbers such as `cash.Value`, strings, booleans, arrays, objects, and objects stored as JSON strings are supported; JSON-string storage is preserved when saving. Roblox Studio accesses the same DataStore backend as production, so only edit offline players and only install trusted plugins. Games using custom session locks, multiple keys, legacy scopes, ordered stores, or transformed formats should use the server adapter documented in `RoAnalytics/README.md` instead.
