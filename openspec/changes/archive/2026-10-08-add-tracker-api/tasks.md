# Tasks

## 1. Keys file loading

- [x] 1.1 Add `zod` to the server and implement `keys.ts` (schema, `loadKeysFile`, missing file → `[]` with warning, invalid JSON/shape/duplicate ids → error without values); verify unit tests for valid, missing, invalid-shape and duplicate-id fixtures pass
- [x] 1.2 Add `config.ts` resolving `KEYS_FILE` (default and relative paths against the repo root), `MOCK_CENTER_LAT/LNG` and `PORT`; verify a unit test covers default and overridden values

## 2. Public tracker mapping

- [x] 2.1 Implement `trackers.ts` with the `Tracker` DTO, allow-list `toTracker()` and `colorToHex()`; verify unit tests for `[0,1,0,1]` → `#00ff00` and `[1.2,-0.1,0.5,1]` → `#ff0080`

## 3. Location providers

- [x] 3.1 Define the `LocationProvider` interface and `Location` type in `location/provider.ts`; verify `npm run build -w server` passes
- [x] 3.2 Implement `MockLocationProvider` (deterministic base within 5 km, ≤50 m drift, current timestamp, configurable center); verify unit tests for distinct ids, stability across instances, drift bounds and custom center

## 4. Trackers endpoint

- [x] 4.1 Change `createApp()` to accept `{ trackers, locationProvider }`, add `GET /api/trackers`, and wire `index.ts` to load the keys file and exit with code 1 on validation errors; verify supertest tests for the response shape, `null` locations and that the health/404 tests still pass
- [x] 4.2 Add the leak test: a fixture with secret `privateKey`, `additionalKeys` and `account` values, asserting the serialized `/api/trackers` body contains none of those field names or values; verify it passes and fails if `toTracker` spreads the entry
- [x] 4.3 Run `npm run dev` with the real `keys.json` and verify `curl localhost:5173/api/trackers` returns both `rotokey_13` trackers with distinct ids and locations near Amsterdam, and no private fields

## Workflow follow-up

- Archive the change with `/opsx:archive` after review.
