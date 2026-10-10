## MODIFIED Requirements

### Requirement: Mock provider is the default
The API SHALL choose its location provider at startup from the `LOCATION_PROVIDER` environment variable: `mock` selects the mock provider and `findmy` selects the Find My provider. When `LOCATION_PROVIDER` is unset or empty, the API SHALL use the mock provider. Any other value SHALL stop startup with an error that names the invalid value and the allowed values.

#### Scenario: Default provider
- **WHEN** the API starts with no provider configuration
- **THEN** every tracker in `GET /api/trackers` has a non-null location near the mock center

#### Scenario: Mock selected explicitly
- **WHEN** the API starts with `LOCATION_PROVIDER=mock`
- **THEN** every tracker in `GET /api/trackers` has a non-null location near the mock center

#### Scenario: Find My selected
- **WHEN** the API starts with `LOCATION_PROVIDER=findmy` and all Find My settings present
- **THEN** tracker locations come from the Find My provider

#### Scenario: Invalid provider value
- **WHEN** the API starts with `LOCATION_PROVIDER=gps`
- **THEN** the process exits with a non-zero status and logs an error naming `gps` and the allowed values `mock` and `findmy`
