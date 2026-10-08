import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type SelectionSource = 'map' | 'list';

interface SelectionState {
  selectedId: number | null;
  /** Where the current selection came from; only list selections make the map fly. */
  source: SelectionSource | null;
}

export interface SelectionContextValue extends SelectionState {
  select: (id: number, source: SelectionSource) => void;
  /** Clears the selection. With `expectedId`, only clears if that tracker is still selected. */
  clear: (expectedId?: number) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SelectionState>({ selectedId: null, source: null });

  const select = useCallback((id: number, source: SelectionSource) => setState({ selectedId: id, source }), []);
  const clear = useCallback(
    (expectedId?: number) =>
      setState((s) =>
        expectedId === undefined || s.selectedId === expectedId ? { selectedId: null, source: null } : s,
      ),
    [],
  );

  const value = useMemo(() => ({ ...state, select, clear }), [state, select, clear]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionContextValue {
  const value = useContext(SelectionContext);
  if (!value) throw new Error('useSelection must be used inside SelectionProvider');
  return value;
}
