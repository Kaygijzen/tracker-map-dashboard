import { describe, expect, it } from 'vitest';
import { DEFAULT_REFRESH_INTERVAL_MS, parseRefreshInterval } from './config';

describe('parseRefreshInterval', () => {
  it('defaults when unset', () => expect(parseRefreshInterval(undefined)).toBe(DEFAULT_REFRESH_INTERVAL_MS));
  it('accepts valid values', () => expect(parseRefreshInterval('5000')).toBe(5000));
  it('rejects too-small values', () => expect(parseRefreshInterval('10')).toBe(DEFAULT_REFRESH_INTERVAL_MS));
  it('rejects non-numeric values', () => expect(parseRefreshInterval('fast')).toBe(DEFAULT_REFRESH_INTERVAL_MS));
});
