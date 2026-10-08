# Proposal

## Why

The API now serves trackers with locations, but the dashboard's main area is still a placeholder. Users need to see where their trackers are on a map and inspect each one.

## What Changes

- The main content area shows a full-size OpenStreetMap map (with the required attribution).
- The client fetches `GET /api/trackers` through a typed API client.
- Each tracker with a location is drawn as a marker in the tracker's color; trackers without a location are not drawn.
- Clicking a marker opens a popup with the tracker's name, id, deployed/active status and a relative "last seen" time.
- On first load the map fits all markers; with no markers it shows a fixed default view.
- A progress bar is shown while loading and an error alert if the request fails.
- The map keeps the correct size when the layout changes (drawer opens/closes, window resizes).

**Out of scope:** the sidebar tracker list and selection syncing, auto-refresh/polling, marker clustering, offline tiles, history trails.

## Capabilities

### New Capabilities
- `map-view`: The tracker map in the dashboard's main area: tiles and attribution, tracker markers and popups, initial viewport, and loading/error states for the tracker data.

### Modified Capabilities
- None. (The `app-shell` main content area requirement already covers the space the map fills.)

## Impact

- Client only. New dependencies: `leaflet`, `react-leaflet@4` (React 18 compatible), `@types/leaflet`; dev: `@testing-library/react`, `jsdom` for component tests.
- New client modules: typed API client and types, map components, relative-time helper.
- Browser loads tiles from `tile.openstreetmap.org`.
