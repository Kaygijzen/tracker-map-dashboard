# api-server Specification

## Purpose
Defines the local HTTP API that the dashboard calls under the `/api` path, including its health check.

## Requirements

### Requirement: Health endpoint
The API SHALL respond to `GET /api/health` with HTTP 200 and a JSON body `{ "status": "ok" }`.

#### Scenario: Health check succeeds
- **WHEN** a client sends `GET /api/health`
- **THEN** the response status is 200, the content type is JSON and the body is `{ "status": "ok" }`

### Requirement: Unknown API routes return JSON 404
The API SHALL respond to requests for unknown paths under `/api` with HTTP 404 and a JSON error body.

#### Scenario: Unknown route
- **WHEN** a client sends `GET /api/does-not-exist`
- **THEN** the response status is 404 and the body is JSON with an `error` field

### Requirement: Configurable port
The API SHALL listen on the port given by the `PORT` environment variable, defaulting to 3001.

#### Scenario: Default port
- **WHEN** the API starts without `PORT` set
- **THEN** it accepts requests on port 3001
