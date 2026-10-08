## MODIFIED Requirements

### Requirement: Marker popup
Clicking a marker SHALL select that tracker and open a popup showing the tracker's name, id, whether it is deployed, whether it is active, and how long ago its location was recorded as a relative time (for example "5 minutes ago"). Closing the popup SHALL clear the selection.

#### Scenario: Open popup
- **WHEN** the user clicks a tracker's marker
- **THEN** a popup opens with that tracker's name, id, deployed and active status, and a relative "last seen" time

#### Scenario: Close popup clears selection
- **WHEN** the user closes the open popup
- **THEN** no tracker is selected

## ADDED Requirements

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
