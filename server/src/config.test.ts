import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from './config.js';
import { REPO_ROOT } from './paths.js';

describe('loadConfig', () => {
  it('uses defaults', () => {
    const config = loadConfig({});
    expect(config.port).toBe(3001);
    expect(config.keysFile).toBe(path.join(REPO_ROOT, 'keys.json'));
    expect(config.mockCenter).toEqual({ lat: 52.37, lng: 4.89 });
  });

  it('reads overrides and resolves relative KEYS_FILE against the repo root', () => {
    const config = loadConfig({ PORT: '4000', KEYS_FILE: 'data/k.json', MOCK_CENTER_LAT: '48.85', MOCK_CENTER_LNG: '2.35' });
    expect(config.port).toBe(4000);
    expect(config.keysFile).toBe(path.join(REPO_ROOT, 'data/k.json'));
    expect(config.mockCenter).toEqual({ lat: 48.85, lng: 2.35 });
    expect(loadConfig({ KEYS_FILE: '/tmp/other.json' }).keysFile).toBe('/tmp/other.json');
  });

  it('points at the repository root', () => {
    expect(path.basename(REPO_ROOT)).not.toBe('server');
  });
});

describe('loadConfig location provider', () => {
  const findMyEnv = {
    LOCATION_PROVIDER: 'findmy',
    ANISETTE_URL: 'http://anisette.test:6969',
    FINDMY_DSID: 'dsid-value-123',
    FINDMY_SEARCH_PARTY_TOKEN: 'token-value-456',
  };

  function configError(env: NodeJS.ProcessEnv): string {
    try {
      loadConfig(env);
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      return (error as Error).message;
    }
    throw new Error('expected loadConfig to throw');
  }

  it('defaults to the mock provider and ignores Find My variables', () => {
    expect(loadConfig({}).locationProvider).toBe('mock');
    expect(loadConfig({ LOCATION_PROVIDER: '' }).locationProvider).toBe('mock');
    expect(loadConfig({}).findMy).toBeUndefined();
  });

  it('accepts an explicit mock', () => {
    expect(loadConfig({ LOCATION_PROVIDER: 'mock' }).locationProvider).toBe('mock');
  });

  it('reads the Find My settings', () => {
    const config = loadConfig(findMyEnv);
    expect(config.locationProvider).toBe('findmy');
    expect(config.findMy).toEqual({
      anisetteUrl: 'http://anisette.test:6969',
      dsid: 'dsid-value-123',
      searchPartyToken: 'token-value-456',
    });
  });

  it('rejects an invalid provider, naming it and the allowed values', () => {
    const message = configError({ LOCATION_PROVIDER: 'gps' });
    expect(message).toContain('gps');
    expect(message).toContain('mock');
    expect(message).toContain('findmy');
  });

  it('names each missing Find My variable without any configured value', () => {
    const message = configError({ ...findMyEnv, FINDMY_DSID: '', FINDMY_SEARCH_PARTY_TOKEN: undefined });
    expect(message).toContain('FINDMY_DSID');
    expect(message).toContain('FINDMY_SEARCH_PARTY_TOKEN');
    expect(message).not.toContain('ANISETTE_URL');
    expect(message).not.toContain(findMyEnv.ANISETTE_URL);

    const onlyToken = configError({ ...findMyEnv, FINDMY_SEARCH_PARTY_TOKEN: ' ' });
    expect(onlyToken).toContain('FINDMY_SEARCH_PARTY_TOKEN');
    for (const value of [findMyEnv.ANISETTE_URL, findMyEnv.FINDMY_DSID]) expect(onlyToken).not.toContain(value);
  });
});
