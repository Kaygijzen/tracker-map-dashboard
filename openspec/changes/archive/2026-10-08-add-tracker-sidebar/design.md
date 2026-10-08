# Design

## Context

`App` owns tracker data via `useTrackers()` and renders `AppShell` (sidebar slot + main slot) with `TrackerMap` (react-leaflet `CircleMarker`s with `Popup`). `AppShell` owns the mobile drawer `open` state internally.

## Goals / Non-Goals

**Goals:**
- One source of truth for the selected tracker id that both the map and list read and write.
- Avoid feedback loops: a marker click must not trigger a fly-to.

**Non-Goals:**
- Keyboard shortcuts for list navigation beyond MUI's built-in focus handling.

## Decisions

- **Selection context** `SelectionProvider` (`state/selection.tsx`): `{ selectedId: number | null, source: 'map' | 'list' | null, select(id, source), clear(expectedId?) }`. `source` tells the map whether to fly: only `'list'` selections fly and open the popup; `'map'` selections already have an open popup. `clear(expectedId)` only clears if that id is still selected, so the `popupclose` from the previously open marker (which Leaflet fires when another popup opens) doesn't wipe the new selection. Alternative: lifted state in `App` passed by props — fine too, but the context avoids threading props through `AppShell`.
- **Map side**: `TrackerMap` keeps `Map<id, L.CircleMarker>` refs. A `SelectionSync` child (uses `useMap()`) reacts to `{selectedId, source:'list'}`: `flyTo(latlng, max(currentZoom, 15))`, then opens the popup on `moveend`. If the map is already there (distance < 1 px, same zoom), it opens immediately, because no move happens. Marker `eventHandlers`: `click → select(id,'map')`, `popupclose → clear(id)`. Selected marker: radius 12, weight 3, and `bringToFront()`.
- **Drawer closing**: `AppShell` provides `SidebarContext { closeMobileSidebar() }`; the list calls it after selecting. On desktop it's a no-op.
- **List** (`components/sidebar/TrackerList.tsx`): header with `TextField` (search icon adornment, `type="search"`) and `Typography` count; a scrollable `List` below. Items: `ListItemButton selected disabled`, `ListItemAvatar` with a 14px colored dot (`Avatar` with `bgcolor` = color, white ring), `ListItemText` with primary name, secondary "ID … · last seen"/"No location", and chips on a second line. Chips shared with the popup via `StatusChips` component.
- **Filtering** in a pure `filterTrackers(trackers, query)` helper (unit tested): trims, lowercases; matches `name.toLowerCase().includes(q)` or `String(id).includes(q)`.
- **Scroll into view**: each item has `ref` keyed by id; when `selectedId` changes and the source is `'map'`, call `scrollIntoView({ block: 'nearest' })`.

- **Disabled items**: MUI's disabled `ListItemButton` (a `div`) blocks pointer events only through CSS, so the click handler also checks for a location.

## Risks / Trade-offs

- [`moveend` from an unrelated user pan opens the popup] → the listener is registered with `once` right before `flyTo`, and removed if the selection changes before it fires.
- [Popup opened programmatically fires `popupopen` but not `click`] → selection is already set by the list, so nothing else is needed.
