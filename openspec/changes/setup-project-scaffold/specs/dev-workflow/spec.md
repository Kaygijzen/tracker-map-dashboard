# Spec Delta

## Purpose

Defines how a developer runs the dashboard locally and which files must never be committed, so the client and API work together with one command and secrets stay out of git.

## ADDED Requirements

### Requirement: Single dev command
Running `npm run dev` from the repository root SHALL start both the client dev server (port 5173) and the API server, and stopping it SHALL stop both.

#### Scenario: Start everything
- **WHEN** a developer runs `npm run dev` at the repository root on Node 20
- **THEN** the client is served at http://localhost:5173 and the API answers `GET /api/health`

### Requirement: API proxy in development
The client dev server SHALL forward every request whose path starts with `/api` to the API server, so the browser uses a single origin.

#### Scenario: Health through the proxy
- **WHEN** the browser requests http://localhost:5173/api/health while `npm run dev` is running
- **THEN** it receives the API's `{ "status": "ok" }` response

### Requirement: Secrets and build output are not committed
The repository's ignore rules SHALL exclude `keys.json`, `node_modules` and `dist` directories, and environment files.

#### Scenario: keys.json is ignored
- **WHEN** a developer runs `git check-ignore keys.json` at the repository root
- **THEN** git reports the file as ignored
