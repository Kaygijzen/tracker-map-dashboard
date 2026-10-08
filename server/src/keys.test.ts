import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { KeysFileError, loadKeysFile, parseKeysFile } from './keys.js';
import { SECRET_PRIVATE_KEY, rawEntry } from './test/fixtures.js';

describe('parseKeysFile', () => {
  it('parses valid entries and allows repeated names', () => {
    const entries = parseKeysFile(JSON.stringify([rawEntry(), rawEntry({ id: 2 })]));
    expect(entries.map((e) => e.id)).toEqual([1001, 2]);
    expect(entries.map((e) => e.name)).toEqual(['rotokey_13', 'rotokey_13']);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseKeysFile('{nope')).toThrow(/not valid JSON/);
  });

  it('names the entry and field on invalid shape, without values', () => {
    const bad = JSON.stringify([rawEntry(), rawEntry({ id: 'abc', privateKey: 42 })]);
    let message = '';
    try {
      parseKeysFile(bad);
    } catch (error) {
      expect(error).toBeInstanceOf(KeysFileError);
      message = (error as Error).message;
    }
    expect(message).toMatch(/entry\[1\]\.id/);
    expect(message).not.toContain('abc');
    expect(message).not.toContain(SECRET_PRIVATE_KEY);
  });

  it('rejects duplicate ids', () => {
    expect(() => parseKeysFile(JSON.stringify([rawEntry(), rawEntry()]))).toThrow(/duplicate id 1001/);
  });
});

describe('loadKeysFile', () => {
  it('returns [] with a warning when the file is missing', () => {
    const warn = vi.fn();
    expect(loadKeysFile('/definitely/not/here.json', warn)).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/definitely/not/here.json'));
  });

  it('reads a file from disk', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'keys-'));
    const file = path.join(dir, 'keys.json');
    writeFileSync(file, JSON.stringify([rawEntry()]));
    expect(loadKeysFile(file)).toHaveLength(1);
  });
});
