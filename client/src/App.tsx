import { AppShell } from './components/AppShell';
import { MapStatus } from './components/map/MapStatus';
import { TrackerMap } from './components/map/TrackerMap';
import { TrackerList } from './components/sidebar/TrackerList';
import { useTrackers } from './hooks/useTrackers';
import { SelectionProvider } from './state/selection';

export default function App() {
  const { trackers, loading, error } = useTrackers();

  return (
    <SelectionProvider>
      <AppShell sidebar={<TrackerList trackers={trackers} />}>
        <TrackerMap trackers={trackers} loaded={!loading && !error} />
        <MapStatus loading={loading} error={error} />
      </AppShell>
    </SelectionProvider>
  );
}
