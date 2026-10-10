import type { KeyEntry } from '../../keys.js';
import type { Location, LocationProvider } from '../provider.js';
import { FindMyRequestError } from './client.js';
import { InvalidKeyError, type TrackerKey, deriveTrackerKey } from './keys.js';
import { decryptReport } from './report.js';

export const CACHE_TTL_MS = 5 * 60 * 1000;
export const FAILURE_BACKOFF_MS = 60 * 1000;

export interface Logger {
  warn(message: string): void;
  error(message: string): void;
}

export interface ReportSource {
  fetchReports(hashedIds: string[]): Promise<Map<string, string[]>>;
}

export interface FindMyLocationProviderOptions {
  /** Full key entries, with secrets. Only this provider holds them. */
  entries: KeyEntry[];
  client: ReportSource;
  logger?: Logger;
  now?: () => Date;
}

interface Snapshot {
  locations: Map<number, Location>;
  expiresAt: number;
}

/** Builds a log line from fixed text and safe values only: never from an error's own fields beyond its class. */
function describeError(error: unknown): string {
  if (error instanceof FindMyRequestError) return error.message;
  const name = error instanceof Error ? error.name : '';
  return /^\w+$/.test(name) ? `unexpected ${name}` : 'unexpected error';
}

/**
 * Real positions from Apple's Find My network. All trackers share one request, results are cached
 * for 5 minutes, and failures yield `null` locations with a 1-minute backoff.
 */
export class FindMyLocationProvider implements LocationProvider {
  private readonly keys = new Map<number, TrackerKey>();
  private readonly client: ReportSource;
  private readonly logger: Logger;
  private readonly now: () => Date;
  private snapshot: Snapshot | null = null;
  private inFlight: Promise<Snapshot> | null = null;

  constructor({ entries, client, logger = console, now = () => new Date() }: FindMyLocationProviderOptions) {
    this.client = client;
    this.logger = logger;
    this.now = now;
    for (const entry of entries) {
      if (entry.usesDerivation) {
        logger.warn(`Tracker ${entry.id} uses key derivation, which the Find My provider does not support; its location will be empty.`);
        continue;
      }
      try {
        this.keys.set(entry.id, deriveTrackerKey(entry.privateKey));
      } catch (error) {
        const reason = error instanceof InvalidKeyError ? 'has a malformed private key' : 'has an unusable private key';
        logger.warn(`Tracker ${entry.id} ${reason}; its location will be empty.`);
      }
    }
  }

  async getLatestLocation(trackerId: number): Promise<Location | null> {
    if (!this.keys.has(trackerId)) return null;
    const snapshot = await this.currentSnapshot();
    return snapshot.locations.get(trackerId) ?? null;
  }

  private currentSnapshot(): Promise<Snapshot> {
    if (this.snapshot && this.now().getTime() < this.snapshot.expiresAt) return Promise.resolve(this.snapshot);
    this.inFlight ??= this.refresh().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async refresh(): Promise<Snapshot> {
    let snapshot: Snapshot;
    try {
      const hashedIds = [...new Set([...this.keys.values()].map((key) => key.hashedId))];
      const reports = await this.client.fetchReports(hashedIds);
      snapshot = { locations: this.newestLocations(reports), expiresAt: this.now().getTime() + CACHE_TTL_MS };
    } catch (error) {
      this.logger.error(`Find My locations unavailable: ${describeError(error)}`);
      snapshot = { locations: new Map(), expiresAt: this.now().getTime() + FAILURE_BACKOFF_MS };
    }
    this.snapshot = snapshot;
    return snapshot;
  }

  private newestLocations(reports: Map<string, string[]>): Map<number, Location> {
    const locations = new Map<number, Location>();
    for (const [trackerId, key] of this.keys) {
      let newest: Location | undefined;
      let skipped = 0;
      for (const payload of reports.get(key.hashedId) ?? []) {
        try {
          const location = decryptReport(payload, key.scalar);
          if (!newest || Date.parse(location.timestamp) > Date.parse(newest.timestamp)) newest = location;
        } catch {
          skipped++;
        }
      }
      if (skipped) this.logger.warn(`Skipped ${skipped} undecryptable Find My report(s) for tracker ${trackerId}.`);
      if (newest) locations.set(trackerId, newest);
    }
    return locations;
  }
}
