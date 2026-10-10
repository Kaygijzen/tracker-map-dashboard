/** Mirrors the server's public tracker shape (see the `tracker-api` spec). */
export interface TrackerLocation {
  lat: number;
  lng: number;
  /** ISO 8601 time the position was observed. */
  timestamp: string;
  accuracyMeters: number;
}

export interface Tracker {
  id: number;
  name: string;
  /** `#rrggbb` */
  color: string;
  /** An emoji, or null. */
  icon: string | null;
  isDeployed: boolean;
  isActive: boolean;
  location: TrackerLocation | null;
}

export interface TrackersResponse {
  trackers: Tracker[];
}
