import { createCipheriv, createECDH } from 'node:crypto';
import { CURVE } from '../location/findmy/keys.js';
import { APPLE_EPOCH_OFFSET, deriveReportKey } from '../location/findmy/report.js';

/** A fresh, random P-224 private scalar as base64 (28 bytes). Test-only, never a real tracker key. */
export function testPrivateKey(): string {
  const ecdh = createECDH(CURVE);
  ecdh.generateKeys();
  const scalar = ecdh.getPrivateKey();
  // getPrivateKey() drops leading zero bytes; left-pad back to 28.
  return Buffer.concat([Buffer.alloc(28 - scalar.length), scalar]).toString('base64');
}

export interface ReportInput {
  lat: number;
  lng: number;
  accuracyMeters: number;
  /** Observation time. */
  at: Date;
  /** Build the newer 89-byte layout with an extra byte at index 4. */
  long?: boolean;
}

/** Encrypts a location report for the tracker whose public key is derived from `privateKeyB64`, like a finder device would. */
export function encryptReport(privateKeyB64: string, { lat, lng, accuracyMeters, at, long = false }: ReportInput): string {
  const owner = createECDH(CURVE);
  owner.setPrivateKey(Buffer.from(privateKeyB64, 'base64').subarray(-28));
  const finder = createECDH(CURVE);
  const ephemeral = finder.generateKeys();
  const { key, iv } = deriveReportKey(finder.computeSecret(owner.getPublicKey()), ephemeral);

  const plaintext = Buffer.alloc(10);
  plaintext.writeInt32BE(Math.round(lat * 1e7), 0);
  plaintext.writeInt32BE(Math.round(lng * 1e7), 4);
  plaintext.writeUInt8(accuracyMeters, 8);
  const cipher = createCipheriv('aes-128-gcm', key, iv, { authTagLength: 16 });
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  const header = Buffer.alloc(long ? 6 : 5);
  header.writeUInt32BE(Math.floor(at.getTime() / 1000) - APPLE_EPOCH_OFFSET, 0);
  header[long ? 5 : 4] = 3; // confidence
  return Buffer.concat([header, ephemeral, ciphertext, cipher.getAuthTag()]).toString('base64');
}

export const FINDMY_SETTINGS = {
  anisetteUrl: 'http://anisette.test:6969/',
  dsid: 'SECRET-DSID-20000000001',
  searchPartyToken: 'SECRET-SEARCH-PARTY-TOKEN-QUFBQUFBQUE=',
};

/** Anisette response: the `X-Apple-*` / `X-Mme-*` values are secrets, the rest must not be forwarded. */
export const ANISETTE_RESPONSE = {
  'X-Apple-I-MD': 'SECRET-ANISETTE-MD-AAAA',
  'X-Apple-I-MD-M': 'SECRET-ANISETTE-MDM-BBBB',
  'X-Apple-I-MD-RINFO': 17106176,
  'X-Mme-Client-Info': 'SECRET-ANISETTE-CLIENT-INFO-CCCC',
  'X-Mme-Device-Id': 'SECRET-ANISETTE-DEVICE-DDDD',
  'Some-Other-Header': 'not-forwarded',
};

export type FakeReply = { status: number; body?: unknown } | 'network-error';

export interface FakeFetchOptions {
  anisette?: FakeReply;
  /** Apple's reply: a `results` array, or a full reply. Defaults to no results. */
  apple?: FakeReply | Array<{ id: string; payload: string }>;
}

/** A fake `fetch` that answers the anisette server and Apple's report service, recording each call. */
export function fakeFetch({ anisette = { status: 200, body: ANISETTE_RESPONSE }, apple = [] }: FakeFetchOptions = {}) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const reply = (r: FakeReply) => {
    if (r === 'network-error') throw new TypeError('fetch failed: connect ECONNREFUSED SECRET-IN-CAUSE');
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status });
  };
  const fn = async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    calls.push({ url, init });
    if (url === FINDMY_SETTINGS.anisetteUrl) return reply(anisette);
    return reply(Array.isArray(apple) ? { status: 200, body: { results: apple } } : apple);
  };
  return Object.assign(fn as typeof fetch, {
    calls,
    appleCalls: () => calls.filter((c) => c.url !== FINDMY_SETTINGS.anisetteUrl),
    anisetteCalls: () => calls.filter((c) => c.url === FINDMY_SETTINGS.anisetteUrl),
  });
}
