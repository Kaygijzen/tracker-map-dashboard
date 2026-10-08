import type L from 'leaflet';
import { useEffect, useRef } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { Tracker } from '../../api/types';
import { useNow } from '../../hooks/useNow';
import { useSelection } from '../../state/selection';
import { isStale } from '../../utils/stale';
import { DEFAULT_CENTER, DEFAULT_ZOOM, FitBoundsOnce, InvalidateOnResize } from './MapHelpers';
import { SelectionSync } from './SelectionSync';
import { TrackerPopupContent } from './TrackerPopup';

interface TrackerMapProps {
  trackers: Tracker[];
  loaded: boolean;
}

export function TrackerMap({ trackers, loaded }: TrackerMapProps) {
  const { selectedId, select, clear } = useSelection();
  const markers = useRef(new Map<number, L.CircleMarker>());
  const now = useNow();

  useEffect(() => {
    if (selectedId !== null) markers.current.get(selectedId)?.bringToFront();
  }, [selectedId]);

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
          <CircleMarker
            key={tracker.id}
            ref={(marker) => {
              if (marker) markers.current.set(tracker.id, marker);
              else markers.current.delete(tracker.id);
            }}
            center={[tracker.location.lat, tracker.location.lng]}
            radius={selected ? 12 : 9}
            pathOptions={{
              color: '#ffffff',
              weight: selected ? 3 : 2,
              fillColor: tracker.color,
              fillOpacity: stale ? 0.35 : 0.9,
              opacity: stale ? 0.6 : 1,
              dashArray: stale ? '4 3' : undefined,
            }}
            eventHandlers={{
              click: () => select(tracker.id, 'map'),
              popupclose: () => clear(tracker.id),
            }}
          >
            <Popup>
              <TrackerPopupContent tracker={tracker} location={tracker.location} now={now} />
            </Popup>
          </CircleMarker>
        );
      })}
      <FitBoundsOnce trackers={trackers} ready={loaded} />
      <InvalidateOnResize />
      <SelectionSync markers={markers} />
    </MapContainer>
  );
}
