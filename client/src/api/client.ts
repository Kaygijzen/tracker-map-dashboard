import type { Tracker, TrackersResponse } from './types';

export class ApiError extends Error {
  override name = 'ApiError';

  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError('Could not reach the tracker API.');
  }
  if (!res.ok) throw new ApiError(`The tracker API responded with ${res.status}.`, res.status);
  return (await res.json()) as T;
}

export async function fetchTrackers(signal?: AbortSignal): Promise<Tracker[]> {
  const body = await getJson<TrackersResponse>('/api/trackers', signal);
  return body.trackers;
}
