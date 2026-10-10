import { describe, expect, it } from 'vitest';
import type { KeyEntry } from '../../keys.js';
import {
  ANISETTE_RESPONSE,
  FINDMY_SETTINGS,
  type FakeFetchOptions,
  encryptReport,
  fakeFetch,
  testPrivateKey,
} from '../../test/findmy.js';
import { rawEntry } from '../../test/fixtures.js';
import { FindMyClient } from './client.js';
import { deriveTrackerKey } from './keys.js';
import { FindMyLocationProvider } from './provider.js';

const MINUTE = 60_000;
const T0 = new Date('2026-10-10T12:00:00Z').getTime();

const keys = [testPrivateKey(), testPrivateKey(), testPrivateKey()];
const trackers = keys.map((privateKey, i) => rawEntry({ id: 1 + i, privateKey }) as KeyEntry);
const hashedId = (privateKey: string) => deriveTrackerKey(privateKey).hashedId;

function report(privateKey: string, hour: number, lat = 52 + hour / 100) {
  return {
    id: hashedId(privateKey),
    payload: encryptReport(privateKey, { lat, lng: 4.9, accuracyMeters: hour, at: new Date(Date.UTC(2026, 9, 10, hour)) }),
  };
}

function setup({ entries = trackers, ...fetchOptions }: FakeFetchOptions & { entries?: KeyEntry[] } = {}) {
  let time = T0;
  const logs: string[] = [];
  const logger = { warn: (m: string) => logs.push(m), error: (m: string) => logs.push(m) };
  const fetch = fakeFetch(fetchOptions);
  const now = () => new Date(time);
  const provider = new FindMyLocationProvider({
    entries,
    client: new FindMyClient({ ...FINDMY_SETTINGS, fetch, now }),
    logger,
    now,
  });
  const all = () => Promise.all(entries.map((e) => provider.getLatestLocation(e.id)));
  return { provider, fetch, logs, all, advance: (ms: number) => (time += ms) };
}

describe('FindMyLocationProvider', () => {
  it('fetches all trackers with one anisette call and one Apple request', async () => {
    const { fetch, all } = setup({ apple: keys.map((k) => report(k, 10)) });
    const locations = await all();

    expect(fetch.anisetteCalls()).toHaveLength(1);
    expect(fetch.appleCalls()).toHaveLength(1);
    const body = JSON.parse(fetch.appleCalls()[0].init.body as string);
    expect(body.search[0].ids.sort()).toEqual(keys.map(hashedId).sort());
    expect(locations.every((l) => l?.timestamp === '2026-10-10T10:00:00.000Z')).toBe(true);
  });

  it('serves the cache at 2 minutes and refetches at 6 minutes', async () => {
    const { fetch, all, advance } = setup({ apple: [report(keys[0], 10)] });
    await all();
    advance(2 * MINUTE);
    await all();
    expect(fetch.appleCalls()).toHaveLength(1);
    advance(4 * MINUTE);
    await all();
    expect(fetch.appleCalls()).toHaveLength(2);
  });

  it('backs off for a minute after a failure', async () => {
    const { fetch, all, advance } = setup({ apple: { status: 500 } });
    expect(await all()).toEqual([null, null, null]);
    advance(30_000);
    expect(await all()).toEqual([null, null, null]);
    expect(fetch.appleCalls()).toHaveLength(1);
    advance(31_000);
    await all();
    expect(fetch.appleCalls()).toHaveLength(2);
  });

  it('shares one fetch between concurrent calls', async () => {
    const { fetch, provider } = setup({ apple: [report(keys[0], 10)] });
    await Promise.all([provider.getLatestLocation(1), provider.getLatestLocation(1), provider.getLatestLocation(2)]);
    expect(fetch.anisetteCalls()).toHaveLength(1);
    expect(fetch.appleCalls()).toHaveLength(1);
  });

  it('returns the newest report', async () => {
    const { provider } = setup({ apple: [report(keys[0], 11), report(keys[0], 10)] });
    expect(await provider.getLatestLocation(1)).toEqual({
      lat: 52.11,
      lng: 4.9,
      accuracyMeters: 11,
      timestamp: '2026-10-10T11:00:00.000Z',
    });
  });

  it('skips a corrupt report and returns null without reports', async () => {
    const corrupt = { ...report(keys[0], 12), payload: Buffer.alloc(88, 1).toString('base64') };
    const { provider, logs } = setup({ apple: [corrupt, report(keys[0], 10)] });
    expect((await provider.getLatestLocation(1))?.timestamp).toBe('2026-10-10T10:00:00.000Z');
    expect(await provider.getLatestLocation(2)).toBeNull();
    expect(logs).toContain('Skipped 1 undecryptable Find My report(s) for tracker 1.');
  });

  it('returns null for derived and malformed keys and warns once without key material', async () => {
    const derived = rawEntry({ id: 7, privateKey: keys[1], usesDerivation: true }) as KeyEntry;
    const malformed = rawEntry({ id: 8, privateKey: Buffer.alloc(30, 9).toString('base64') }) as KeyEntry;
    const { provider, fetch, logs, all } = setup({
      entries: [trackers[0], derived, malformed],
      apple: [report(keys[0], 10), report(keys[1], 10)],
    });
    await all();
    await all();

    expect(await provider.getLatestLocation(7)).toBeNull();
    expect(await provider.getLatestLocation(8)).toBeNull();
    expect(await provider.getLatestLocation(1)).not.toBeNull();
    expect(JSON.parse(fetch.appleCalls()[0].init.body as string).search[0].ids).toEqual([hashedId(keys[0])]);
    expect(logs.filter((l) => l.includes('Tracker 7'))).toHaveLength(1);
    expect(logs.filter((l) => l.includes('Tracker 8'))).toHaveLength(1);
    for (const log of logs) expect(log).not.toContain(keys[1]);
  });

  it('logs a 401 and returns null locations', async () => {
    const { all, logs } = setup({ apple: { status: 401 } });
    expect(await all()).toEqual([null, null, null]);
    expect(logs).toEqual(['Find My locations unavailable: Find My request failed with status 401']);
  });
});

describe('FindMyLocationProvider secrets', () => {
  const secrets = [
    ...keys,
    ...keys.map((k) => Buffer.from(k, 'base64').toString('hex')),
    FINDMY_SETTINGS.dsid,
    FINDMY_SETTINGS.searchPartyToken,
    Buffer.from(`${FINDMY_SETTINGS.dsid}:${FINDMY_SETTINGS.searchPartyToken}`).toString('base64'),
    ...Object.values(ANISETTE_RESPONSE).map(String),
  ];

  const scenarios: Array<[string, FakeFetchOptions]> = [
    ['success with a corrupt report', { apple: [report(keys[0], 10), { id: hashedId(keys[0]), payload: 'AAAA' }] }],
    ['Apple 401', { apple: { status: 401, body: { token: FINDMY_SETTINGS.searchPartyToken } } }],
    ['Apple network error', { apple: 'network-error' }],
    ['anisette down', { anisette: 'network-error' }],
    ['anisette 500', { anisette: { status: 500, body: ANISETTE_RESPONSE } }],
  ];

  it.each(scenarios)('never logs key material or credentials (%s)', async (_name, options) => {
    const derived = rawEntry({ id: 9, privateKey: keys[2], usesDerivation: true }) as KeyEntry;
    const { all, logs } = setup({ entries: [...trackers, derived], ...options });
    await all();
    expect(logs.length).toBeGreaterThan(0);
    for (const log of logs) for (const secret of secrets) expect(log).not.toContain(secret);
  });
});
