import { describe, expect, it } from 'vitest';
import { ANISETTE_RESPONSE, FINDMY_SETTINGS, type FakeFetchOptions, fakeFetch } from '../../test/findmy.js';
import { FINDMY_FETCH_URL, FindMyClient, FindMyRequestError } from './client.js';

const NOW = new Date('2026-10-10T12:00:00Z');
const SECRETS = [
  FINDMY_SETTINGS.dsid,
  FINDMY_SETTINGS.searchPartyToken,
  FINDMY_SETTINGS.anisetteUrl,
  ...Object.values(ANISETTE_RESPONSE).map(String),
];

function client(options: FakeFetchOptions = {}) {
  const fetch = fakeFetch(options);
  return { fetch, client: new FindMyClient({ ...FINDMY_SETTINGS, fetch, now: () => NOW }) };
}

async function failure(options: FakeFetchOptions): Promise<string> {
  const error = await client(options).client.fetchReports(['id']).catch((e: unknown) => e);
  expect(error).toBeInstanceOf(FindMyRequestError);
  const message = (error as Error).message;
  for (const secret of SECRETS) expect(message).not.toContain(secret);
  return message;
}

describe('FindMyClient', () => {
  it('sends one search for all ids with basic auth and the anisette headers', async () => {
    const { fetch, client: c } = client({ apple: [] });
    await c.fetchReports(['aWQx', 'aWQy', 'aWQz']);

    expect(fetch.anisetteCalls()).toHaveLength(1);
    expect(fetch.appleCalls()).toHaveLength(1);
    const [{ url, init }] = fetch.appleCalls();
    expect(url).toBe(FINDMY_FETCH_URL);
    expect(init.method).toBe('POST');
    expect(init.signal).toBeInstanceOf(AbortSignal);

    const headers = init.headers as Record<string, string>;
    const expectedAuth = Buffer.from(`${FINDMY_SETTINGS.dsid}:${FINDMY_SETTINGS.searchPartyToken}`).toString('base64');
    expect(headers).toEqual({
      'X-Apple-I-MD': 'SECRET-ANISETTE-MD-AAAA',
      'X-Apple-I-MD-M': 'SECRET-ANISETTE-MDM-BBBB',
      'X-Apple-I-MD-RINFO': '17106176',
      'X-Mme-Client-Info': 'SECRET-ANISETTE-CLIENT-INFO-CCCC',
      'X-Mme-Device-Id': 'SECRET-ANISETTE-DEVICE-DDDD',
      Authorization: `Basic ${expectedAuth}`,
      'Content-Type': 'application/json',
    });

    expect(JSON.parse(init.body as string)).toEqual({
      search: [{ startDate: NOW.getTime() - 7 * 24 * 3600 * 1000, endDate: NOW.getTime(), ids: ['aWQx', 'aWQy', 'aWQz'] }],
    });
  });

  it('groups report payloads by id and skips malformed entries', async () => {
    const { client: c } = client({
      apple: { status: 200, body: { results: [{ id: 'a', payload: 'p1' }, { id: 'b', payload: 'p2' }, { id: 'a', payload: 'p3' }, { id: 'c' }, null] } },
    });
    const reports = await c.fetchReports(['a', 'b']);
    expect(Object.fromEntries(reports)).toEqual({ a: ['p1', 'p3'], b: ['p2'] });
  });

  it('reports HTTP failures with the status only', async () => {
    expect(await failure({ apple: { status: 401, body: { error: FINDMY_SETTINGS.searchPartyToken } } })).toBe(
      'Find My request failed with status 401',
    );
    expect(await failure({ anisette: { status: 500 } })).toBe('Anisette request failed with status 500');
  });

  it('reports network errors without their details', async () => {
    expect(await failure({ anisette: 'network-error' })).toBe('Anisette request failed (TypeError)');
    expect(await failure({ apple: 'network-error' })).toBe('Find My request failed (TypeError)');
  });

  it('reports malformed responses', async () => {
    expect(await failure({ apple: { status: 200, body: { nope: true } } })).toBe('Find My response was malformed');
    expect(await failure({ anisette: { status: 200, body: ['x'] } })).toBe('Anisette response was malformed');
  });
});
