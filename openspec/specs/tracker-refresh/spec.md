# tracker-refresh Specification

## Purpose
Keeps the dashboard's tracker data current without disrupting the user: periodic and manual refreshes that update the map and list in place, with clear feedback about freshness and failures.

## Requirements

### Requirement: Periodic refresh
The dashboard SHALL request `GET /api/trackers` again at a fixed interval after the previous request completes. The interval SHALL default to 30 seconds and SHALL be configurable at build time with `VITE_REFRESH_INTERVAL_MS`; values that are not a number of at least 1000 SHALL fall back to the default. A refresh SHALL NOT start while another tracker request is in progress.

#### Scenario: Default interval
- **WHEN** the dashboard has been open for 65 seconds without `VITE_REFRESH_INTERVAL_MS` set
- **THEN** the trackers have been requested three times (initial load plus two refreshes)

#### Scenario: Custom interval
- **WHEN** the client is built with `VITE_REFRESH_INTERVAL_MS=5000`
- **THEN** trackers are refreshed every 5 seconds

#### Scenario: Invalid interval
- **WHEN** `VITE_REFRESH_INTERVAL_MS` is `fast` or `10`
- **THEN** the 30 second default is used

### Requirement: In-place updates
After a refresh, markers and list items SHALL update to the new data without resetting the map's zoom or pan, the open popup, the selected tracker or the search query.

#### Scenario: View is preserved
- **WHEN** the user has zoomed and panned the map, selected a tracker and a refresh completes with moved positions
- **THEN** the map keeps its zoom and center, the selection stays, and the open popup follows its marker to the new position

### Requirement: Last updated indicator
The app bar SHALL show when tracker data was last successfully loaded as "Last updated <relative time>", updating as time passes. On viewports narrower than 600px the text MAY be hidden, but it SHALL remain available as the refresh button's tooltip.

#### Scenario: After a load
- **WHEN** tracker data loaded successfully 2 minutes ago
- **THEN** the app bar shows "Last updated 2 minutes ago"

### Requirement: Manual refresh
The app bar SHALL have a refresh button that immediately requests tracker data and restarts the interval. While any tracker request is in progress the button SHALL be disabled and show a progress indicator.

#### Scenario: Refresh now
- **WHEN** the user clicks the refresh button
- **THEN** trackers are requested immediately, the button shows progress until the response arrives, and "Last updated" resets to "just now"

### Requirement: Background refresh failure
If a refresh fails after data has been shown, the dashboard SHALL keep showing the last known data, SHALL show a non-blocking snackbar saying the refresh failed, and SHALL keep refreshing on the normal interval. "Last updated" SHALL keep the time of the last successful load.

#### Scenario: API goes down
- **WHEN** a background refresh responds with HTTP 500
- **THEN** a snackbar reports the failure, the markers and list remain, and the next refresh is still attempted

#### Scenario: Recovery
- **WHEN** a later refresh succeeds
- **THEN** the data and "Last updated" update and no error is shown
