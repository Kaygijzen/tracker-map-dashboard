import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { MockLocationProvider } from './location/mock.js';
import type { LocationProvider } from './location/provider.js';
import { toTracker } from './trackers.js';
import { SECRET_ACCOUNT, SECRET_ADDITIONAL_KEY, SECRET_PRIVATE_KEY, entries } from './test/fixtures.js';

const mock = new MockLocationProvider({ center: { lat: 52.37, lng: 4.89 } });
const app = (locationProvider: LocationProvider = mock) =>
  createApp({ trackers: entries.map(toTracker), locationProvider });

describe('api', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('unknown /api routes return a JSON 404', async () => {
    const res = await request(app()).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/trackers', () => {
  it('returns public trackers with locations in file order', async () => {
    const res = await request(app()).get('/api/trackers');
    expect(res.status).toBe(200);
    expect(res.body.trackers).toHaveLength(2);
    expect(res.body.trackers.map((t: { id: number }) => t.id)).toEqual([1001, 1002]);
    for (const tracker of res.body.trackers) {
      expect(Object.keys(tracker).sort()).toEqual(['color', 'id', 'isActive', 'isDeployed', 'location', 'name']);
      expect(Object.keys(tracker.location).sort()).toEqual(['accuracyMeters', 'lat', 'lng', 'timestamp']);
      expect(new Date(tracker.location.timestamp).toISOString()).toBe(tracker.location.timestamp);
    }
  });

  it('lists trackers without a location as null', async () => {
    const none: LocationProvider = { getLatestLocation: async () => null };
    const res = await request(app(none)).get('/api/trackers');
    expect(res.body.trackers).toHaveLength(2);
    expect(res.body.trackers.every((t: { location: unknown }) => t.location === null)).toBe(true);
  });

  it('never leaks private fields or values', async () => {
    const res = await request(app()).get('/api/trackers');
    const body = res.text;
    for (const field of ['privateKey', 'additionalKeys', 'account', 'colorComponents', 'usesDerivation']) {
      expect(body).not.toContain(field);
    }
    for (const secret of [SECRET_PRIVATE_KEY, SECRET_ADDITIONAL_KEY, SECRET_ACCOUNT]) {
      expect(body).not.toContain(secret);
    }
  });
});
