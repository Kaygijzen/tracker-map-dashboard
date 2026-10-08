# Tasks

## 1. Refresh logic

- [ ] 1.1 Add `parseRefreshInterval()` in `config.ts`, `vite-env.d.ts` typing, `client/.env.example` and a `.gitignore` exception for it; verify unit tests for default, valid, too-small and non-numeric values
- [ ] 1.2 Extend `useTrackers()` with timeout-chained polling, `refresh()`, `initialLoading`, `refreshing`, `error`, `refreshError` and `lastUpdated`; verify fake-timer tests: requests at 0/30/60 s, no overlapping requests, failure keeps last data and sets `refreshError`, success clears errors, `refresh()` fetches immediately and reschedules
- [ ] 1.3 Add `useNow()`; verify a fake-timer test that it ticks

## 2. App bar and feedback

- [ ] 2.1 Add an `actions` slot to `AppShell` and a `RefreshStatus` component ("Last updated …", tooltip, refresh button with progress while refreshing); verify a component test for the text, the disabled/progress state and that clicking calls `refresh`
- [ ] 2.2 Add `RefreshErrorSnackbar`; limit the `MapStatus` progress bar to the first load; verify component tests that the snackbar opens for a refresh error and the progress bar isn't shown while only `refreshing`

## 3. Stale and empty states

- [ ] 3.1 Add `isStale()` and the `Outdated` chip (popup + list) and faded/dashed styling for stale markers; verify unit tests for `isStale` at 59/61 minutes and a list test showing "Outdated" for a 2-hour-old location
- [ ] 3.2 Add the map empty-state card and the sidebar "No trackers found" message; verify component tests for both

## 4. Browser verification

- [ ] 4.1 With `VITE_REFRESH_INTERVAL_MS=5000`, verify in the browser that markers move in place while zoom, pan, selection, open popup and search are kept; that "Last updated" and the refresh button work; that a failed refresh (route `/api/trackers` to 500) shows the snackbar and keeps the markers; that a 2-hour-old location (routed response) shows a faded marker and "Outdated" chips; that an empty response shows the empty states; and that there are no console errors
