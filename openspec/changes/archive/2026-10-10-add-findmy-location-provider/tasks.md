## 1. Configuration

- [x] 1.1 Add `ConfigError` and extend `loadConfig` in `server/src/config.ts` with `locationProvider` (`mock` | `findmy`, default `mock`, invalid value throws naming the value and allowed values)
- [x] 1.2 When `findmy` is selected, require `ANISETTE_URL`, `FINDMY_DSID`, `FINDMY_SEARCH_PARTY_TOKEN` and throw a `ConfigError` naming each missing variable (no values in the message)
- [x] 1.3 Add `config.test.ts` cases: default, explicit `mock`, `findmy` with all vars, invalid value, missing vars, and error messages containing no configured values

## 2. Key derivation

- [x] 2.1 Compute a known test vector (fixed non-real 28-byte scalar → advertisement key and hashed id) with an independent tool and record it in the test
- [x] 2.2 Implement `server/src/location/findmy/keys.ts`: accept 28-byte or 85-byte base64 `privateKey`, derive the scalar, advertisement key (X coordinate) and base64 SHA-256 hashed id; reject other lengths
- [x] 2.3 Add `keys.test.ts`: known vector, 85-byte export gives the same id as the raw form, invalid length rejected

## 3. Report decryption

- [x] 3.1 Implement `server/src/location/findmy/report.ts`: drop byte 4 for payloads over 88 bytes, parse timestamp, ECDH with the ephemeral key, SHA-256 KDF, AES-128-GCM decrypt, return `{ lat, lng, accuracyMeters, timestamp }`
- [x] 3.2 Add `report.test.ts`: round trip with a report encrypted in the test (88- and 89-byte payloads), and a tampered payload fails

## 4. Apple client

- [x] 4.1 Implement `server/src/location/findmy/client.ts` with injectable `fetch`: get anisette headers from `ANISETTE_URL` (forward only `X-Apple-*` / `X-Mme-*`), POST the 7-day search for all hashed ids with Basic auth, 15 s timeout, return reports grouped by id
- [x] 4.2 Throw errors with safe messages only (e.g. `Find My request failed with status 401`, `Anisette request failed`), never including headers, bodies or credentials
- [x] 4.3 Add `client.test.ts` with a fake `fetch`: request URL, body, auth header and forwarded anisette headers; non-2xx and network errors produce safe messages

## 5. Provider

- [x] 5.1 Implement `FindMyLocationProvider` in `server/src/location/findmy/provider.ts`: build the id → key map at construction, warn once (id only) for `usesDerivation=true` and malformed keys, return `null` for them
- [x] 5.2 Add the snapshot cache (5 min), in-flight sharing, 1-minute failure backoff with an injectable `now()`, newest-report selection and skipping of reports that fail to decrypt
- [x] 5.3 Log fetch failures through an injectable logger using safe messages and return `null` locations
- [x] 5.4 Add `provider.test.ts`: one request for all trackers, cache hit at 2 min, refetch at 6 min, backoff at 30 s after failure, concurrent calls share a fetch, newest report wins, corrupt report skipped, derived key gives `null`, 401 gives `null`
- [x] 5.5 Add a secrets test: run failing and succeeding fetches with a capturing logger and assert no log contains the private key fixtures, token, DSID or anisette header values

## 6. Wiring

- [x] 6.1 Add `server/src/location/factory.ts` (`createLocationProvider(config, entries, logger)`) returning the mock or Find My provider
- [x] 6.2 Update `server/src/index.ts`: catch `ConfigError` and exit 1, pass full key entries only to the factory and `toTracker()` output to `createApp`
- [x] 6.3 Add an app-level test: with the Find My provider and a fake `fetch` returning a 401, `GET /api/trackers` responds 200 with all trackers and `null` locations, and the body has no secrets
- [x] 6.4 Run `npm test` and `npm run build` for the server and confirm both pass

## 7. Documentation

- [x] 7.1 Add root `README.md`: Node 20 (`nvm use`), `npm install`, `npm run dev`, `npm test`, env vars (`PORT`, `KEYS_FILE`, `MOCK_CENTER_LAT`, `MOCK_CENTER_LNG`, `VITE_REFRESH_INTERVAL_MS`, `LOCATION_PROVIDER`, `ANISETTE_URL`, `FINDMY_DSID`, `FINDMY_SEARCH_PARTY_TOKEN`), and that `keys.json` is never committed
- [x] 7.2 Add a Find My setup section: run an anisette server, obtain DSID and search-party token once with FindMy.py or macless-haystack, set the env vars, what a 401 means, and that only `usesDerivation=false` keys are supported
- [x] 7.3 Update `todo.md`: mark Change 6 and the README as done

## 8. Verification

- [x] 8.1 Start the app with the default mock provider and check in the browser (Playwright) that markers still show with no console errors
- [x] 8.2 Start with `LOCATION_PROVIDER=gps` and with `findmy` and a missing variable, and confirm startup stops with clear errors
- [x] 8.3 If real credentials and an anisette server are available, start with `LOCATION_PROVIDER=findmy` and check real positions on the map; otherwise record that live verification was skipped
  - Live verification done (2026-10-10): with a local anisette-v3-server and a FindMy.py token, `GET /api/trackers` returned decrypted positions for both trackers (report about 3 minutes old), with no errors logged.
