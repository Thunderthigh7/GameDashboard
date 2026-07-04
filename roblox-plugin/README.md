# Dashboard Heatmap Studio Plugin

Studio plugin source:

```txt
roblox-plugin/DashboardHeatmap.plugin.lua
```

Install it as a local Roblox Studio plugin by copying that `.lua` file into your local Roblox `Plugins` folder, then restart Studio or reload plugins.

The plugin adds a `Dashboard` toolbar with a `Heatmap` button. It fetches:

```txt
https://game-dashboard-zaya.onrender.com/api/roblox/heatmap?universeId=<your universe id>
```

and renders colored Neon sphere markers into:

```txt
Workspace/DashboardStudioHeatmap
```

Blue means low traffic, yellow means medium traffic, and red means high traffic.

Filters:

- `Player filter` accepts a Roblox username or user ID.
- `From time` and `To time` accept ISO timestamps, epoch seconds, epoch milliseconds, or blank values.
- Preset buttons fill `From time` and `To time` for the last 10 minutes, 1 hour, or 1 day.
- `Max points` limits how many heatmap markers Studio creates.

Requirements:

- Studio must allow HTTP requests for the experience.
- The dashboard must already have movement samples from live servers.
- Enter the correct universe ID if `game.GameId` is `0` in an unpublished/local place.
