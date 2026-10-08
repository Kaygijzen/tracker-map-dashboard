import type { Tracker } from '../api/types';

/** Case-insensitive match on name, or substring match on id. */
export function filterTrackers(trackers: Tracker[], query: string): Tracker[] {
  const q = query.trim().toLowerCase();
  if (!q) return trackers;
  return trackers.filter((t) => t.name.toLowerCase().includes(q) || String(t.id).includes(q));
}
