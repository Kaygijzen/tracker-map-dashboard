import L from 'leaflet';
import type { Tracker } from '../../api/types';

const cache = new Map<string, L.DivIcon>();

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * A round marker in the tracker's color with its emoji inside (or a plain dot without one).
 * Icons are cached so re-renders don't replace the marker element and drop focus.
 */
export function trackerIcon(tracker: Pick<Tracker, 'color' | 'icon'>, { selected, stale }: { selected: boolean; stale: boolean }) {
  const key = [tracker.color, tracker.icon, selected, stale].join('|');
  const cached = cache.get(key);
  if (cached) return cached;

  const size = tracker.icon ? (selected ? 38 : 30) : selected ? 24 : 18;
  const style = [
    `width:${size}px`,
    `height:${size}px`,
    `background:${tracker.color}`,
    `border:${selected ? 3 : 2}px ${stale ? 'dashed' : 'solid'} #fff`,
    `opacity:${stale ? 0.55 : 1}`,
    `font-size:${Math.round(size * 0.55)}px`,
    'box-sizing:border-box',
    'border-radius:50%',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'line-height:1',
    'box-shadow:0 1px 4px rgba(0,0,0,.45)',
  ].join(';');
  const icon = L.divIcon({
    className: 'tracker-marker',
    html: `<div style="${style}">${tracker.icon ? escapeHtml(tracker.icon) : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
  cache.set(key, icon);
  return icon;
}
