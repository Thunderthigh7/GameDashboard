# Dashboard Studio Plugin

Studio plugin source:

```txt
roblox-plugin/DashboardHeatmap.plugin.lua
```

Install it as a local Roblox Studio plugin by copying that `.lua` file into your local Roblox `Plugins` folder, then restart Studio or reload plugins.

The plugin adds a `Dashboard` toolbar button. It uploads the current Workspace map snapshot to:

```txt
https://game-dashboard-zaya.onrender.com/api/roblox/map-snapshot
```

Map export:

- Sign in to the dashboard.
- Connect your Roblox game.
- Copy the optional Studio map key shown after connection or key rotation.
- Paste that key into the Studio plugin. Live-server analytics does not need this step.
- Click `Export Map To Dashboard`.

The plugin automatically uses the current experience universe ID, place ID, and `game.PlaceVersion`. Plugin exports are marked as `studio`, keeping map authoring uploads separate from production release health. The export sends visible `BasePart` geometry in throttled chunks so large maps can finish over multiple HTTPS requests.

Requirements:

- Studio must allow HTTP requests for the experience.
- The place must be published/opened under the correct Roblox experience so `game.GameId` is available.
- The pasted Studio map key must belong to the same connected game.
