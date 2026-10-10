import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Tracker } from '../api/types';
import { useTrackers } from './useTrackers';

const tracker = (lat: number): Tracker => ({
  id: 1,
  name: 'a',
  color: '#00ff00',
  icon: null,
  isDeployed: true,
  isActive: true,
  location: { lat, lng: 4.89, timestamp: new Date().toISOString(), accuracyMeters: 10 },
});
const ok = (lat: number) => new Response(JSON.stringify({ trackers: [tracker(lat)] }), { status: 200 });
const fail = () => new Response('{}', { status: 500 });

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.useFakeTimers();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Lets pending promise callbacks run. */
const flush = () => act(async () => { await vi.advanceTimersByTimeAsync(0); });
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

describe('useTrackers', () => {
  it('loads, then polls on the interval', async () => {
    fetchMock.mockImplementation(async () => ok(52));
    const { result } = renderHook(() => useTrackers({ intervalMs: 30_000 }));
    expect(result.current.initialLoading).toBe(true);
    await flush();
    expect(result.current.initialLoading).toBe(false);
    expect(result.current.trackers).toHaveLength(1);
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await advance(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('never overlaps requests', async () => {
    let resolve: (r: Response) => void = () => {};
    fetchMock.mockImplementation(() => new Promise<Response>((r) => (resolve = r)));
    const { result } = renderHook(() => useTrackers({ intervalMs: 1_000 }));
    await advance(5_000);
    act(() => result.current.refresh());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => resolve(ok(52)));
    await flush();
    expect(result.current.refreshing).toBe(false);
  });

  it('keeps the last data when a background refresh fails, then recovers', async () => {
    fetchMock.mockResolvedValueOnce(ok(52)).mockResolvedValueOnce(fail()).mockResolvedValueOnce(ok(53));
    const { result } = renderHook(() => useTrackers({ intervalMs: 1_000 }));
    await flush();
    const firstUpdate = result.current.lastUpdated;
    await advance(1_000);
    expect(result.current.refreshError).not.toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.trackers[0].location?.lat).toBe(52);
    expect(result.current.lastUpdated).toBe(firstUpdate);
    await advance(1_000);
    expect(result.current.refreshError).toBeNull();
    expect(result.current.trackers[0].location?.lat).toBe(53);
  });

  it('reports a first-load error separately', async () => {
    fetchMock.mockResolvedValueOnce(fail());
    const { result } = renderHook(() => useTrackers({ intervalMs: 1_000 }));
    await flush();
    expect(result.current.error).not.toBeNull();
    expect(result.current.refreshError).toBeNull();
    expect(result.current.initialLoading).toBe(false);
  });

  it('refresh() fetches immediately and restarts the interval', async () => {
    fetchMock.mockImplementation(async () => ok(52));
    const { result } = renderHook(() => useTrackers({ intervalMs: 30_000 }));
    await flush();
    await advance(20_000);
    act(() => result.current.refresh());
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await advance(20_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await advance(10_000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
