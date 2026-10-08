# Design

## Context

`client/src/App.tsx` renders `AppShell` with a placeholder in the main area; `AppShell`'s main slot is a `position: relative` flex child with `minHeight: 0`, so a child with `height: 100%` fills it. The API returns `{ trackers: TrackerWithLocation[] }` (see `tracker-api` spec). React is 18, so react-leaflet must be v4 (v5 requires React 19).

## Goals / Non-Goals

**Goals:**
- A data hook and API client that the sidebar (next change) and polling (change after) can reuse.

**Non-Goals:**
- Shared types package with the server — the DTO is small; client types are written by hand in `api/types.ts` and mirror the spec.

## Decisions

- **API client** `client/src/api/client.ts`: `fetchTrackers(signal?)` → `Promise<TrackerWithLocation[]>`; throws `ApiError` with status on non-2xx. Types in `api/types.ts`.
- **Data hook** `useTrackers()` in `hooks/useTrackers.ts` → `{ trackers, loading, error }`, aborting on unmount (StrictMode double-mount safe). Lives above the map in `App` so the sidebar can use the same data later.
- **Markers: `CircleMarker`** (SVG/canvas vector) with `color`/`fillColor` = tracker color, white outline for contrast on the map, radius 9. Alternatives: `divIcon` with custom HTML (more styling work), default PNG icons (can't color, and need the known Vite asset-path fix). Vector markers also make "faded" stale styling trivial later (`fillOpacity`).
- **Popup** content rendered with MUI `Typography`/`Chip` inside react-leaflet `Popup`. Relative time via `Intl.RelativeTimeFormat` in `utils/relativeTime.ts` (no date library).
- **Initial viewport**: a child `FitBounds` component uses `useMap()` and a `useRef` flag so it only fits once, after the first successful load: 0 markers → default view; 1 → `setView(pos, 15)`; more → `fitBounds(bounds, { padding: [48, 48], maxZoom: 15 })`. The `MapContainer` starts at the default center/zoom 11.
- **Resize**: a `ResizeObserver` on the map container (in a child component using `useMap()`) calls `map.invalidateSize()`. This handles drawer changes and window resizes in one place.
- **Leaflet CSS**: `import 'leaflet/dist/leaflet.css'` in `main.tsx`.
- **Loading/error UI**: an absolutely positioned overlay at the top of the main area (`LinearProgress`, `Alert severity="error"`), placed above the map with a z-index higher than Leaflet panes (> 1000) so it doesn't shift the map layout.
- **Dark mode**: tiles stay standard OSM; popups use MUI theme colors through Leaflet's popup styles overridden in a small CSS block (`.leaflet-popup-content-wrapper` background/text from the theme).
- **Popup spacing**: Leaflet's `.leaflet-popup-content p` margin is reset to 0 so MUI Typography spacing applies.
- **Tests**: vitest + jsdom + Testing Library for `relativeTime`, `fetchTrackers` (mocked `fetch`) and the loading/error overlay. Leaflet rendering itself is verified in the browser (jsdom has no layout).

## Risks / Trade-offs

- [OSM tile usage policy] → fine for a single-user local tool; a valid attribution is shown and there's no bulk downloading.
- [Map renders at 0 height if a parent loses `height`] → the map container uses `height: 100%` inside the existing `position: relative` main slot; verified at desktop and mobile widths.
