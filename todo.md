# Todo

Leftover work after changes 1–5 of `plan.md` were implemented and archived.

## 1. Change 6 — `add-findmy-location-provider` (done)

- [x] Implemented in `server/src/location/findmy/`. Select it with `LOCATION_PROVIDER=findmy`; see the README for setup.

Research notes for the implementation (sources: [OpenHaystack](https://github.com/seemoo-lab/openhaystack), [macless-haystack](https://github.com/dchristl/macless-haystack), [FindMy.py](https://github.com/malmeloo/findmy.py)):

- **Endpoint:** `POST https://gateway.icloud.com/acsnservice/fetch` with body `{"search":[{"startDate","endDate","ids":[hashedKeyB64]}]}`.
- **Auth:** HTTP Basic `dsid:searchPartyToken` plus the anisette `X-Apple-*` / `X-Mme-*` headers from `ANISETTE_URL`.
  - Apple's login (GSA/SRP with 2FA) is too complex to do inside the app. Get the token once with an external tool (FindMy.py or macless-haystack) and pass it as `FINDMY_DSID` and `FINDMY_SEARCH_PARTY_TOKEN`.
- **Key format:** `privateKey` is either a raw 28-byte P-224 scalar or an 85-byte SecKey export (`04‖X‖Y‖K`, where the scalar is the last 28 bytes).
  - Advertisement key = the public key's X coordinate (28 bytes).
  - Hashed id = base64(sha256(advertisement key)).
  - Support only `usesDerivation=false`. For derived keys, log a warning that contains no key material and return `null`.
- **Report decryption:**
  - If the payload is longer than 88 bytes, drop byte 4.
  - Timestamp: big-endian `uint32` at bytes 0–3, plus 978307200.
  - Ephemeral key: bytes 5–62. Shared secret: ECDH on secp224r1 (`crypto.createECDH('secp224r1')`).
  - Key derivation: SHA-256 of shared secret ‖ `00000001` ‖ ephemeral key. The first 16 bytes are the AES-128-GCM key and the last 16 are the IV.
  - Ciphertext: bytes 62–72. Tag: bytes 72 onward.
  - Plaintext: lat and lng as `int32` / 1e7, then accuracy `uint8`.
- **Spec changes:**
  - MODIFIED `tracker-locations` "Mock provider is the default": provider chosen with `LOCATION_PROVIDER=mock|findmy`, default `mock`, and an invalid value stops startup.
  - New capability `findmy-locations`.
- **Behavior:** cache results in memory for 5 minutes. Never log keys or credentials. On any error, return `null` locations and keep the API running.
- **Tests:**
  - Key derivation against a known vector.
  - Decryption round trip with a report encrypted in the test.
  - Caching and provider selection.
  - Logs never contain secrets.
  - Mocked HTTP only.

## 2. README

- [x] Add `README.md` covering: Node 20 (`nvm use`), `npm install`, `npm run dev`, `npm test`, env vars (`PORT`, `KEYS_FILE`, `MOCK_CENTER_LAT`, `MOCK_CENTER_LNG`, `VITE_REFRESH_INTERVAL_MS`), and the rule that `keys.json` is never committed. Change 6 extends it with the Find My setup.

## 3. Cleanup

- [ ] Remove the leftover worktree from the blocked Change 6 agent (gitignored, holds one uncommitted draft): `git worktree remove --force .claude/worktrees/agent-ace4f82f54f803f94`, then `git branch -D worktree-agent-ace4f82f54f803f94` if that branch still exists.
