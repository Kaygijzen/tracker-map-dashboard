import { describe, expect, it } from 'vitest';
import { InvalidKeyError, deriveTrackerKey } from './keys.js';

/**
 * Known vector for the non-real scalar 0x01..0x1c, computed independently with Python
 * `cryptography` 41 (SECP224R1, X9.62 uncompressed point, hashlib.sha256).
 */
const VECTOR = {
  scalar: 'AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHA==',
  export85:
    'BGJ7fAs6L7ekeKxWcOmXMZSl/aC8B5GwdQanPd2ZETs/3qcbv/mSEzDZzpgBVe69YgxGvpJ8IUVDAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHA==',
  advertisementKey: 'Ynt8Czovt6R4rFZw6ZcxlKX9oLwHkbB1Bqc93Q==',
  hashedId: '/vOKuaTt4YQhx94Ge/rHR9KDiKnuhcZ7CrxlJFsRUzg=',
};

describe('deriveTrackerKey', () => {
  it('matches the known vector for a raw 28-byte scalar', () => {
    const key = deriveTrackerKey(VECTOR.scalar);
    expect(key.scalar.toString('base64')).toBe(VECTOR.scalar);
    expect(key.advertisementKey.toString('base64')).toBe(VECTOR.advertisementKey);
    expect(key.hashedId).toBe(VECTOR.hashedId);
  });

  it('gives the same id for the 85-byte export of the same scalar', () => {
    const key = deriveTrackerKey(VECTOR.export85);
    expect(key.scalar.toString('base64')).toBe(VECTOR.scalar);
    expect(key.hashedId).toBe(VECTOR.hashedId);
  });

  it('rejects other lengths without echoing the key', () => {
    const bad = Buffer.alloc(32, 7).toString('base64');
    expect(() => deriveTrackerKey(bad)).toThrow(InvalidKeyError);
    expect(() => deriveTrackerKey(bad)).toThrow(/got 32/);
    try {
      deriveTrackerKey(bad);
    } catch (error) {
      expect((error as Error).message).not.toContain(bad);
    }
  });

  it('rejects a zero scalar', () => {
    expect(() => deriveTrackerKey(Buffer.alloc(28).toString('base64'))).toThrow(InvalidKeyError);
  });
});
