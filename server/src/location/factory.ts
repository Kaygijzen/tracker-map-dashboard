import type { Config } from '../config.js';
import type { KeyEntry } from '../keys.js';
import { FindMyClient } from './findmy/client.js';
import { FindMyLocationProvider, type Logger } from './findmy/provider.js';
import { MockLocationProvider } from './mock.js';
import type { LocationProvider } from './provider.js';

/** Builds the provider chosen by `config.locationProvider`. `entries` hold secrets: only providers receive them. */
export function createLocationProvider(
  config: Config,
  entries: KeyEntry[],
  logger: Logger = console,
  { fetch }: { fetch?: typeof globalThis.fetch } = {},
): LocationProvider {
  if (config.locationProvider === 'findmy' && config.findMy) {
    const client = new FindMyClient({ ...config.findMy, fetch });
    return new FindMyLocationProvider({ entries, client, logger });
  }
  return new MockLocationProvider({ center: config.mockCenter });
}
