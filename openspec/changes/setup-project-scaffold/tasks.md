# Tasks

## 1. Workspace setup

- [ ] 1.1 Add root `package.json` (private, workspaces `client` and `server`, `engines.node >=20`, scripts `dev`, `build`, `test`) and verify `npm install` succeeds on Node 20
- [ ] 1.2 Confirm `.gitignore` covers `node_modules/`, `dist/`, `keys.json` and `.env*`; verify `git check-ignore keys.json client/node_modules client/dist` reports all three

## 2. API server

- [ ] 2.1 Scaffold `/server` (ESM, TypeScript, Express, `tsx watch` dev script, `tsc` build script) and verify `npm run build -w server` passes
- [ ] 2.2 Implement `createApp()` with `GET /api/health` → `{ status: "ok" }` and JSON 404 for unknown `/api` routes, plus `index.ts` that listens on `PORT` (default 3001); verify a vitest + supertest test for both routes passes with `npm test -w server`

## 3. Client

- [ ] 3.1 Scaffold `/client` with Vite + React 18 + TypeScript and the `/api` proxy to `http://localhost:3001`; verify `npm run build -w client` passes
- [ ] 3.2 Install MUI v5 (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`) and add a theme provider with `CssBaseline` whose mode follows `prefers-color-scheme`; verify in the browser that emulating dark/light switches the background
- [ ] 3.3 Build `AppShell` with a fixed AppBar titled "Tracker Map", a 320px permanent Drawer at `md` and up, a temporary Drawer plus menu button below `md`, and a full-height main area; verify at 1280px (sidebar visible, no menu button) and 375px (menu button opens/closes the drawer, no page scroll)

## 4. Integration

- [ ] 4.1 Add root `npm run dev` using `concurrently -k`; verify that one command serves http://localhost:5173, that http://localhost:5173/api/health returns `{"status":"ok"}`, and that the browser console has no errors

## Workflow follow-up

- Archive the change with `/opsx:archive` after review.
