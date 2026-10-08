import type L from 'leaflet';
import { useEffect, type MutableRefObject } from 'react';
import { useMap } from 'react-leaflet';
import { useSelection } from '../../state/selection';

const FLY_ZOOM = 15;

/** Flies to and opens the popup of trackers selected outside the map (e.g. the sidebar). */
export function SelectionSync({ markers }: { markers: MutableRefObject<Map<number, L.CircleMarker>> }) {
  const map = useMap();
  const { selectedId, source } = useSelection();

  useEffect(() => {
    if (selectedId === null || source !== 'list') return;
    const marker = markers.current.get(selectedId);
    if (!marker) return;

    const target = marker.getLatLng();
    const zoom = Math.max(map.getZoom(), FLY_ZOOM);
    const alreadyThere =
      map.getZoom() === zoom && map.latLngToContainerPoint(target).distanceTo(map.latLngToContainerPoint(map.getCenter())) < 1;

    if (alreadyThere) {
      marker.openPopup();
      return;
    }
    const open = () => marker.openPopup();
    map.once('moveend', open);
    map.flyTo(target, zoom, { duration: 0.8 });
    return () => {
      map.off('moveend', open);
    };
  }, [map, markers, selectedId, source]);

  return null;
}
