## Why

The dashboard only shows mock positions. The trackers in `keys.json` are OpenHaystack-style beacons whose real positions are uploaded to Apple's Find My network as encrypted location reports. A provider that fetches and decrypts those reports on the server makes the map show where the trackers really are, while the mock stays the default for local development.

## What Changes

- New env var `LOCATION_PROVIDER=mock|findmy` (default `mock`) selects the location provider at startup. Any other value stops startup with a clear error.
- New Find My provider that, for each tracker with `usesDerivation=false`:
  - derives the advertisement key and hashed public key from the tracker's `privateKey` (OpenHaystack format: raw 28-byte P-224 scalar or 85-byte SecKey export),
  - fetches location reports from Apple's Find My service, using anisette headers from `ANISETTE_URL` and a search-party token passed as `FINDMY_DSID` and `FINDMY_SEARCH_PARTY_TOKEN`,
  - decrypts the reports on the server and returns the newest one as `lat`, `lng`, `timestamp`, `accuracyMeters`.
- Trackers with `usesDerivation=true` are not supported: the server logs a warning (without key material) and returns `location: null` for them.
- Results are cached in memory for 5 minutes, and all trackers share one Apple request per refresh, to avoid rate limiting.
- With `LOCATION_PROVIDER=findmy`, startup stops with an error that names any missing Find My env var (never its value).
- Runtime failures (anisette, network or HTTP errors, expired token, undecryptable reports) never crash the API: affected trackers get `location: null` and a sanitized message is logged.
- Key material and credentials stay on the server and are never logged or returned.
- New root `README.md` covering setup, scripts, all env vars, the Find My prerequisites and the rule that `keys.json` must never be committed.

## Out of scope

- Storing location history.
- Multi-user accounts.
- The Apple ID password + 2FA login. The search-party token is obtained once with an external tool (e.g. FindMy.py or macless-haystack) and passed in env vars.
- Rolling-key derivation (`usesDerivation=true`).
- Running or bundling an anisette server.
- Client UI changes.

## Capabilities

### New Capabilities
- `findmy-locations`: Fetching and decrypting real tracker positions from Apple's Find My network: key derivation, required configuration, report selection, caching, error handling and secret hygiene.

### Modified Capabilities
- `tracker-locations`: "Mock provider is the default" becomes provider selection via `LOCATION_PROVIDER`, which still defaults to the mock provider.

## Impact

- New server modules under `server/src/location/findmy/` (key derivation, report decryption, Apple client, provider) and a provider factory. `index.ts` passes the full key entries (with secrets) to the factory but still passes only `toTracker()` output to the routes.
- `server/src/config.ts` gains the new env vars.
- No new npm dependencies: Node's built-in `crypto` supports secp224r1 ECDH, SHA-256 and AES-GCM, and `fetch` is built into Node 20.
- New env vars: `LOCATION_PROVIDER`, `ANISETTE_URL`, `FINDMY_DSID`, `FINDMY_SEARCH_PARTY_TOKEN`.
- New file: `README.md`.
