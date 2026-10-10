import { createECDH, createHash } from 'node:crypto';

export const CURVE = 'secp224r1';
const SCALAR_LENGTH = 28;
const EXPORT_LENGTH = 85;

/** Key material for one tracker. Holds the private scalar: never log or return it. */
export interface TrackerKey {
  scalar: Buffer;
  /** X coordinate of the public key (28 bytes), as broadcast by the beacon. */
  advertisementKey: Buffer;
  /** base64(sha256(advertisementKey)): the id Apple's report service files reports under. */
  hashedId: string;
}

export class InvalidKeyError extends Error {
  override name = 'InvalidKeyError';
}

/**
 * Derives the Find My key data from an OpenHaystack `privateKey`: base64 of a raw 28-byte P-224
 * scalar, or an 85-byte SecKey export (`04‖X‖Y‖K`) whose last 28 bytes are the scalar.
 * Error messages never include key material.
 */
export function deriveTrackerKey(privateKeyB64: string): TrackerKey {
  const raw = Buffer.from(privateKeyB64, 'base64');
  let scalar: Buffer;
  if (raw.length === SCALAR_LENGTH) scalar = raw;
  else if (raw.length === EXPORT_LENGTH) scalar = raw.subarray(EXPORT_LENGTH - SCALAR_LENGTH);
  else throw new InvalidKeyError(`Private key must be ${SCALAR_LENGTH} or ${EXPORT_LENGTH} bytes, got ${raw.length}`);

  const ecdh = createECDH(CURVE);
  try {
    ecdh.setPrivateKey(scalar);
  } catch {
    throw new InvalidKeyError('Private key is not a valid P-224 scalar');
  }
  const advertisementKey = ecdh.getPublicKey().subarray(1, 1 + SCALAR_LENGTH);
  const hashedId = createHash('sha256').update(advertisementKey).digest('base64');
  return { scalar: Buffer.from(scalar), advertisementKey, hashedId };
}
