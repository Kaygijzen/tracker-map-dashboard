# Proposal

## Why

Tracker positions change over time, but the dashboard only loads them once, so users have to reload the page and lose their view. The UI also doesn't distinguish "no trackers configured", "refresh failed" or "position is old" from normal data, which makes the map misleading.

## What Changes

- The client polls `GET /api/trackers` every 30 seconds (configurable with `VITE_REFRESH_INTERVAL_MS`) and updates markers and list items in place, keeping the user's zoom, pan, open popup and selection.
- The app bar shows "Last updated <relative time>" and a refresh button that triggers an immediate refresh.
- If a background refresh fails, a non-blocking snackbar says so and the last known data stays on screen.
- When the API returns no trackers, the map and sidebar show an empty state explaining how to add trackers.
- Locations older than 1 hour are marked as stale: a faded marker and an "Outdated" chip in the popup and list.
- The full-width progress bar is only shown for the first load; background refreshes show progress on the refresh button.

**Out of scope:** websockets or server push, location history trails, pausing polling for hidden tabs, configurable stale threshold, server changes.

## Capabilities

### New Capabilities
- `tracker-refresh`: Keeping tracker data current: polling interval and configuration, in-place updates that preserve view and selection, last-updated display, manual refresh, and background failure handling.

### Modified Capabilities
- `map-view`: Loading indicator only for the first load; new empty state; stale-location marker styling and popup chip.
- `tracker-sidebar`: "Outdated" chip for stale locations; empty state when there are no trackers.

## Impact

- Client only; no new dependencies.
- `useTrackers()` gains polling, `refresh()`, `refreshing`, `lastUpdated` and `refreshError`. `AppShell` gains an app bar actions slot.
- New env var `VITE_REFRESH_INTERVAL_MS` (documented in `client/.env.example`; `.gitignore` gets an exception for `.env.example`).
