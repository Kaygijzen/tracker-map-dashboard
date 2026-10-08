# Tracker Map Dashboard

See `plan.md` for the roadmap and `openspec/` for specs and changes.

## Environment

- Node 20 (see `.nvmrc`; run `nvm use` first). Vite 5+ does not run on Node 16.

## Verification loop

After implementing UI changes, verify them in a browser before you call a task done:

1. Start the app with `npm run dev` (in the background). The client runs at http://localhost:5173 and the API is proxied under `/api`.
2. Use the Playwright MCP tools (`mcp__playwright__*`, configured in `.mcp.json`) to open the app, take a snapshot or screenshot, and check the console for errors.
3. Exercise the feature you changed (e.g. click markers, select trackers in the sidebar, resize to mobile width).
4. Fix any issues and repeat until the feature works with no console errors.

Never print or return `privateKey` values from `keys.json`, including in screenshots, logs or API responses.
