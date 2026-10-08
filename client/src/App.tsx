import { AppShell } from './components/AppShell';
import { MapStatus } from './components/map/MapStatus';
import { TrackerMap } from './components/map/TrackerMap';
import { RefreshErrorSnackbar } from './components/RefreshErrorSnackbar';
import { RefreshStatus } from './components/RefreshStatus';
import { TrackerList } from './components/sidebar/TrackerList';
import { useTrackers } from './hooks/useTrackers';
import { SelectionProvider } from './state/selection';

export default function App() {
  const { trackers, initialLoading, refreshing, error, refreshError, lastUpdated, refresh } = useTrackers();
  const loaded = lastUpdated !== null;

  return (
    <SelectionProvider>
      <AppShell
        sidebar={<TrackerList trackers={trackers} />}
        actions={<RefreshStatus lastUpdated={lastUpdated} refreshing={refreshing} onRefresh={refresh} />}
      >
        <TrackerMap trackers={trackers} loaded={loaded} />
        <MapStatus loading={initialLoading} error={error} empty={loaded && trackers.length === 0} />
      </AppShell>
      <RefreshErrorSnackbar error={refreshError} />
    </SelectionProvider>
  );
}
