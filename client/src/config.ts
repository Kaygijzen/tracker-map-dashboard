export const DEFAULT_REFRESH_INTERVAL_MS = 30_000;
const MIN_REFRESH_INTERVAL_MS = 1_000;

/** Parses `VITE_REFRESH_INTERVAL_MS`; anything that isn't a number ≥ 1000 falls back to 30 s. */
export function parseRefreshInterval(value: string | undefined): number {
  const parsed = Number(value);
  if (!value || !Number.isFinite(parsed) || parsed < MIN_REFRESH_INTERVAL_MS) return DEFAULT_REFRESH_INTERVAL_MS;
  return parsed;
}

export const REFRESH_INTERVAL_MS = parseRefreshInterval(import.meta.env.VITE_REFRESH_INTERVAL_MS);
