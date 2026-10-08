# map-view Specification

## Purpose
Shows the user's trackers on an interactive map in the dashboard's main area, with per-tracker details and clear loading and error feedback.

## Requirements

### Requirement: OpenStreetMap base map
The main content area SHALL show an interactive map using OpenStreetMap tiles that fills the whole area and SHALL show the attribution "© OpenStreetMap contributors" with a link to the OpenStreetMap copyright page.

#### Scenario: Map with attribution
- **WHEN** the dashboard loads
- **THEN** a pannable, zoomable map fills the main area and the OpenStreetMap attribution link is visible

### Requirement: Tracker markers
The map SHALL show one marker for every tracker returned by `GET /api/trackers` whose `location` is not null, positioned at its `lat`/`lng` and drawn in the tracker's `color`. Trackers with a null location SHALL NOT be drawn.

#### Scenario: Markers for located trackers
- **WHEN** the API returns three trackers, two with a location
- **THEN** the map shows exactly two markers, each in its tracker's color

#### Scenario: Trackers with the same name
- **WHEN** two trackers share a name but have different ids
- **THEN** both get their own marker

### Requirement: Marker popup
Clicking a marker SHALL select that tracker and open a popup showing the tracker's name, id, whether it is deployed, whether it is active, and how long ago its location was recorded as a relative time (for example "5 minutes ago"). Closing the popup SHALL clear the selection.

#### Scenario: Open popup
- **WHEN** the user clicks a tracker's marker
- **THEN** a popup opens with that tracker's name, id, deployed and active status, and a relative "last seen" time

#### Scenario: Close popup clears selection
- **WHEN** the user closes the open popup
- **THEN** no tracker is selected

### Requirement: Initial viewport
On the first successful load the map SHALL fit its view to include all markers. With exactly one marker it SHALL center on it at a street-level zoom. With no markers it SHALL show a fixed default view centered on 52.37, 4.89.

#### Scenario: Several markers
- **WHEN** the first load returns trackers at several locations
- **THEN** all markers are visible within the map view

#### Scenario: No markers
- **WHEN** the first load returns no trackers with a location
- **THEN** the map shows the default view and no markers

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

### Requirement: Map follows layout size
The map SHALL redraw to its container's new size whenever the container is resized, including when the window is resized or the sidebar layout changes, without leaving blank or misaligned tile areas.

#### Scenario: Resize to mobile and back
- **WHEN** the viewport changes from 1280px to 375px wide and back
- **THEN** the map tiles cover the whole main area each time

### Requirement: Selected marker emphasis
The selected tracker's marker SHALL be drawn larger and with a thicker outline than other markers and above them.

#### Scenario: Emphasized marker
- **WHEN** a tracker is selected
- **THEN** its marker is larger than unselected markers

### Requirement: Fly to selected tracker
When a tracker is selected from outside the map (for example the sidebar), the map SHALL animate to the tracker's position, at street-level zoom or closer if already zoomed in further, and then open its popup.

#### Scenario: External selection
- **WHEN** a tracker with a location is selected in the sidebar
- **THEN** the map moves to center on its marker and opens that marker's popup

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
