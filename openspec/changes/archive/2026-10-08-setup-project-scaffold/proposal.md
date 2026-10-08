# Proposal

## Why

The repository has a plan and OpenSpec setup but no code yet. Every later change (tracker API, map, sidebar, refresh) needs a running client and API, a shared theme and an app layout to plug into, so we set that foundation up first.

## What Changes

- Add an npm workspaces monorepo: a root `package.json` with workspaces `client` and `server`.
- Add a Vite + React 18 + TypeScript client in `/client`.
- Add a minimal Node + Express + TypeScript API in `/server` with a `GET /api/health` endpoint.
- Add a single root `npm run dev` that starts the client and the API together; the Vite dev server proxies `/api` to the API.
- Install Material UI v5 and set up a theme with `CssBaseline` that follows the system light/dark preference.
- Build an app shell: an AppBar titled "Tracker Map", a left sidebar (permanent on desktop, temporary with a menu button on mobile) and a main content area that will later hold the map.
- Make sure `.gitignore` covers `node_modules`, `dist` and `keys.json` (the existing file already lists them; keep it that way).

**Out of scope:** the map, tracker data and anything that reads `keys.json`, production deployment/hosting, authentication, tests beyond a smoke check of the health endpoint.

## Capabilities

### New Capabilities
- `app-shell`: The dashboard's page layout and theming: AppBar, responsive sidebar, main content area, and system-preference light/dark theme.
- `api-server`: The local HTTP API served under `/api`, starting with the health endpoint.
- `dev-workflow`: How developers run the project locally: one command starts client and API, the client proxies `/api`, and secret files stay out of git.

### Modified Capabilities
- None.

## Impact

- New directories: `/client`, `/server`; new root `package.json` and `package-lock.json`.
- New dependencies: react, react-dom, vite, @vitejs/plugin-react, typescript, @mui/material, @mui/icons-material, @emotion/react, @emotion/styled, express, tsx, concurrently, and type packages.
- Requires Node 20 (`.nvmrc`).
- Ports: client on 5173, API on 3001 (dev only).
