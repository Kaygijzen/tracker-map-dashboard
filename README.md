# Tracker Map Dashboard

A small single-user dashboard that shows the trackers from `keys.json` on a map. The React client (Vite, MUI, react-leaflet) talks to a small Express API in `server/`, which reads `keys.json` and looks up each tracker's location.

Locations come from a **mock provider** by default. Set `LOCATION_PROVIDER=findmy` to show real positions from Apple's Find My network (see [Find My setup](#find-my-setup)).

## Requirements

- Node 20 (see `.nvmrc`). Run `nvm use` in the repository root first; Vite does not run on Node 16.
- A `keys.json` file in the repository root (an OpenHaystack key export). Without it the API serves no trackers.

## Getting started

```sh
nvm use
npm install
npm run dev
```

`npm run dev` starts the API on http://localhost:3001 and the client on http://localhost:5173. The client proxies `/api` to the API.

Other scripts, run from the repository root:

| Command | What it does |
| --- | --- |
| `npm run prod` | Builds everything, then starts the compiled server with `.env` loaded (`node --env-file=.env`) and `NODE_ENV=production`. The server also serves the built client, so the whole dashboard runs on http://localhost:3001. Fails if `.env` is missing. |
| `npm test` | Runs the server and client test suites (Vitest). |
| `npm run build` | Type-checks and builds the server (`server/dist`) and the client (`client/dist`). |

## Environment variables

Server variables are read from the environment when the API starts, for example `LOCATION_PROVIDER=findmy npm run dev`. `npm run dev` does not load `.env`; `npm run prod` does. Variables already set in your shell override the ones in `.env` (e.g. `PORT=3002 npm run prod`).

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3001` | API port. |
| `KEYS_FILE` | `keys.json` | Path to the keys file. Relative paths resolve against the repository root. |
| `MOCK_CENTER_LAT` | `52.37` | Latitude the mock provider places trackers around. |
| `MOCK_CENTER_LNG` | `4.89` | Longitude the mock provider places trackers around. |
| `LOCATION_PROVIDER` | `mock` | `mock` or `findmy`. Any other value stops startup with an error. |
| `ANISETTE_URL` | – | Anisette server URL. Required when `LOCATION_PROVIDER=findmy`. |
| `FINDMY_DSID` | – | Apple account DSID. Required when `LOCATION_PROVIDER=findmy`. |
| `FINDMY_SEARCH_PARTY_TOKEN` | – | Find My search-party token. Required when `LOCATION_PROVIDER=findmy`. |

The client reads one variable at build time. Copy `client/.env.example` to `client/.env.local` to set it:

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_REFRESH_INTERVAL_MS` | `30000` | How often the dashboard refreshes tracker data, in milliseconds (minimum 1000). |

## Keep secrets out of git

`keys.json` holds each tracker's `privateKey`. It is read only by the server and is listed in `.gitignore`: **never commit it**, and never paste its contents into issues, logs or screenshots. The same goes for `FINDMY_DSID` and `FINDMY_SEARCH_PARTY_TOKEN`; keep them in your shell or an untracked `.env` file (`.env` and `.env.*` are gitignored).

## Find My setup

The Find My provider fetches the trackers' encrypted location reports from Apple and decrypts them on the server. It needs three things.

1. **An anisette server.** Apple's servers expect anisette headers that identify a device. Run one locally, for example [anisette-v3-server](https://github.com/Dadoum/anisette-v3-server):

   ```sh
   docker run -d --restart always --name anisette-v3 -p 6969:6969 dadoum/anisette-v3-server
   ```

   Then use `ANISETTE_URL=http://localhost:6969`.

2. **A DSID and search-party token.** The app does not sign in to Apple itself. Sign in once with an external tool that handles the Apple ID password and 2FA, such as [FindMy.py](https://github.com/malmeloo/findmy.py) or [macless-haystack](https://github.com/dchristl/macless-haystack), and copy the `dsid` and `searchPartyToken` values from the session it saves.

3. **Start the app with the Find My provider:**

   ```sh
   LOCATION_PROVIDER=findmy \
   ANISETTE_URL=http://localhost:6969 \
   FINDMY_DSID=... \
   FINDMY_SEARCH_PARTY_TOKEN=... \
   npm run dev
   ```

   If a variable is missing, startup stops with an error that names it.

How it behaves:

- All trackers are looked up in one request covering the past 7 days, and results are cached for 5 minutes to avoid Apple's rate limits. Each tracker shows its newest report.
- Reports only exist when an Apple device has passed near the tracker, so positions can lag by minutes to hours. Trackers without reports show no location.
- If a request fails, trackers show no location, the API keeps working, and it waits at least 1 minute before trying again. The server log says why.
- **`Find My request failed with status 401`** means Apple rejected the DSID and token. The token has expired (they typically last weeks to months) or was copied incorrectly: get a new one with the tool from step 2 and restart the server.
- Only keys with `usesDerivation: false` are supported. Trackers that use rolling key derivation (`usesDerivation: true`) show no location, and the server logs a warning naming their id at startup.
