import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { Tracker } from '../../api/types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, FitBoundsOnce, InvalidateOnResize } from './MapHelpers';
import { TrackerPopupContent } from './TrackerPopup';

interface TrackerMapProps {
  trackers: Tracker[];
  loaded: boolean;
}

export function TrackerMap({ trackers, loaded }: TrackerMapProps) {
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {trackers.map((tracker) =>
        tracker.location ? (
          <CircleMarker
            key={tracker.id}
            center={[tracker.location.lat, tracker.location.lng]}
            radius={9}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: tracker.color, fillOpacity: 0.9 }}
          >
            <Popup>
              <TrackerPopupContent tracker={tracker} location={tracker.location} />
            </Popup>
          </CircleMarker>
        ) : null,
      )}
      <FitBoundsOnce trackers={trackers} ready={loaded} />
      <InvalidateOnResize />
    </MapContainer>
  );
}
