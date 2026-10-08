import { useEffect, useState } from 'react';
import { fetchTrackers } from '../api/client';
import type { Tracker } from '../api/types';

export interface TrackersState {
  trackers: Tracker[];
  loading: boolean;
  error: Error | null;
}

export function useTrackers(): TrackersState {
  const [state, setState] = useState<TrackersState>({ trackers: [], loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    fetchTrackers(controller.signal)
      .then((trackers) => setState({ trackers, loading: false, error: null }))
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error }));
      });
    return () => controller.abort();
  }, []);

  return state;
}
