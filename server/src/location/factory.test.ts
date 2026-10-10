import { describe, expect, it } from 'vitest';
import { loadConfig } from '../config.js';
import { FINDMY_SETTINGS } from '../test/findmy.js';
import { createLocationProvider } from './factory.js';
import { FindMyLocationProvider } from './findmy/provider.js';
import { MockLocationProvider } from './mock.js';

describe('createLocationProvider', () => {
  it('builds the mock provider by default', () => {
    expect(createLocationProvider(loadConfig({}), [])).toBeInstanceOf(MockLocationProvider);
    expect(createLocationProvider(loadConfig({ LOCATION_PROVIDER: 'mock' }), [])).toBeInstanceOf(MockLocationProvider);
  });

  it('builds the Find My provider when selected', () => {
    const config = loadConfig({
      LOCATION_PROVIDER: 'findmy',
      ANISETTE_URL: FINDMY_SETTINGS.anisetteUrl,
      FINDMY_DSID: FINDMY_SETTINGS.dsid,
      FINDMY_SEARCH_PARTY_TOKEN: FINDMY_SETTINGS.searchPartyToken,
    });
    expect(createLocationProvider(config, [])).toBeInstanceOf(FindMyLocationProvider);
  });
});
