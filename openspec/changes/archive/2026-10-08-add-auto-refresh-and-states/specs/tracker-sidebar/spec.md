## ADDED Requirements

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
