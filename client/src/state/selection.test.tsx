import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { SelectionProvider, useSelection } from './selection';

const wrapper = ({ children }: { children: ReactNode }) => <SelectionProvider>{children}</SelectionProvider>;

describe('useSelection', () => {
  it('selects with a source and clears', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    act(() => result.current.select(1, 'list'));
    expect(result.current).toMatchObject({ selectedId: 1, source: 'list' });
    act(() => result.current.clear());
    expect(result.current).toMatchObject({ selectedId: null, source: null });
  });

  it('ignores a clear for a stale id', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    act(() => result.current.select(1, 'list'));
    act(() => result.current.select(2, 'list'));
    act(() => result.current.clear(1));
    expect(result.current.selectedId).toBe(2);
    act(() => result.current.clear(2));
    expect(result.current.selectedId).toBeNull();
  });
});
