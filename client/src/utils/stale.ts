import type { TrackerLocation } from '../api/types';

export const STALE_AFTER_MS = 60 * 60 * 1000;

/** A location is stale when it was recorded more than 1 hour before `now`. */
export function isStale(location: Pick<TrackerLocation, 'timestamp'> | null, now: Date = new Date()): boolean {
  if (!location) return false;
  return now.getTime() - new Date(location.timestamp).getTime() > STALE_AFTER_MS;
}
