import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchTrackers } from '../api/client';
import type { Tracker } from '../api/types';
import { REFRESH_INTERVAL_MS } from '../config';

export interface TrackersState {
  trackers: Tracker[];
  /** True until the first request finishes. */
  initialLoading: boolean;
  /** True while any request is in flight. */
  refreshing: boolean;
  /** Error from the first load; cleared by the next success. */
  error: Error | null;
  /** Error from a background refresh after data was shown; cleared by the next success. */
  refreshError: Error | null;
  lastUpdated: Date | null;
}

export interface UseTrackersResult extends TrackersState {
  refresh: () => void;
}

const INITIAL: TrackersState = {
  trackers: [],
  initialLoading: true,
  refreshing: true,
  error: null,
  refreshError: null,
  lastUpdated: null,
};

/** Loads trackers and keeps them fresh by polling; each poll is scheduled after the previous one finishes. */
export function useTrackers({ intervalMs = REFRESH_INTERVAL_MS }: { intervalMs?: number } = {}): UseTrackersResult {
  const [state, setState] = useState<TrackersState>(INITIAL);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const inFlight = useRef(false);
  const hasData = useRef(false);
  const controller = useRef<AbortController>();
  const load = useRef<() => void>(() => {});

  load.current = () => {
    if (inFlight.current) return;
    clearTimeout(timer.current);
    inFlight.current = true;
    setState((s) => (s.refreshing ? s : { ...s, refreshing: true }));
    const signal = controller.current?.signal;

    fetchTrackers(signal)
      .then((trackers) => {
        hasData.current = true;
        setState({ trackers, initialLoading: false, refreshing: false, error: null, refreshError: null, lastUpdated: new Date() });
      })
      .catch((error: Error) => {
        if (error.name === 'AbortError') return;
        setState((s) =>
          hasData.current
            ? { ...s, refreshing: false, refreshError: error }
            : { ...s, initialLoading: false, refreshing: false, error },
        );
      })
      .finally(() => {
        if (signal?.aborted) return;
        inFlight.current = false;
        timer.current = setTimeout(() => load.current(), intervalMs);
      });
  };

  useEffect(() => {
    controller.current = new AbortController();
    inFlight.current = false;
    load.current();
    return () => {
      controller.current?.abort();
      clearTimeout(timer.current);
    };
  }, [intervalMs]);

  const refresh = useCallback(() => load.current(), []);

  return { ...state, refresh };
}
