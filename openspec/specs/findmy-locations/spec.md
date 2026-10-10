# findmy-locations Specification

## Purpose
Gets real tracker positions by fetching the trackers' encrypted location reports from Apple's Find My network and decrypting them on the server, without exposing key material or credentials.

## Requirements

### Requirement: Find My configuration
When `LOCATION_PROVIDER=findmy`, the API SHALL require the environment variables `ANISETTE_URL`, `FINDMY_DSID` and `FINDMY_SEARCH_PARTY_TOKEN`. If any of them is missing or empty, startup SHALL stop with an error that names each missing variable and contains no configured value.

#### Scenario: All settings present
- **WHEN** the API starts with `LOCATION_PROVIDER=findmy` and all three variables set
- **THEN** the API starts and serves `GET /api/trackers`

#### Scenario: Missing settings
- **WHEN** the API starts with `LOCATION_PROVIDER=findmy` and `FINDMY_SEARCH_PARTY_TOKEN` unset
- **THEN** the process exits with a non-zero status and the error names `FINDMY_SEARCH_PARTY_TOKEN`

#### Scenario: Settings ignored for the mock provider
- **WHEN** the API starts with the mock provider and none of the Find My variables set
- **THEN** the API starts normally

### Requirement: Advertisement key derivation
For each tracker with `usesDerivation` false or absent, the provider SHALL derive the P-224 public key from `privateKey` (base64 of either a 28-byte private scalar or an 85-byte key export whose last 28 bytes are the scalar), take its 28-byte X coordinate as the advertisement key, and use the base64 SHA-256 of the advertisement key as the tracker's report id.

#### Scenario: Raw 28-byte key
- **WHEN** a tracker's `privateKey` is a known 28-byte test scalar
- **THEN** the derived advertisement key and report id equal the known expected values

#### Scenario: 85-byte key export
- **WHEN** a tracker's `privateKey` is the 85-byte export of that same scalar
- **THEN** the derived report id equals the one from the raw 28-byte form

#### Scenario: Malformed key
- **WHEN** a tracker's `privateKey` decodes to neither 28 nor 85 bytes
- **THEN** that tracker's location is `null`, a warning naming the tracker id is logged, and other trackers are unaffected

### Requirement: Derived keys not supported
For a tracker with `usesDerivation` true, the provider SHALL return no location and SHALL log one warning per startup that names the tracker id and contains no key material.

#### Scenario: Tracker uses derivation
- **WHEN** `GET /api/trackers` includes a tracker with `usesDerivation: true`
- **THEN** its `location` is `null`, the other trackers still get their locations, and the warning does not contain its `privateKey`

### Requirement: Fetching reports from Apple
The provider SHALL request location reports from the past 7 days for all supported trackers in a single request to Apple's Find My report service, authenticated with `FINDMY_DSID` and `FINDMY_SEARCH_PARTY_TOKEN` and the anisette headers fetched from `ANISETTE_URL` for that request.

#### Scenario: One request for all trackers
- **WHEN** `GET /api/trackers` is served for three supported trackers with an empty cache
- **THEN** the anisette server is called once and Apple's report service is called once, with all three report ids

### Requirement: Report decryption
The provider SHALL decrypt each report with the tracker's private key (ECDH on P-224 with the report's ephemeral key, SHA-256 key derivation, AES-128-GCM) and read latitude, longitude, accuracy and the observation time from it. A tracker's location SHALL be its report with the newest observation time. A report that fails to decrypt SHALL be skipped.

#### Scenario: Newest report wins
- **WHEN** Apple returns two valid reports for a tracker, observed at 10:00 and 11:00
- **THEN** the tracker's location is the 11:00 report, with `timestamp` as an ISO 8601 string of 11:00, and `lat`, `lng` and `accuracyMeters` from that report

#### Scenario: Corrupt report skipped
- **WHEN** Apple returns one corrupt report and one valid report for a tracker
- **THEN** the tracker's location is the valid report

#### Scenario: No reports
- **WHEN** Apple returns no valid reports for a tracker
- **THEN** the tracker's `location` is `null`

### Requirement: Location cache
The provider SHALL reuse fetched results for 5 minutes, so API requests within that window make no new call to Apple. Concurrent requests while a fetch is in progress SHALL share that fetch. After a failed fetch, the provider SHALL wait at least 1 minute before calling Apple again.

#### Scenario: Cached within 5 minutes
- **WHEN** `GET /api/trackers` is requested twice, 2 minutes apart
- **THEN** Apple's report service is called only once

#### Scenario: Refreshed after 5 minutes
- **WHEN** `GET /api/trackers` is requested again 6 minutes after the first fetch
- **THEN** Apple's report service is called again

#### Scenario: Failure backoff
- **WHEN** a fetch fails and `GET /api/trackers` is requested again 30 seconds later
- **THEN** Apple's report service is not called again and the trackers' locations are `null`

### Requirement: Failures do not break the API
Any failure while fetching or decrypting reports (anisette error, network error, non-success HTTP status such as an expired token, malformed response) SHALL result in `null` locations for the affected trackers and a logged message, and `GET /api/trackers` SHALL still respond with 200 and the full tracker list.

#### Scenario: Apple rejects the token
- **WHEN** Apple's report service responds with 401
- **THEN** `GET /api/trackers` responds 200, every tracker's `location` is `null`, and the log says the Find My request failed with status 401

#### Scenario: Anisette server down
- **WHEN** the anisette server cannot be reached
- **THEN** `GET /api/trackers` responds 200 with `null` locations

### Requirement: Secrets are never logged or returned
No log line and no API response SHALL contain a tracker's `privateKey`, derived private or shared key material, the `FINDMY_SEARCH_PARTY_TOKEN` value, the `FINDMY_DSID` value or the anisette header values.

#### Scenario: Logs during a failing fetch
- **WHEN** a fetch fails and the provider logs the failure
- **THEN** no logged text contains the private key, the token, the DSID or any anisette header value
