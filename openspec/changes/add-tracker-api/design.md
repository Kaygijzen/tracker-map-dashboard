# Design

## Context

`server/src/app.ts` exports `createApp()` with `/api/health` and a JSON 404 for other `/api` paths; `index.ts` listens on `PORT`. Tests use vitest + supertest. `keys.json` is an array of objects with `id` (number), `colorComponents` (4 numbers), `name`, `privateKey` (base64), `icon`, `isDeployed`, `colorSpaceName`, `usesDerivation`, `isActive`, `additionalKeys`, `account`. The current file has two entries with the same name and different ids.

## Goals / Non-Goals

**Goals:**
- Secrets can only leave the loader module through an explicit allow-list mapping.
- The app is testable with in-memory fixtures (no real `keys.json` needed in tests).

**Non-Goals:**
- Exposing a provider selection env var (comes with the Find My change).
- Hot reload of the keys file.

## Decisions

- **Module layout** (`server/src/`):
  - `keys.ts`: zod schema for the file, `loadKeysFile(path)` → `KeyEntry[]` (internal type, includes secrets). Unknown extra fields are allowed (`.passthrough()` is not needed; zod strips them by default), but secret fields are part of the schema because the Find My provider will need `privateKey` later.
  - `trackers.ts`: `Tracker` (public DTO) and `toTracker(entry)`, which builds the object field by field (allow-list, never spread). `colorToHex()`.
  - `location/provider.ts`: `interface LocationProvider { getLatestLocation(trackerId: number): Promise<Location | null> }`. Async from the start, because a real provider will do network I/O.
  - `location/mock.ts`: `MockLocationProvider({ center })`.
  - `app.ts`: `createApp({ trackers, locationProvider })`; `/api/trackers` maps trackers and awaits locations with `Promise.all`.
  - `config.ts`: reads `KEYS_FILE`, `MOCK_CENTER_LAT/LNG`, `PORT`.
- **Validation errors without values**: format `ZodError.issues` as `entry[<index>].<field>: <message>` only. zod's default messages for these checks ("Expected number, received string") do not embed values. Duplicate-id check runs after parsing; ids are not secret.
- **Missing file → empty list with warning; invalid file → throw** from `loadKeysFile`, and `index.ts` logs the message and exits with code 1. A missing file is a normal first-run state; a broken file is a mistake that must be fixed.
- **Path resolution**: the default is `keys.json` in the repo root, resolved from the server module location (`../../keys.json` relative to `server/src` or `server/dist`), not from `process.cwd()`, because `npm run dev -w server` runs with cwd `server/`. A relative `KEYS_FILE` resolves against the repo root for the same reason.
- **Mock positions**: hash the id with a 32-bit FNV-1a variant into two deterministic values in [0,1); place the base point at distance `sqrt(u)*5km` and bearing `v*2π` from the center (uniform over the disc). Convert meters to degrees with `lat: m/111_320`, `lng: m/(111_320·cos(lat))`. Drift: uniform random point within 50 m on each call (`Math.random`). `accuracyMeters`: deterministic 5–50 m from the hash. Alternative: seeded PRNG library — unnecessary.
- **Response wrapper** `{ trackers: [...] }` instead of a bare array, so fields like a server timestamp can be added later without breaking clients.

## Risks / Trade-offs

- [A future field is added to `Tracker` by spreading the entry] → the leak test serializes the full response and asserts that no secret field name or fixture secret value appears in it, so a regression fails CI.
- [zod error messages could include values in a future version] → only the issue path and message are printed. The test for invalid input asserts that a fixture secret value does not appear in the error.
- [Mock positions are not real] → documented. Only the default provider is mock; the provider interface keeps the swap cheap.
