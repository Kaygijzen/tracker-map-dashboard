import { Typography } from '@mui/material';
import { AppShell } from './components/AppShell';
import { MapStatus } from './components/map/MapStatus';
import { TrackerMap } from './components/map/TrackerMap';
import { useTrackers } from './hooks/useTrackers';

export default function App() {
  const { trackers, loading, error } = useTrackers();

  return (
    <AppShell
      sidebar={
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Trackers will appear here.
        </Typography>
      }
    >
      <TrackerMap trackers={trackers} loaded={!loading && !error} />
      <MapStatus loading={loading} error={error} />
    </AppShell>
  );
}
