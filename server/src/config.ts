import path from 'node:path';
import { REPO_ROOT } from './paths.js';

export interface Config {
  port: number;
  keysFile: string;
  mockCenter: { lat: number; lng: number };
}

const DEFAULT_CENTER = { lat: 52.37, lng: 4.89 };

function numberFromEnv(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: numberFromEnv(env.PORT, 3001),
    keysFile: path.resolve(REPO_ROOT, env.KEYS_FILE || 'keys.json'),
    mockCenter: {
      lat: numberFromEnv(env.MOCK_CENTER_LAT, DEFAULT_CENTER.lat),
      lng: numberFromEnv(env.MOCK_CENTER_LNG, DEFAULT_CENTER.lng),
    },
  };
}
