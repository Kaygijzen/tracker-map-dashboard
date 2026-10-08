import { describe, expect, it } from 'vitest';
import type { Tracker } from '../api/types';
import { filterTrackers } from './filterTrackers';

const t = (id: number, name: string): Tracker => ({ id, name, color: '#00ff00', isDeployed: true, isActive: false, location: null });
const trackers = [t(6253030, 'rotokey_13'), t(5253030, 'rotokey_13'), t(42, 'Bike')];

describe('filterTrackers', () => {
  it('matches names case-insensitively', () => expect(filterTrackers(trackers, 'ROTO').map((x) => x.id)).toEqual([6253030, 5253030]));
  it('matches ids', () => expect(filterTrackers(trackers, '5253').map((x) => x.id)).toEqual([5253030]));
  it('returns all for an empty query', () => expect(filterTrackers(trackers, '  ')).toHaveLength(3));
  it('returns none when nothing matches', () => expect(filterTrackers(trackers, 'zzz')).toEqual([]));
});
