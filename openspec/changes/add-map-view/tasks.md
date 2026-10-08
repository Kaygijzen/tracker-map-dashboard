# Tasks

## 1. Data access

- [ ] 1.1 Add `api/types.ts` and `api/client.ts` (`fetchTrackers`, `ApiError`); add vitest jsdom/Testing Library setup in the client; verify unit tests for success, non-2xx and network failure pass
- [ ] 1.2 Add `utils/relativeTime.ts`; verify unit tests for seconds, minutes, hours and days ago pass
- [ ] 1.3 Add `useTrackers()` hook with `{ trackers, loading, error }` and abort on unmount; verify `npm run build -w client` passes

## 2. Map

- [ ] 2.1 Install `leaflet`, `react-leaflet@4`, `@types/leaflet`; import Leaflet CSS; add `TrackerMap` with OSM tiles and attribution filling the main area; verify in the browser that the map and attribution render with no console errors
- [ ] 2.2 Render a colored `CircleMarker` for each tracker with a location and a popup with name, id, deployed/active chips and relative last seen; verify in the browser that both `rotokey_13` markers render in green and a click opens the right popup
- [ ] 2.3 Add `FitBounds` (fit once on first load; default view when no markers) and `InvalidateOnResize` (ResizeObserver → `invalidateSize`); verify in the browser that both markers are in view on load, and that resizing 1280 → 375 → 1280 leaves no blank tile areas

## 3. States

- [ ] 3.1 Add the loading (`LinearProgress`) and error (`Alert`) overlay; verify a component test for loading and error rendering, and in the browser that stopping the API shows the alert
