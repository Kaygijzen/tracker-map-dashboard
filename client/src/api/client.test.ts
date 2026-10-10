import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchTrackers } from './client';

afterEach(() => vi.unstubAllGlobals());

describe('fetchTrackers', () => {
  it('returns the trackers array', async () => {
    const trackers = [{ id: 1, name: 'a', color: '#00ff00', icon: null, isDeployed: true, isActive: false, location: null }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ trackers }), { status: 200 })));
    await expect(fetchTrackers()).resolves.toEqual(trackers);
    expect(fetch).toHaveBeenCalledWith('/api/trackers', expect.anything());
  });

  it('throws ApiError with status on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));
    await expect(fetchTrackers()).rejects.toMatchObject({ name: 'ApiError', status: 500 });
  });

  it('throws ApiError on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(fetchTrackers()).rejects.toBeInstanceOf(ApiError);
  });
});
