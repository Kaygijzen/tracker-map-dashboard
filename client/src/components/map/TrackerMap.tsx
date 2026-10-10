import type L from 'leaflet';
import { useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Tracker } from '../../api/types';
import { useNow } from '../../hooks/useNow';
import { useSelection } from '../../state/selection';
import { isStale } from '../../utils/stale';
import { DEFAULT_CENTER, DEFAULT_ZOOM, FitBoundsOnce, InvalidateOnResize } from './MapHelpers';
import { SelectionSync } from './SelectionSync';
import { TrackerPopupContent } from './TrackerPopup';
import { trackerIcon } from './trackerIcon';

interface TrackerMapProps {
  trackers: Tracker[];
  loaded: boolean;
}

export function TrackerMap({ trackers, loaded }: TrackerMapProps) {
  const { selectedId, select, clear } = useSelection();
  const markers = useRef(new Map<number, L.Marker>());
  const now = useNow();

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {trackers.map((tracker) => {
        if (!tracker.location) return null;
        const selected = tracker.id === selectedId;
        const stale = isStale(tracker.location, now);
        return (
          <Marker
            key={tracker.id}
            ref={(marker) => {
              if (marker) markers.current.set(tracker.id, marker);
              else markers.current.delete(tracker.id);
            }}
            position={[tracker.location.lat, tracker.location.lng]}
            icon={trackerIcon(tracker, { selected, stale })}
            title={tracker.name}
            alt={tracker.name}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{
              click: () => select(tracker.id, 'map'),
              popupclose: () => clear(tracker.id),
            }}
          >
            <Popup>
              <TrackerPopupContent tracker={tracker} location={tracker.location} now={now} />
            </Popup>
          </Marker>
        );
      })}
      <FitBoundsOnce trackers={trackers} ready={loaded} />
      <InvalidateOnResize />
      <SelectionSync markers={markers} />
    </MapContainer>
  );
}
