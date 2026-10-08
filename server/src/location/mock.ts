import type { Location, LocationProvider } from './provider.js';

const METERS_PER_DEGREE_LAT = 111_320;
const SPREAD_RADIUS_M = 5_000;
const DRIFT_RADIUS_M = 50;

/** 32-bit FNV-1a hash of a string. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Deterministic value in [0, 1) for a tracker id and a salt. */
function unit(trackerId: number, salt: string): number {
  return fnv1a(`${salt}:${trackerId}`) / 2 ** 32;
}

/** Moves a point by `distance` meters at `bearing` radians (small-distance approximation). */
function offset(point: { lat: number; lng: number }, distance: number, bearing: number) {
  const dLat = (distance * Math.cos(bearing)) / METERS_PER_DEGREE_LAT;
  const dLng = (distance * Math.sin(bearing)) / (METERS_PER_DEGREE_LAT * Math.cos((point.lat * Math.PI) / 180));
  return { lat: point.lat + dLat, lng: point.lng + dLng };
}

export interface MockLocationProviderOptions {
  center: { lat: number; lng: number };
  random?: () => number;
  now?: () => Date;
}

/** Fake positions: a stable base point per tracker id near `center`, plus a small random drift per call. */
export class MockLocationProvider implements LocationProvider {
  private readonly center;
  private readonly random;
  private readonly now;

  constructor({ center, random = Math.random, now = () => new Date() }: MockLocationProviderOptions) {
    this.center = center;
    this.random = random;
    this.now = now;
  }

  basePosition(trackerId: number): { lat: number; lng: number } {
    const distance = Math.sqrt(unit(trackerId, 'distance')) * SPREAD_RADIUS_M;
    const bearing = unit(trackerId, 'bearing') * 2 * Math.PI;
    return offset(this.center, distance, bearing);
  }

  async getLatestLocation(trackerId: number): Promise<Location> {
    const base = this.basePosition(trackerId);
    const drift = Math.sqrt(this.random()) * DRIFT_RADIUS_M;
    const { lat, lng } = offset(base, drift, this.random() * 2 * Math.PI);
    return {
      lat,
      lng,
      timestamp: this.now().toISOString(),
      accuracyMeters: Math.round(5 + unit(trackerId, 'accuracy') * 45),
    };
  }
}
