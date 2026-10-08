import express from 'express';
import type { LocationProvider } from './location/provider.js';
import type { Tracker, TrackerWithLocation } from './trackers.js';

export interface AppDeps {
  trackers: Tracker[];
  locationProvider: LocationProvider;
}

export function createApp({ trackers, locationProvider }: AppDeps) {
  const app = express();

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/trackers', async (_req, res, next) => {
    try {
      const withLocations: TrackerWithLocation[] = await Promise.all(
        trackers.map(async (tracker) => ({
          ...tracker,
          location: await locationProvider.getLatestLocation(tracker.id),
        })),
      );
      res.json({ trackers: withLocations });
    } catch (error) {
      next(error);
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
