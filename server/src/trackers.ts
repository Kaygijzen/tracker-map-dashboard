import type { KeyEntry } from './keys.js';
import type { Location } from './location/provider.js';

/** Public tracker data. Safe to send to clients. */
export interface Tracker {
  id: number;
  name: string;
  color: string;
  isDeployed: boolean;
  isActive: boolean;
}

export interface TrackerWithLocation extends Tracker {
  location: Location | null;
}

function channelToHex(value: number): string {
  const clamped = Math.min(1, Math.max(0, value));
  return Math.round(clamped * 255).toString(16).padStart(2, '0');
}

/** Converts `[r, g, b, a]` in 0–1 to `#rrggbb`. Alpha is ignored. */
export function colorToHex([r, g, b]: number[]): string {
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

/** Builds the public shape field by field. Never spread `entry`: it holds secrets. */
export function toTracker(entry: KeyEntry): Tracker {
  return {
    id: entry.id,
    name: entry.name,
    color: colorToHex(entry.colorComponents),
    isDeployed: entry.isDeployed,
    isActive: entry.isActive,
  };
}
