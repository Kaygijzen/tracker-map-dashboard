import { describe, expect, it } from 'vitest';
import { isStale } from './stale';

const now = new Date('2026-01-01T12:00:00Z');
const minutesAgo = (m: number) => ({ timestamp: new Date(now.getTime() - m * 60_000).toISOString() });

describe('isStale', () => {
  it('is fresh at 59 minutes', () => expect(isStale(minutesAgo(59), now)).toBe(false));
  it('is stale at 61 minutes', () => expect(isStale(minutesAgo(61), now)).toBe(true));
  it('is not stale without a location', () => expect(isStale(null, now)).toBe(false));
});
