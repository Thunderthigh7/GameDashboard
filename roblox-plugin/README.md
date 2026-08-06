# RoAnalytics Studio Installer

Install `RoAnalyticsInstaller.plugin.lua` as a local Roblox Studio plugin or publish it as a Roblox plugin.

The plugin only installs and updates the server-side RoAnalytics package. It contains no heatmap, map scanning, or Workspace upload behavior.

1. Sign in to RoAnalytics and connect the experience.
2. Open that published experience in Studio.
3. Click **RoAnalytics Installer**, enter the DataStore name and exact string used before each user ID (for example, `PlayerData` and `Player_`), and then click **Pair & Install**.
4. On the website's **Connect Universe** page, approve the request with the same short code.
5. The plugin downloads the current `RoAnalytics` package, inserts it into `ServerScriptService`, and writes the one-time install credential and player-data key settings into `Config/Settings.lua` automatically.
6. Enable **Allow HTTP Requests** under Experience Settings -> Security if it is off.
7. Publish the experience.

The pairing expires after ten minutes. The website never sends a credential until the signed-in owner approves the exact code. Regenerating the game's secret on the website also revokes plugin-issued install credentials.

After publishing and starting a live server, the website's Player Data page can automatically load an offline player's complete table from `{prefix}{userId}` and save it with stale-version protection. Games using ProfileStore, active session locks, multiple keys, or a non-table format should register the custom adapter documented in `RoAnalytics/README.md` instead.
