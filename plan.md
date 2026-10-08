# Tracker Map Dashboard — OpenSpec Plan

A basic dashboard that shows the trackers from `keys.json` on a map.
Stack: **React + TypeScript (Vite)**, **Material UI (MUI)** for UI, **react-leaflet + OpenStreetMap** for the map, and a small **Node/Express** API.

## Before you start

- **`keys.json` has no location data.** These are Find My / OpenHaystack-style keys (`privateKey`, `usesDerivation`, …). Real positions come from Apple's Find My network, which needs an anisette server and an Apple account. To keep this basic, change 2 adds a location-provider interface with a **mock provider**. Real lookups are an optional final change.
- **`privateKey` must never reach the browser.** The API reads `keys.json` on the server and returns only safe fields. Add `keys.json` to `.gitignore`.
- **Duplicate entries:** both entries have the name `rotokey_13` and the same key but different `id`s. Use `id` as the unique key, not `name`.
- **Node version:** the active Node is v16.17.0. Vite 5+ needs Node 18+ (20 LTS is recommended). Run `nvm install 20 && nvm use 20` first.

## Optional: project context for `openspec/config.yaml`

```yaml
context: |
  Stack: React 18 + TypeScript (Vite), Material UI v5 (@mui/material), react-leaflet with OpenStreetMap tiles, small Node/Express API in /server.
  keys.json contains secret privateKey values: it is read server-side only, never imported by frontend code, never committed.
  Trackers are uniquely identified by `id` (names may repeat).
  Keep it basic: no auth, no database, single-user local tool.
rules:
  proposal:
    - Always state what is out of scope
  tasks:
    - Keep tasks small and independently verifiable
```

## Workflow per change

For each prompt below, run in order:

1. `/opsx:propose <prompt>` to generate the proposal, specs, design and tasks
2. Review the artifacts; use `/opsx:update` if needed
3. `/opsx:apply` to implement
4. `/opsx:archive` to merge specs into `openspec/specs/`

Finish each change before you propose the next one, so later proposals can build on the archived specs.

---

## Change 1 — `setup-project-scaffold`

```
Set up the project scaffold for a tracker map dashboard. Use Vite + React 18 + TypeScript in /client, and a minimal Node + Express + TypeScript API in /server. Add a root package.json with npm workspaces and a single `npm run dev` that starts both (e.g. with concurrently). The Vite dev server proxies /api to the Express server. Install Material UI v5 (@mui/material, @mui/icons-material, @emotion/react, @emotion/styled) and set up a ThemeProvider with CssBaseline and a light/dark theme that follows the system preference. Build an app shell with an MUI AppBar titled "Tracker Map", a left sidebar (permanent Drawer on desktop, temporary Drawer with a menu button on mobile) and a main content area that will hold the map. Add a .gitignore that includes node_modules, dist and keys.json. Add a GET /api/health endpoint. Out of scope: map, tracker data.
```

## Change 2 — `add-tracker-api`

```
Add a tracker data API to the Express server. On startup, read keys.json from the project root (path overridable with a KEYS_FILE env var) and validate it (e.g. with zod). Map each entry to a public Tracker DTO: id, name, color (convert colorComponents [r,g,b,a] in 0–1 to a hex string), isDeployed, isActive. NEVER include privateKey, additionalKeys or account in any response. Use id as the unique key. Define a LocationProvider interface (getLatestLocation(trackerId) -> { lat, lng, timestamp, accuracyMeters } | null) and implement a MockLocationProvider that returns a stable position per tracker id (seeded around a configurable center, default Amsterdam 52.37, 4.89) with a small random drift on each call. Expose GET /api/trackers, which returns the trackers with their latest location (location may be null). Add a unit test that checks no private fields leak into the response. Out of scope: real Find My / Apple lookups, persistence.
```

## Change 3 — `add-map-view`

```
Add the map view to the client. Use react-leaflet with OpenStreetMap tiles and the required attribution, filling the main content area. Fetch GET /api/trackers with a typed API client and show a marker for every tracker with a location. Each marker uses the tracker's color (e.g. a colored circle marker or SVG/divIcon). Clicking a marker opens a popup with the name, id, deployed/active status and a relative "last seen" time. On first load, fit the map bounds to all markers (default to a fixed center/zoom if there are none). Show an MUI LinearProgress while loading and an MUI Alert if the request fails. Make sure the Leaflet CSS is imported and the map resizes correctly when the drawer opens or closes. Out of scope: sidebar list, auto-refresh.
```

## Change 4 — `add-tracker-sidebar`

```
Fill the sidebar with the tracker list. Use an MUI List with one ListItemButton per tracker: a colored Avatar/dot with the tracker color, the name as primary text, the id plus "last seen" as secondary text, and MUI Chips for Deployed and Active status. Add a search TextField at the top that filters by name or id, and a count of shown/total trackers. Selecting a tracker in the list highlights it, flies the map to its marker and opens its popup. Selecting a marker on the map highlights the matching list item. Trackers without a location are listed but disabled, with a "No location" label. Share the selection state between the map and the sidebar (React context or lifted state; no extra state library). Out of scope: editing trackers.
```

## Change 5 — `add-auto-refresh-and-states`

```
Add live refresh and polish the UI states. Poll GET /api/trackers every 30 seconds (interval configurable via a VITE_REFRESH_INTERVAL_MS env var) and update marker positions in place, without resetting the user's zoom/pan or selection. Show "Last updated <relative time>" and a refresh IconButton in the AppBar. Add an empty state when keys.json has no trackers, a non-blocking MUI Snackbar when a background refresh fails (keep showing the last known data), and a stale indicator (e.g. a faded marker plus an "Outdated" chip) when a location is older than 1 hour. Out of scope: websockets, history trails.
```

## Change 6 (optional) — `add-findmy-location-provider`

```
Add a real location provider next to the mock one, selectable with a LOCATION_PROVIDER=mock|findmy env var (default mock). The FindMyLocationProvider derives the advertisement key / hashed public key from each tracker's privateKey (OpenHaystack format; support usesDerivation=false only, and log a warning for derived keys), queries Apple's Find My location reports through a configured anisette server (ANISETTE_URL) and Apple account credentials from env vars, then decrypts the reports server-side to get lat/lng/timestamp/accuracy. Cache results in memory for 5 minutes to avoid rate limiting. All key material and credentials stay on the server and are never logged. Document the setup in README.md. Out of scope: storing location history, multi-user accounts.
```
