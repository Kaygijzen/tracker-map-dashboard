# Proposal

## Why

The map shows where trackers are, but there's no way to find a specific tracker, see all trackers at a glance (including ones without a location), or jump to one. The sidebar from the app shell is still a placeholder.

## What Changes

- The sidebar lists every tracker: a dot in the tracker color, the name, the id plus "last seen", and Deployed/Active chips.
- A search field at the top filters the list by name or id, with a "shown of total" count.
- Selecting a tracker in the list highlights it, flies the map to its marker and opens its popup. On mobile the drawer closes so the map is visible.
- Clicking a marker on the map highlights the matching list item (and scrolls it into view); the selected marker is drawn emphasized.
- Trackers without a location are listed but disabled, labelled "No location".
- The selection is shared between map and sidebar through React state/context (no extra state library).

**Out of scope:** editing, renaming or hiding trackers; sorting options; multi-select; persisting the search or selection across reloads; auto-refresh.

## Capabilities

### New Capabilities
- `tracker-sidebar`: The tracker list in the sidebar: item content, search and count, disabled no-location items, and selecting a tracker from the list.

### Modified Capabilities
- `map-view`: Marker clicks now select the tracker, the selected marker is emphasized, and an external selection flies the map to the marker and opens its popup.

## Impact

- Client only; no new dependencies.
- New: selection context, `TrackerList` sidebar components, shared status chips. `AppShell` exposes a way for sidebar content to close the mobile drawer. `TrackerMap` gains marker refs and selection handling.
