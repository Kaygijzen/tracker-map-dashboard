# Proposal

## Why

The dashboard needs tracker data to show anything on a map, and `keys.json` holds secret private keys that must never reach the browser. The API must therefore read the file server-side and expose only safe fields. `keys.json` has no positions, so we also need a location source that can later be swapped for a real Find My lookup.

## What Changes

- On startup the API reads `keys.json` from the project root (or the path in `KEYS_FILE`), validates it and keeps the trackers in memory.
- New endpoint `GET /api/trackers` that returns every tracker as a public object (`id`, `name`, `color` as hex, `isDeployed`, `isActive`) with its latest `location` or `null`.
- Private fields (`privateKey`, `additionalKeys`, `account`, and every other field not in the public shape) are never included in any response.
- A pluggable location source with a mock implementation: stable per-tracker positions around a configurable center (default Amsterdam 52.37, 4.89), with a small random drift on each request.
- Unit tests, including one that proves no private fields leak.

**Out of scope:** real Find My / Apple location lookups, persistence or location history, editing trackers, reloading `keys.json` without a restart, any client UI.

## Capabilities

### New Capabilities
- `tracker-api`: Loading tracker definitions from the keys file and serving them as public tracker data over `GET /api/trackers`, without exposing secrets.
- `tracker-locations`: Where tracker positions come from: the location provider contract and the mock provider's behavior and configuration.

### Modified Capabilities
- None. (`api-server` requirements are unchanged; the new route lives under the existing `/api` prefix.)

## Impact

- New server modules for keys loading, tracker mapping, location providers and the trackers route; `createApp()` now takes its dependencies (tracker list and location provider) so tests can inject fixtures.
- New dependency: `zod` (server).
- New env vars: `KEYS_FILE`, `MOCK_CENTER_LAT`, `MOCK_CENTER_LNG`.
