import path from 'node:path';
import { REPO_ROOT } from './paths.js';

export const LOCATION_PROVIDERS = ['mock', 'findmy'] as const;
export type LocationProviderName = (typeof LOCATION_PROVIDERS)[number];

export interface FindMyConfig {
  anisetteUrl: string;
  dsid: string;
  searchPartyToken: string;
}

export interface Config {
  port: number;
  keysFile: string;
  mockCenter: { lat: number; lng: number };
  locationProvider: LocationProviderName;
  /** Built client to serve next to the API. Set only when `NODE_ENV=production`. */
  clientDir?: string;
  /** Set only when `locationProvider` is `findmy`. Holds credentials: never log it. */
  findMy?: FindMyConfig;
}

/** Invalid configuration. Messages name variables and provider values, never configured secrets. */
export class ConfigError extends Error {
  override name = 'ConfigError';
}

const DEFAULT_CENTER = { lat: 52.37, lng: 4.89 };

function numberFromEnv(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseLocationProvider(value: string | undefined): LocationProviderName {
  const name = value?.trim() || 'mock';
  if ((LOCATION_PROVIDERS as readonly string[]).includes(name)) return name as LocationProviderName;
  throw new ConfigError(
    `Invalid LOCATION_PROVIDER "${name}". Allowed values: ${LOCATION_PROVIDERS.join(', ')}.`,
  );
}

function loadFindMyConfig(env: NodeJS.ProcessEnv): FindMyConfig {
  const names = ['ANISETTE_URL', 'FINDMY_DSID', 'FINDMY_SEARCH_PARTY_TOKEN'] as const;
  const missing = names.filter((name) => !env[name]?.trim());
  if (missing.length) {
    throw new ConfigError(`LOCATION_PROVIDER=findmy requires these environment variables: ${missing.join(', ')}.`);
  }
  return {
    anisetteUrl: env.ANISETTE_URL!.trim(),
    dsid: env.FINDMY_DSID!.trim(),
    searchPartyToken: env.FINDMY_SEARCH_PARTY_TOKEN!.trim(),
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const locationProvider = parseLocationProvider(env.LOCATION_PROVIDER);
  return {
    port: numberFromEnv(env.PORT, 3001),
    keysFile: path.resolve(REPO_ROOT, env.KEYS_FILE || 'keys.json'),
    mockCenter: {
      lat: numberFromEnv(env.MOCK_CENTER_LAT, DEFAULT_CENTER.lat),
      lng: numberFromEnv(env.MOCK_CENTER_LNG, DEFAULT_CENTER.lng),
    },
    locationProvider,
    ...(env.NODE_ENV === 'production' && { clientDir: path.join(REPO_ROOT, 'client/dist') }),
    ...(locationProvider === 'findmy' && { findMy: loadFindMyConfig(env) }),
  };
}
