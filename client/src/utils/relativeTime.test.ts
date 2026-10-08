import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from './relativeTime';

const now = new Date('2026-01-10T12:00:00Z');
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000).toISOString();

describe('formatRelativeTime', () => {
  it('formats seconds as just now', () => expect(formatRelativeTime(ago(10), now)).toBe('just now'));
  it('formats minutes', () => expect(formatRelativeTime(ago(5 * 60), now)).toBe('5 minutes ago'));
  it('formats under a minute and a half as 1 minute', () => expect(formatRelativeTime(ago(60), now)).toBe('1 minute ago'));
  it('formats hours', () => expect(formatRelativeTime(ago(3 * 3600), now)).toBe('3 hours ago'));
  it('formats days', () => expect(formatRelativeTime(ago(2 * 86400), now)).toBe('2 days ago'));
  it('handles invalid input', () => expect(formatRelativeTime('nope', now)).toBe('unknown'));
});
