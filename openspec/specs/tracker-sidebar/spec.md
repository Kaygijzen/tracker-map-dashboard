# tracker-sidebar Specification

## Purpose
Lists all trackers in the dashboard sidebar so users can find, filter and select a tracker, including trackers that currently have no location.

## Requirements

### Requirement: Tracker list items
The sidebar SHALL list every tracker from `GET /api/trackers` in API order. Each item SHALL show a dot in the tracker's color, the tracker's name as primary text, its id and relative "last seen" time as secondary text, and a Deployed chip and an Active chip reflecting the tracker's status.

#### Scenario: Item content
- **WHEN** the API returns a deployed, inactive tracker named "rotokey_13" with id 6253030 last seen 5 minutes ago
- **THEN** its list item shows a dot in its color, "rotokey_13", "ID 6253030 · 5 minutes ago", a highlighted "Deployed" chip and an unhighlighted "Inactive" chip

#### Scenario: Repeated names
- **WHEN** two trackers share a name but have different ids
- **THEN** both are listed as separate items

### Requirement: Trackers without a location
Trackers whose `location` is null SHALL be listed but disabled (not selectable) and SHALL show "No location" in place of the last seen time.

#### Scenario: No location
- **WHEN** a tracker has no location
- **THEN** its item is shown disabled with "No location" and clicking it does nothing

### Requirement: Search filter
A search field at the top of the sidebar SHALL filter the list, case-insensitively, to trackers whose name contains the query or whose id contains the query digits. An empty query SHALL show all trackers.

#### Scenario: Filter by name
- **WHEN** the user types "ROTO"
- **THEN** only trackers whose name contains "roto" (any case) are listed

#### Scenario: Filter by id
- **WHEN** the user types "5253"
- **THEN** only trackers whose id contains "5253" are listed

#### Scenario: No matches
- **WHEN** no tracker matches the query
- **THEN** the list shows a "No trackers match" message

### Requirement: Shown and total count
The sidebar SHALL show how many trackers are listed out of the total, in the form "Showing N of M".

#### Scenario: Filtered count
- **WHEN** 1 of 2 trackers matches the query
- **THEN** the sidebar shows "Showing 1 of 2"

### Requirement: Select from list
Selecting an enabled list item SHALL mark that item as selected, move the map to the tracker's marker and open its popup. On viewports where the sidebar is a temporary drawer, selecting SHALL also close the drawer.

#### Scenario: Select on desktop
- **WHEN** the user clicks a tracker in the list
- **THEN** the item is highlighted, the map flies to its marker and the marker's popup opens

#### Scenario: Select on mobile
- **WHEN** the user selects a tracker from the open mobile drawer
- **THEN** the drawer closes and the map shows the tracker's open popup

### Requirement: List reflects map selection
When a tracker is selected on the map, the sidebar SHALL highlight its list item and scroll it into view if it is listed under the current filter.

#### Scenario: Marker click highlights item
- **WHEN** the user clicks a tracker's marker
- **THEN** the matching list item is highlighted and visible in the list

### Requirement: Outdated chip in list
List items for trackers whose location is more than 1 hour old SHALL show an "Outdated" chip next to the status chips.

#### Scenario: Stale tracker in list
- **WHEN** a tracker's location timestamp is 2 hours old
- **THEN** its list item shows an "Outdated" chip

### Requirement: Empty list
When there are no trackers at all, the sidebar SHALL show "No trackers found" instead of the list.

#### Scenario: No trackers
- **WHEN** `GET /api/trackers` returns no trackers
- **THEN** the sidebar shows "No trackers found" and "Showing 0 of 0"
