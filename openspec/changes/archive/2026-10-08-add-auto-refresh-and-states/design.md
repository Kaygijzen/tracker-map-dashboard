# Design

## Context

`useTrackers()` fetches once into `{ trackers, loading, error }`. `TrackerMap` keys `CircleMarker`s by id and `FitBoundsOnce` only fits on the first load. Popups are bound to their `CircleMarker`; Leaflet moves an open popup on the layer's `move` event, which `setLatLng` fires. Selection lives in `SelectionProvider` keyed by id. `AppShell` renders the AppBar title only.

## Goals / Non-Goals

**Goals:**
- One fetch loop with no overlapping requests and a single timer.
- Relative times ("last updated", "last seen") stay fresh without extra fetches.

**Non-Goals:**
- Exponential backoff on failures (fixed interval is enough for a local tool).

## Decisions

- **Polling in `useTrackers({ intervalMs })`**: a `setTimeout` chain scheduled after each request finishes (not `setInterval`), so slow responses never overlap and the gap is always the full interval. `refresh()` clears the pending timeout, runs a request now (ignored if one is in flight) and reschedules. State: `{ trackers, initialLoading, refreshing, error (first-load error, cleared on success), refreshError (latest background error, cleared on success), lastUpdated: Date | null }`. An `AbortController` is used on unmount.
- **Interval config** in `config.ts`: `parseRefreshInterval(import.meta.env.VITE_REFRESH_INTERVAL_MS)` → number ≥ 1000, else 30000. Pure and unit tested. `vite-env.d.ts` declares the env var.
- **In-place updates**: no code needed beyond keeping stable `key={tracker.id}` — react-leaflet calls `setLatLng`/`setStyle` on prop changes. `FitBoundsOnce` already ignores later loads; `SelectionSync` only reacts to selection changes, not data changes, so refreshes don't fly. The search query lives in `TrackerList` state, which isn't remounted.
- **Clock**: `useNow(intervalMs = 15000)` hook returns a `Date` that ticks; used by the app bar status and the list/popup to re-render relative times and the stale check.
- **App bar**: `AppShell` gets an `actions?: ReactNode` prop rendered at the right of the toolbar. `RefreshStatus` shows `Typography` "Last updated …" (hidden below `sm`) and an `IconButton` with `RefreshIcon` wrapped in a `Tooltip` (tooltip text = last updated). While refreshing it's disabled and shows a `CircularProgress` (size 20) instead of the icon.
- **Snackbar**: `RefreshErrorSnackbar` opens whenever `refreshError` changes to a new error object (it auto-hides after 6 s and can be dismissed), anchored bottom-center, with `Alert severity="warning"`: "Couldn't refresh trackers — showing last known data."
- **Stale**: `isStale(location, now)` in `utils/stale.ts` (threshold `STALE_AFTER_MS = 60 * 60 * 1000`). Marker: `fillOpacity 0.35`, `opacity 0.6`, `dashArray '4 3'`. `StatusChips` gains an optional `stale` flag that adds an `Outdated` chip (`color="warning"`, outlined).
- **Empty state**: `MapStatus` gets an `empty` flag that renders a centered `Paper` card ("No trackers" + "Add trackers to keys.json on the server and restart it."). `TrackerList` shows "No trackers found" when `trackers.length === 0`.
- **Tests**: fake timers for the polling hook (default interval, no overlap, failure keeps data, manual refresh reschedules), `parseRefreshInterval`, `isStale`, chips and empty states.

## Risks / Trade-offs

- [The 15 s clock re-renders the list and map every 15 s] → cheap at this scale (a handful of trackers).
- [The open popup's content updates under the user's cursor] → only text/positions change; the popup stays open.
