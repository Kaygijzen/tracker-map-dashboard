## Context

The server reads `keys.json` once at startup (`loadKeysFile`), maps the entries to public `Tracker` objects with `toTracker()`, and calls `LocationProvider.getLatestLocation(id)` for every tracker on each `GET /api/trackers`. `index.ts` always builds a `MockLocationProvider` right now. The client polls every 30 seconds. Both trackers in the current `keys.json` have 28-byte raw keys and `usesDerivation=false`.

The Find My protocol details (endpoint, auth, report layout) come from OpenHaystack, macless-haystack and FindMy.py. See `todo.md` for the research notes.

## Goals / Non-Goals

**Goals:**
- Keep the `LocationProvider` contract and `createApp` unchanged. The Find My provider is a drop-in replacement.
- Keep secrets in one place: only the provider holds full `KeyEntry` objects. Routes keep receiving `toTracker()` output.
- Make every crypto step testable offline, with no network access in tests.

**Non-Goals:**
- Retrying or refreshing an expired search-party token. The user replaces it and restarts.
- Persisting the cache across restarts.

## Decisions

### Module layout
`server/src/location/findmy/`:
- `keys.ts`: `privateKey` → `{ scalar, advertisementKey, hashedId }`.
- `report.ts`: decrypts one report payload.
- `client.ts`: fetches anisette headers and the Apple reports. Takes an injectable `fetch`.
- `provider.ts`: `FindMyLocationProvider`, which handles the cache, in-flight sharing and newest-report selection.

`server/src/location/factory.ts` holds `createLocationProvider(config, entries, logger)`.

Alternative: one file. Rejected because splitting lets the crypto be unit-tested without HTTP or caching.

### Configuration validation in `loadConfig`
`loadConfig` parses `LOCATION_PROVIDER` (`mock` by default) and, for `findmy`, requires `ANISETTE_URL`, `FINDMY_DSID` and `FINDMY_SEARCH_PARTY_TOKEN`. It throws a `ConfigError` whose message names only variable names and the bad provider value. `index.ts` catches `ConfigError` like `KeysFileError` and exits with code 1. This keeps startup failure in the same place as the other config handling.

### Crypto with Node built-ins only
- `crypto.createECDH('secp224r1')` with `setPrivateKey(scalar)`. `getPublicKey()` gives `04‖X‖Y`, and X (bytes 1–29) is the advertisement key. `hashedId = base64(sha256(X))`.
- The private key is either 28 bytes, used as is, or 85 bytes, where the scalar is the last 28 bytes. Any other length is invalid for that tracker only.
- For each report payload (base64), when its length is over 88 bytes, drop byte 4. Then:
  - Read the timestamp as a big-endian uint32 at bytes 0–3, plus 978307200, in Unix seconds.
  - The ephemeral key is bytes 5–62.
  - `shared = ecdh.computeSecret(ephemeral)`.
  - `kdf = sha256(shared ‖ 00000001 ‖ ephemeral)`. The AES-128-GCM key is `kdf[0..16]` and the IV is `kdf[16..32]`.
  - The ciphertext is bytes 62–72 and the tag is bytes 72 onward.
  - In the plaintext, lat is int32 BE at 0 divided by 1e7, lng is int32 BE at 4 divided by 1e7, and accuracy is uint8 at 8.
- `@noble/curves` and other npm crypto libraries were rejected because Node covers P-224 ECDH and AES-GCM natively, and a new dependency would mean more supply-chain surface for key handling.

### Apple request
- `GET ANISETTE_URL` returns a JSON object of headers. Forward the keys that start with `X-Apple-` or `X-Mme-` (case-insensitive).
- `POST https://gateway.icloud.com/acsnservice/fetch`:
  - Body: `{"search":[{"startDate": now-7d ms, "endDate": now ms, "ids": [...hashedIds]}]}`.
  - Headers: `Authorization: Basic base64(dsid:token)`, the anisette headers, and `Content-Type: application/json`.
- Responses come back as `{"results":[{"id", "payload", ...}]}` and are grouped by `id`.
- Each call has a 15-second `AbortSignal.timeout`.
- One request per fetch for all trackers, because Apple accepts many ids and one request keeps the anisette and rate-limit cost flat.

### Cache and in-flight sharing
The provider keeps one snapshot (`Map<trackerId, Location | null>` and `fetchedAt`) and one `inFlight` promise. `getLatestLocation(id)`:
1. Uses the snapshot if it is younger than 5 minutes.
2. Otherwise joins the `inFlight` promise or starts a new fetch.
3. After a failure, it stores an empty snapshot that expires after 1 minute.

`createApp` calls `getLatestLocation` for all trackers in parallel, so the first call starts the fetch and the rest join it. Time comes from an injectable `now()` for tests.

Alternative: a per-tracker cache. Rejected because it would split the single request.

### Logging and secret hygiene
The provider takes a `logger` (`{ warn, error }`, default `console`). Every message is built from a fixed template plus safe values: tracker ids, HTTP status codes, counts and the error class name. Error objects, response bodies, headers and URLs that carry credentials are never logged. Warnings for derived or malformed keys are logged once, at construction.

### Testing
- **Known vector:** a fixed 28-byte test scalar (not a real tracker key) with its expected advertisement key and hashed id. These are computed once with an independent implementation (e.g. Python `cryptography` or the `openssl` CLI) and hard-coded in the test.
- **Round trip:** the test generates an ephemeral P-224 key, encrypts a plaintext with the same KDF and AES-GCM steps, builds an 88-byte and an 89-byte payload, and checks that both decrypt.
- **Provider and client:** a fake `fetch` and a fake clock cover the single request, the 5-minute cache, the 1-minute failure backoff, in-flight sharing, newest-report selection, corrupt-report skipping and HTTP 401 handling.
- **Secrets:** a capturing logger, checked against the secret fixtures, the token and the DSID.
- **Config:** `loadConfig` tests for the default, explicit `mock`, `findmy`, an invalid value and missing variables.

## Risks / Trade-offs

- [Apple changes or retires the `acsnservice/fetch` endpoint or its payload format] → Isolate it in `client.ts` and `report.ts`. Failures only yield `null` locations, and the mock remains the default.
- [The search-party token expires (it typically lasts weeks to months)] → A 401 is logged clearly ("Find My request failed with status 401"), and the README explains how to get a new token.
- [Anisette servers vary in their response shape] → Accept any JSON object and forward only the `X-Apple-*` and `X-Mme-*` keys. The README points to a known-compatible server (e.g. anisette-v3-server).
- [Reports lag by minutes to hours, or don't exist when no Apple device has passed by] → Expected behavior: the existing stale indicator and the `null` location handling already cover it.
- [Up to 5 minutes of extra delay from the cache] → An acceptable trade-off against Apple rate limits.

## Migration Plan

`LOCATION_PROVIDER` defaults to `mock`, so existing setups behave as before. To roll back, unset `LOCATION_PROVIDER` or set it to `mock`.
