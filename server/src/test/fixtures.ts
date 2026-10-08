import type { KeyEntry } from '../keys.js';

export const SECRET_PRIVATE_KEY = 'SECRET-PRIVATE-KEY-c2VjcmV0IGtleQ==';
export const SECRET_ADDITIONAL_KEY = 'SECRET-ADDITIONAL-KEY-YWRkaXRpb25hbA==';
export const SECRET_ACCOUNT = 'secret-account@example.com';

export function rawEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 1001,
    colorComponents: [0, 1, 0, 1],
    name: 'rotokey_13',
    privateKey: SECRET_PRIVATE_KEY,
    icon: '',
    isDeployed: true,
    colorSpaceName: 'kCGColorSpaceExtendedSRGB',
    usesDerivation: false,
    isActive: false,
    additionalKeys: [SECRET_ADDITIONAL_KEY],
    account: SECRET_ACCOUNT,
    ...overrides,
  };
}

export const entries = [rawEntry(), rawEntry({ id: 1002 })] as KeyEntry[];
