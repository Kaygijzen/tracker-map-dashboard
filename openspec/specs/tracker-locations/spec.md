# tracker-locations Specification

## Purpose
Defines where tracker positions come from: a single location-provider contract that the API depends on, and the mock provider used until real Find My lookups exist.

## Requirements

### Requirement: Location provider contract
The API SHALL obtain each tracker's position from one configured location provider that, given a tracker id, returns either the latest position (`lat`, `lng`, `timestamp`, `accuracyMeters`) or no position.

#### Scenario: Provider is swappable
- **WHEN** the API is created with a different location provider
- **THEN** `GET /api/trackers` returns that provider's positions without other code changes

### Requirement: Mock provider is the default
The API SHALL use the mock location provider when no other provider is configured.

#### Scenario: Default provider
- **WHEN** the API starts with no provider configuration
- **THEN** every tracker in `GET /api/trackers` has a non-null location near the mock center

### Requirement: Stable mock positions
The mock provider SHALL derive each tracker's base position deterministically from its id, within 5 km of the configured center, so a tracker appears in the same area across requests and restarts, and different ids get different positions.

#### Scenario: Same area across restarts
- **WHEN** the API is restarted and the same tracker is requested again
- **THEN** its position is within 100 m of its position before the restart

#### Scenario: Distinct ids
- **WHEN** two trackers have different ids
- **THEN** their base positions differ

### Requirement: Mock drift
The mock provider SHALL add a small random offset of at most 50 m to the base position on each call and SHALL set `timestamp` to the time of the call.

#### Scenario: Position changes slightly between calls
- **WHEN** the same tracker is requested twice
- **THEN** both positions are within 100 m of each other and within 50 m of the base position

### Requirement: Configurable mock center
The mock center SHALL default to latitude 52.37, longitude 4.89 (Amsterdam) and SHALL be overridable with the `MOCK_CENTER_LAT` and `MOCK_CENTER_LNG` environment variables.

#### Scenario: Custom center
- **WHEN** the API starts with `MOCK_CENTER_LAT=48.85` and `MOCK_CENTER_LNG=2.35`
- **THEN** mock positions are within 5 km of that point
