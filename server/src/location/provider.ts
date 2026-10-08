export interface Location {
  lat: number;
  lng: number;
  /** ISO 8601 time the position was observed. */
  timestamp: string;
  accuracyMeters: number;
}

export interface LocationProvider {
  getLatestLocation(trackerId: number): Promise<Location | null>;
}
