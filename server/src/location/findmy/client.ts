import type { FindMyConfig } from '../../config.js';

export const FINDMY_FETCH_URL = 'https://gateway.icloud.com/acsnservice/fetch';
const SEARCH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 15_000;

/**
 * A failed anisette or Find My request. Messages are fixed templates plus status codes and error
 * class names: they never contain URLs, headers, bodies or credentials, so they are safe to log.
 */
export class FindMyRequestError extends Error {
  override name = 'FindMyRequestError';
}

export interface FindMyClientOptions extends FindMyConfig {
  fetch?: typeof fetch;
  now?: () => Date;
}

/** Fetches encrypted location reports from Apple's Find My report service. */
export class FindMyClient {
  private readonly options: FindMyConfig;
  private readonly fetch: typeof fetch;
  private readonly now: () => Date;

  constructor({ fetch: fetchFn = globalThis.fetch, now = () => new Date(), ...options }: FindMyClientOptions) {
    this.options = options;
    this.fetch = fetchFn;
    this.now = now;
  }

  /** Reports from the past 7 days for all `hashedIds`, in one request, as base64 payloads grouped by id. */
  async fetchReports(hashedIds: string[]): Promise<Map<string, string[]>> {
    const anisette = await this.anisetteHeaders();
    const endDate = this.now().getTime();
    const auth = Buffer.from(`${this.options.dsid}:${this.options.searchPartyToken}`).toString('base64');

    const body = await this.request('Find My', FINDMY_FETCH_URL, {
      method: 'POST',
      headers: { ...anisette, Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ search: [{ startDate: endDate - SEARCH_WINDOW_MS, endDate, ids: hashedIds }] }),
    });

    const results = (body as { results?: unknown } | null)?.results;
    if (!Array.isArray(results)) throw new FindMyRequestError('Find My response was malformed');
    const reports = new Map<string, string[]>();
    for (const result of results) {
      const { id, payload } = (result ?? {}) as { id?: unknown; payload?: unknown };
      if (typeof id !== 'string' || typeof payload !== 'string') continue;
      reports.set(id, [...(reports.get(id) ?? []), payload]);
    }
    return reports;
  }

  /** Anisette headers for one request: only the `X-Apple-*` and `X-Mme-*` keys are forwarded. */
  private async anisetteHeaders(): Promise<Record<string, string>> {
    const body = await this.request('Anisette', this.options.anisetteUrl, { method: 'GET' });
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new FindMyRequestError('Anisette response was malformed');
    }
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      if (/^x-(apple|mme)-/i.test(key) && (typeof value === 'string' || typeof value === 'number')) {
        headers[key] = String(value);
      }
    }
    return headers;
  }

  /** Performs a request and parses its JSON body, turning every failure into a safe `FindMyRequestError`. */
  private async request(label: string, url: string, init: RequestInit): Promise<unknown> {
    let response: Response;
    try {
      response = await this.fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      const kind = /^\w+$/.test(name) && name !== 'Error' ? ` (${name})` : '';
      throw new FindMyRequestError(`${label} request failed${kind}`);
    }
    if (!response.ok) throw new FindMyRequestError(`${label} request failed with status ${response.status}`);
    try {
      return await response.json();
    } catch {
      throw new FindMyRequestError(`${label} response was not valid JSON`);
    }
  }
}
