# Tasks

## 1. Shared state and helpers

- [ ] 1.1 Add `SelectionProvider`/`useSelection` with `select(id, source)` and `clear(expectedId)`; verify a unit test that `clear` with a stale id keeps the newer selection
- [ ] 1.2 Add `filterTrackers()`; verify unit tests for name (case-insensitive), id, empty and no-match queries
- [ ] 1.3 Extract `StatusChips` from the popup and reuse it there; verify the popup still shows the chips in the browser
- [ ] 1.4 Add `SidebarContext` with `closeMobileSidebar()` to `AppShell`; verify `npm run build -w client` passes

## 2. Sidebar list

- [ ] 2.1 Build `TrackerList` (search field, "Showing N of M", items with color dot, name, "ID · last seen", chips, disabled "No location" items, "No trackers match" empty message) and render it in the sidebar; verify component tests for item content, filtering, count and disabled items
- [ ] 2.2 Wire list selection: highlight, call `select(id,'list')` and close the mobile drawer; scroll the selected item into view on map selections; verify a component test that clicking an item selects it and disabled items can't be selected

## 3. Map selection

- [ ] 3.1 In `TrackerMap`, keep marker refs, select on marker click, clear on popup close, emphasize the selected marker, and fly to + open popup for list selections; verify in the browser at 1280px: list click flies and opens the popup, marker click highlights the list item, closing the popup clears the highlight
- [ ] 3.2 Verify at 375px in the browser: selecting from the drawer closes it and shows the popup; search filters and the count updates; no console errors
