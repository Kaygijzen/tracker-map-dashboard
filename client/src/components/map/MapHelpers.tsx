import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { Tracker } from '../../api/types';

export const DEFAULT_CENTER: L.LatLngTuple = [52.37, 4.89];
export const DEFAULT_ZOOM = 11;
const SINGLE_MARKER_ZOOM = 15;

/** Fits the view to the trackers once, after the first successful load. */
export function FitBoundsOnce({ trackers, ready }: { trackers: Tracker[]; ready: boolean }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    const points = trackers.flatMap((t) => (t.location ? [L.latLng(t.location.lat, t.location.lng)] : []));
    if (points.length === 0) map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    else if (points.length === 1) map.setView(points[0], SINGLE_MARKER_ZOOM);
    else map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: SINGLE_MARKER_ZOOM });
  }, [map, trackers, ready]);

  return null;
}

/** Keeps Leaflet's size in sync with its container (drawer changes, window resizes). */
export function InvalidateOnResize() {
  const map = useMap();

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
}
