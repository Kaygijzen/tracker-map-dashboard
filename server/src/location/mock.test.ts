import { describe, expect, it } from 'vitest';
import { MockLocationProvider } from './mock.js';

const AMSTERDAM = { lat: 52.37, lng: 4.89 };

/** Haversine distance in meters. */
function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

describe('MockLocationProvider', () => {
  it('places trackers within 5 km of the center, with distinct ids at distinct spots', () => {
    const provider = new MockLocationProvider({ center: AMSTERDAM });
    const ids = [6253030, 5253030, 1, 2, 3, 999999];
    const bases = ids.map((id) => provider.basePosition(id));
    for (const base of bases) expect(distance(base, AMSTERDAM)).toBeLessThanOrEqual(5_050);
    expect(new Set(bases.map((b) => `${b.lat},${b.lng}`)).size).toBe(ids.length);
  });

  it('is stable across instances (restarts)', () => {
    const a = new MockLocationProvider({ center: AMSTERDAM }).basePosition(42);
    const b = new MockLocationProvider({ center: AMSTERDAM }).basePosition(42);
    expect(a).toEqual(b);
  });

  it('drifts at most 50 m from the base and stamps the current time', async () => {
    const now = new Date('2026-01-01T12:00:00Z');
    const provider = new MockLocationProvider({ center: AMSTERDAM, now: () => now });
    const base = provider.basePosition(7);
    const first = await provider.getLatestLocation(7);
    const second = await provider.getLatestLocation(7);
    expect(distance(first, base)).toBeLessThanOrEqual(50.5);
    expect(distance(second, base)).toBeLessThanOrEqual(50.5);
    expect(distance(first, second)).toBeLessThanOrEqual(100);
    expect(first).not.toEqual(second);
    expect(first.timestamp).toBe(now.toISOString());
    expect(first.accuracyMeters).toBeGreaterThanOrEqual(5);
    expect(first.accuracyMeters).toBeLessThanOrEqual(50);
  });

  it('uses a custom center', async () => {
    const paris = { lat: 48.85, lng: 2.35 };
    const location = await new MockLocationProvider({ center: paris }).getLatestLocation(7);
    expect(distance(location, paris)).toBeLessThanOrEqual(5_100);
  });
});
