import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';
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
