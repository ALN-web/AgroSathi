/**
 * adapters/api.adapter.ts
 *
 * Government API Adapter — PLACEHOLDER.
 *
 * Future implementation will:
 *  1. Authenticate with the official data.gov.in API
 *  2. Fetch paginated scheme records from ministry endpoints
 *  3. Map API response fields to the GovernmentScheme domain model
 *  4. Handle rate limiting, retries, and partial updates
 *
 * To activate: replace the placeholder body below and
 * set SYNC_ADAPTER=api in .env.
 */

import { GovernmentScheme, ISyncAdapter } from '../../types/scheme.types';

export class GovernmentApiAdapter implements ISyncAdapter {
  public readonly name = 'Government API';
  public readonly source: string;

  constructor(endpointUrl?: string) {
    this.source = endpointUrl ?? process.env.GOV_API_ENDPOINT ?? 'https://api.data.gov.in/resource/placeholder';
  }

  public async load(): Promise<GovernmentScheme[]> {
    // ── PLACEHOLDER ───────────────────────────────────────────────────────────
    // TODO: Implement live API fetching.
    //
    // Example future implementation:
    //   const response = await fetch(this.source, {
    //     headers: { 'api-key': process.env.GOV_API_KEY! }
    //   });
    //   const json = await response.json();
    //   return mapApiResponseToSchemes(json.records);
    //
    // ─────────────────────────────────────────────────────────────────────────

    throw new Error(
      '[GovernmentApiAdapter] Not yet implemented. ' +
      'Set SYNC_ADAPTER=json in .env to use the JSON file source.'
    );
  }
}
