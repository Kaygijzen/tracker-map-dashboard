# Spec Delta

## Purpose

Loads tracker definitions from the server-side keys file and serves them as public tracker data, so the dashboard can list and map trackers without ever exposing key material.

## ADDED Requirements

### Requirement: Keys file location
The API SHALL read tracker definitions once at startup from the file named by the `KEYS_FILE` environment variable, or from `keys.json` in the project root when `KEYS_FILE` is not set.

#### Scenario: Default path
- **WHEN** the API starts without `KEYS_FILE` and `keys.json` exists in the project root
- **THEN** the trackers from that file are served by `GET /api/trackers`

#### Scenario: Overridden path
- **WHEN** the API starts with `KEYS_FILE=/tmp/other.json`
- **THEN** the trackers from `/tmp/other.json` are served

#### Scenario: Missing file
- **WHEN** the keys file does not exist
- **THEN** the API logs a warning naming the path, starts normally and serves an empty tracker list

### Requirement: Keys file validation
The API SHALL validate the keys file at startup and refuse to start if it is not valid JSON, does not match the expected entry shape, or contains duplicate `id` values. Error messages SHALL name the failing entry index and field but SHALL NOT include any field values.

#### Scenario: Invalid entry
- **WHEN** an entry has a non-numeric `id`
- **THEN** the API exits with an error that names the entry index and the `id` field

#### Scenario: Duplicate ids
- **WHEN** two entries share the same `id`
- **THEN** the API exits with an error naming the duplicate id

#### Scenario: Repeated names are allowed
- **WHEN** two entries share a `name` but have different `id`s
- **THEN** both trackers are served

### Requirement: Trackers endpoint
The API SHALL respond to `GET /api/trackers` with HTTP 200 and a JSON body `{ "trackers": [...] }` holding one object per tracker in file order. Each object SHALL have exactly the fields `id` (number), `name` (string), `color` (string), `isDeployed` (boolean), `isActive` (boolean) and `location`.

#### Scenario: Tracker list
- **WHEN** the keys file has two entries and a client sends `GET /api/trackers`
- **THEN** the response has two tracker objects with those fields and the entries' values

### Requirement: Tracker color as hex
The API SHALL convert each entry's `colorComponents` `[r, g, b, a]` (each 0–1) into a lowercase `#rrggbb` string, rounding each channel to the nearest 0–255 value, clamping values outside 0–1 and ignoring alpha.

#### Scenario: Green
- **WHEN** an entry has `colorComponents` `[0, 1, 0, 1]`
- **THEN** its `color` is `#00ff00`

#### Scenario: Out-of-range component
- **WHEN** an entry has `colorComponents` `[1.2, -0.1, 0.5, 1]`
- **THEN** its `color` is `#ff0080`

### Requirement: Tracker location in response
Each tracker's `location` SHALL be either `null` or an object with `lat` (number), `lng` (number), `timestamp` (ISO 8601 string) and `accuracyMeters` (number), taken from the configured location provider at request time.

#### Scenario: Location available
- **WHEN** the location provider has a position for a tracker
- **THEN** that tracker's `location` holds the position with an ISO timestamp

#### Scenario: Location unavailable
- **WHEN** the location provider returns no position for a tracker
- **THEN** that tracker is still listed and its `location` is `null`

### Requirement: Secrets never leave the server
No API response SHALL contain `privateKey`, `additionalKeys`, `account` or any value of those fields, and no field of a keys-file entry outside the public tracker shape SHALL be included.

#### Scenario: No private fields in tracker list
- **WHEN** a client sends `GET /api/trackers`
- **THEN** the response body contains none of the field names `privateKey`, `additionalKeys`, `account` and none of the private values from the keys file
