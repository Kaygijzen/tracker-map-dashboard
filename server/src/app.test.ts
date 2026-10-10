import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createLocationProvider } from './location/factory.js';
import { MockLocationProvider } from './location/mock.js';
import { ANISETTE_RESPONSE, FINDMY_SETTINGS, fakeFetch, testPrivateKey } from './test/findmy.js';
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

  it('serves the built client when clientDir is set, and keeps /api 404s as JSON', async () => {
    const clientDir = mkdtempSync(path.join(tmpdir(), 'client-'));
    writeFileSync(path.join(clientDir, 'index.html'), '<title>Tracker Map</title>');
    const withClient = createApp({ trackers: [], locationProvider: mock, clientDir });
    const page = await request(withClient).get('/');
    expect(page.status).toBe(200);
    expect(page.text).toContain('Tracker Map');
    const missing = await request(withClient).get('/api/does-not-exist');
    expect(missing.status).toBe(404);
    expect(missing.body).toHaveProperty('error');
  });
});

describe('GET /api/trackers', () => {
  it('returns public trackers with locations in file order', async () => {
    const res = await request(app()).get('/api/trackers');
    expect(res.status).toBe(200);
    expect(res.body.trackers).toHaveLength(2);
    expect(res.body.trackers.map((t: { id: number }) => t.id)).toEqual([1001, 1002]);
    for (const tracker of res.body.trackers) {
      expect(Object.keys(tracker).sort()).toEqual(['color', 'icon', 'id', 'isActive', 'isDeployed', 'location', 'name']);
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

  it('responds 200 with null locations when Find My rejects the token, without leaking secrets', async () => {
    const config = loadConfig({
      LOCATION_PROVIDER: 'findmy',
      ANISETTE_URL: FINDMY_SETTINGS.anisetteUrl,
      FINDMY_DSID: FINDMY_SETTINGS.dsid,
      FINDMY_SEARCH_PARTY_TOKEN: FINDMY_SETTINGS.searchPartyToken,
    });
    const privateKeys = [testPrivateKey(), testPrivateKey()];
    const findMyEntries = entries.map((entry, i) => ({ ...entry, privateKey: privateKeys[i] }));
    const logs: string[] = [];
    const logger = { warn: (m: string) => logs.push(m), error: (m: string) => logs.push(m) };
    const fetch = fakeFetch({ apple: { status: 401 } });
    const provider = createLocationProvider(config, findMyEntries, logger, { fetch });

    const res = await request(app(provider)).get('/api/trackers');
    expect(res.status).toBe(200);
    expect(res.body.trackers.map((t: { id: number }) => t.id)).toEqual([1001, 1002]);
    expect(res.body.trackers.every((t: { location: unknown }) => t.location === null)).toBe(true);
    expect(fetch.appleCalls()).toHaveLength(1);
    expect(logs).toEqual(['Find My locations unavailable: Find My request failed with status 401']);

    const secrets = [...privateKeys, FINDMY_SETTINGS.dsid, FINDMY_SETTINGS.searchPartyToken, SECRET_ACCOUNT];
    for (const secret of [...secrets, ...Object.values(ANISETTE_RESPONSE).map(String)]) {
      expect(res.text).not.toContain(secret);
    }
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
