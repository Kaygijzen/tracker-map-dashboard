import { describe, expect, it } from 'vitest';
import { encryptReport, testPrivateKey } from '../../test/findmy.js';
import { deriveTrackerKey } from './keys.js';
import { ReportError, decryptReport } from './report.js';

const privateKey = testPrivateKey();
const { scalar } = deriveTrackerKey(privateKey);
const input = { lat: 52.3702157, lng: -4.8951679, accuracyMeters: 37, at: new Date('2026-10-10T11:00:00Z') };

describe('decryptReport', () => {
  it('decrypts an 88-byte report', () => {
    const payload = encryptReport(privateKey, input);
    expect(Buffer.from(payload, 'base64')).toHaveLength(88);
    expect(decryptReport(payload, scalar)).toEqual({
      lat: 52.3702157,
      lng: -4.8951679,
      accuracyMeters: 37,
      timestamp: '2026-10-10T11:00:00.000Z',
    });
  });

  it('decrypts an 89-byte report by dropping byte 4', () => {
    const payload = encryptReport(privateKey, { ...input, long: true });
    expect(Buffer.from(payload, 'base64')).toHaveLength(89);
    expect(decryptReport(payload, scalar).lat).toBe(52.3702157);
  });

  it('rejects a tampered payload', () => {
    const data = Buffer.from(encryptReport(privateKey, input), 'base64');
    data[65] ^= 0xff; // flip a ciphertext byte
    expect(() => decryptReport(data.toString('base64'), scalar)).toThrow(ReportError);
  });

  it('rejects a report for another key', () => {
    const payload = encryptReport(testPrivateKey(), input);
    expect(() => decryptReport(payload, scalar)).toThrow(ReportError);
  });

  it('rejects a short payload', () => {
    expect(() => decryptReport(Buffer.alloc(40).toString('base64'), scalar)).toThrow(/too short/);
  });
});
