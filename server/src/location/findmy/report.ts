import { createDecipheriv, createECDH, createHash } from 'node:crypto';
import type { Location } from '../provider.js';
import { CURVE } from './keys.js';

/** Seconds between the Unix epoch and Apple's reference date (2001-01-01T00:00:00Z). */
export const APPLE_EPOCH_OFFSET = 978_307_200;
export const REPORT_LENGTH = 88;

export class ReportError extends Error {
  override name = 'ReportError';
}

/** SHA-256 KDF used by Find My: sha256(shared ‖ 00000001 ‖ ephemeral) → AES key (16) and IV (16). */
export function deriveReportKey(shared: Buffer, ephemeral: Buffer): { key: Buffer; iv: Buffer } {
  const kdf = createHash('sha256')
    .update(shared)
    .update(Buffer.from([0, 0, 0, 1]))
    .update(ephemeral)
    .digest();
  return { key: kdf.subarray(0, 16), iv: kdf.subarray(16, 32) };
}

/**
 * Decrypts one base64 location report payload with the tracker's private scalar.
 * Throws `ReportError` (with no key material in the message) when the payload is malformed or fails authentication.
 */
export function decryptReport(payloadB64: string, scalar: Buffer): Location {
  let data = Buffer.from(payloadB64, 'base64');
  // Newer reports carry one extra byte at index 4.
  if (data.length > REPORT_LENGTH) data = Buffer.concat([data.subarray(0, 4), data.subarray(5)]);
  if (data.length < REPORT_LENGTH) throw new ReportError(`Report payload too short (${data.length} bytes)`);

  const seconds = data.readUInt32BE(0) + APPLE_EPOCH_OFFSET;
  const ephemeral = data.subarray(5, 62);
  const ciphertext = data.subarray(62, 72);
  const tag = data.subarray(72);

  let plaintext: Buffer;
  try {
    const ecdh = createECDH(CURVE);
    ecdh.setPrivateKey(scalar);
    const { key, iv } = deriveReportKey(ecdh.computeSecret(ephemeral), ephemeral);
    const decipher = createDecipheriv('aes-128-gcm', key, iv, { authTagLength: tag.length });
    decipher.setAuthTag(tag);
    plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new ReportError('Report could not be decrypted');
  }

  return {
    lat: plaintext.readInt32BE(0) / 1e7,
    lng: plaintext.readInt32BE(4) / 1e7,
    accuracyMeters: plaintext.readUInt8(8),
    timestamp: new Date(seconds * 1000).toISOString(),
  };
}
