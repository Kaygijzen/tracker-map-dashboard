import { describe, expect, it } from 'vitest';
import { colorToHex, toTracker } from './trackers.js';
import { entries } from './test/fixtures.js';

describe('colorToHex', () => {
  it('converts 0–1 components to #rrggbb', () => {
    expect(colorToHex([0, 1, 0, 1])).toBe('#00ff00');
  });

  it('clamps out-of-range components and ignores alpha', () => {
    expect(colorToHex([1.2, -0.1, 0.5, 1])).toBe('#ff0080');
    expect(colorToHex([0, 0, 0, 0])).toBe('#000000');
  });
});

describe('toTracker', () => {
  it('returns exactly the public fields', () => {
    expect(toTracker(entries[0])).toEqual({
      id: 1001,
      name: 'rotokey_13',
      color: '#00ff00',
      isDeployed: true,
      isActive: false,
    });
  });
});
