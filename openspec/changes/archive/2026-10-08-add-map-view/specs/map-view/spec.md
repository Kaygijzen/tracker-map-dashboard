# Spec Delta

## Purpose

Shows the user's trackers on an interactive map in the dashboard's main area, with per-tracker details and clear loading and error feedback.

## ADDED Requirements

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
Clicking a marker SHALL open a popup showing the tracker's name, id, whether it is deployed, whether it is active, and how long ago its location was recorded as a relative time (for example "5 minutes ago").

#### Scenario: Open popup
- **WHEN** the user clicks a tracker's marker
- **THEN** a popup opens with that tracker's name, id, deployed and active status, and a relative "last seen" time

### Requirement: Initial viewport
On the first successful load the map SHALL fit its view to include all markers. With exactly one marker it SHALL center on it at a street-level zoom. With no markers it SHALL show a fixed default view centered on 52.37, 4.89.

#### Scenario: Several markers
- **WHEN** the first load returns trackers at several locations
- **THEN** all markers are visible within the map view

#### Scenario: No markers
- **WHEN** the first load returns no trackers with a location
- **THEN** the map shows the default view and no markers

### Requirement: Loading and error states
While the tracker request is in progress the dashboard SHALL show an indeterminate progress bar above the map. If the request fails (network error or non-2xx status), the dashboard SHALL show an error alert above the map describing the failure, and the map SHALL remain usable.

#### Scenario: Loading
- **WHEN** the tracker request has not completed yet
- **THEN** a progress bar is visible

#### Scenario: Request fails
- **WHEN** `GET /api/trackers` responds with HTTP 500
- **THEN** an error alert is shown and the progress bar is hidden

### Requirement: Map follows layout size
The map SHALL redraw to its container's new size whenever the container is resized, including when the window is resized or the sidebar layout changes, without leaving blank or misaligned tile areas.

#### Scenario: Resize to mobile and back
- **WHEN** the viewport changes from 1280px to 375px wide and back
- **THEN** the map tiles cover the whole main area each time
