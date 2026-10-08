## MODIFIED Requirements

### Requirement: Loading and error states
While the first tracker request is in progress the dashboard SHALL show an indeterminate progress bar above the map; later refreshes SHALL NOT show this progress bar. If the first request fails (network error or non-2xx status), the dashboard SHALL show an error alert above the map describing the failure, and the map SHALL remain usable. The alert SHALL disappear once a later request succeeds.

#### Scenario: Loading
- **WHEN** the first tracker request has not completed yet
- **THEN** a progress bar is visible

#### Scenario: Request fails
- **WHEN** the first `GET /api/trackers` responds with HTTP 500
- **THEN** an error alert is shown and the progress bar is hidden

#### Scenario: Background refresh shows no progress bar
- **WHEN** a background refresh is in progress after data has been shown
- **THEN** no progress bar is shown above the map

## ADDED Requirements

### Requirement: Empty state
When a successful response contains no trackers, the map SHALL show a centered message saying there are no trackers and that trackers are added in `keys.json` on the server.

#### Scenario: No trackers configured
- **WHEN** `GET /api/trackers` returns `{ "trackers": [] }`
- **THEN** the map shows the "No trackers" message and no markers

### Requirement: Stale location indicator
A tracker location whose timestamp is more than 1 hour in the past SHALL be drawn as a faded marker with a dashed outline, and its popup SHALL show an "Outdated" chip.

#### Scenario: Old location
- **WHEN** a tracker's location timestamp is 2 hours old
- **THEN** its marker is faded with a dashed outline and its popup shows "Outdated"

#### Scenario: Recent location
- **WHEN** a tracker's location timestamp is 10 minutes old
- **THEN** its marker is drawn normally and its popup has no "Outdated" chip
