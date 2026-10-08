# Design

## Context

Greenfield repo: only `plan.md`, `openspec/`, `.gitignore` (already ignores `node_modules/`, `dist/`, `keys.json`, `.env*`), `.nvmrc` (20) and `keys.json`. Vite 5 needs Node 18+, so all scripts assume Node 20.

## Goals / Non-Goals

**Goals:**
- One repo, two workspaces (`client`, `server`) that each build and type-check on their own.
- A layout that later changes can fill in without restructuring: a sidebar slot and a main content slot.

**Non-Goals:**
- Production serving of the client from Express, Docker, CI.
- Shared types package between client and server (added later only if needed).

## Decisions

- **npm workspaces + `concurrently`** for `npm run dev` (`concurrently -k -n server,client "npm:dev -w server" "npm:dev -w client"`). `-k` kills both when one exits. Alternative: Turborepo/nx — too heavy for two packages.
- **Server runs with `tsx watch`** (TypeScript execution without a build step in dev); `tsc` builds to `server/dist` for `npm run build`. Alternative: `ts-node-dev` — slower and less maintained. Server uses ESM (`"type": "module"`).
- **Express app split into `createApp()` (in `app.ts`) and `index.ts` (listen)**, so tests can call the app with supertest without opening a port. Tests use **vitest** in both workspaces for one test runner.
- **Vite proxy** `server.proxy['/api'] = 'http://localhost:3001'`. The API port comes from `PORT` (default 3001); the proxy target reads `API_PORT` env if set.
- **Theme:** MUI v5 `createTheme({ palette: { mode } })` where `mode` comes from `useMediaQuery('(prefers-color-scheme: dark)')`, memoized; wrapped in `ThemeProvider` + `CssBaseline`. Alternative: MUI `CssVarsProvider`/`colorSchemes` — newer API, more setup, not needed.
- **Layout:** `AppShell` component with props `sidebar` and `children`. Uses MUI's "responsive drawer" pattern: `useMediaQuery(theme.breakpoints.up('md'))` (900px) chooses `variant="permanent"` vs `variant="temporary"`; drawer width 320px; `AppBar position="fixed"` with `zIndex` above the drawer; a `Toolbar` spacer pushes content down. The root is `height: 100vh` with `display: flex` and `overflow: hidden` so the main area can host a full-size map. Temporary drawer uses `ModalProps={{ keepMounted: true }}`.
- Sidebar placeholder content for now: a short "Trackers will appear here" text.

- **Versions:** Vite 7 (needs Node 20.19+), Express 5, vitest 4 in both workspaces. Vite 5 was tried first, but vitest pulled a second Vite into the hoisted root and broke `@vitejs/plugin-react` typing; one shared Vite major avoids that. vitest 4 fixes the advisories reported for vitest 3.

## Risks / Trade-offs

- [Port 3001 already in use] → `PORT`/`API_PORT` env vars override it.
- [Users on Node 16 get cryptic Vite errors] → root `package.json` sets `"engines": { "node": ">=20" }` and README/CLAUDE.md point to `nvm use`.
