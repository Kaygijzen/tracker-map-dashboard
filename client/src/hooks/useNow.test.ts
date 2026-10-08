import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useNow } from './useNow';

afterEach(() => vi.useRealTimers());

describe('useNow', () => {
  it('ticks on the interval', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const { result } = renderHook(() => useNow(1_000));
    const first = result.current.getTime();
    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current.getTime()).toBe(first + 1_000);
  });
});
