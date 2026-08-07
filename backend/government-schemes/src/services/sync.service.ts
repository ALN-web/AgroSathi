/**
 * services/sync.service.ts
 *
 * The single source of truth for Government Schemes data.
 *
 * Architecture:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │                     SyncService                         │
 *   │                                                         │
 *   │  ┌──────────────┐  ┌──────────┐  ┌───┐  ┌──────────┐  │
 *   │  │ JsonAdapter  │  │ ApiAdapt │  │CSV│  │ Database │  │
 *   │  └──────────────┘  └──────────┘  └───┘  └──────────┘  │
 *   │          ↑ (active adapter is selected via .env)        │
 *   └──────────────────────────────────────────────────────── ┘
 *              ↓
 *       schemes.service.ts (reads getStore())
 *              ↓
 *       Controllers → HTTP Responses
 *
 * Switching data sources:
 *   Set SYNC_ADAPTER=json | api | csv | database in .env
 *   No other code changes needed.
 *
 * Manual trigger:
 *   POST /api/government-schemes/sync/trigger
 */

import { GovernmentScheme, ISyncAdapter, SyncInfo, SyncResult } from '../types/scheme.types';
import { JsonFileAdapter } from './adapters/json.adapter';
import { GovernmentApiAdapter } from './adapters/api.adapter';
import { CsvImportAdapter } from './adapters/csv.adapter';
import { DatabaseAdapter } from './adapters/database.adapter';

// ── Adapter Factory ──────────────────────────────────────────────────────────

/**
 * Builds the appropriate adapter based on the SYNC_ADAPTER environment variable.
 * Defaults to JSON file adapter.
 */
function buildAdapter(): ISyncAdapter {
  const adapterType = (process.env.SYNC_ADAPTER ?? 'json').toLowerCase();

  switch (adapterType) {
    case 'api':
      return new GovernmentApiAdapter();
    case 'csv':
      return new CsvImportAdapter();
    case 'database':
      return new DatabaseAdapter();
    case 'json':
    default:
      return new JsonFileAdapter();
  }
}

// ── Sync Service ─────────────────────────────────────────────────────────────

class SyncService {
  private adapter: ISyncAdapter;
  private _store: GovernmentScheme[] = [];
  private _lastSyncAt: string | null = null;
  private _status: SyncInfo['status'] = 'idle';
  private _lastError?: string;

  constructor() {
    this.adapter = buildAdapter();
    // Load synchronously at startup using the JSON adapter's sync-friendly wrapper
    this.loadAtStartup();
  }

  /**
   * Startup-time synchronous load (JSON only).
   * Subsequent refreshes use the async `sync()` method.
   */
  private loadAtStartup(): void {
    try {
      // For startup we directly instantiate a JSON adapter to avoid async complexity.
      // The configured adapter may be swapped in after startup via sync().
      const jsonAdapter = new JsonFileAdapter();
      import('fs').then((fs) => {
        try {
          const raw = require('fs').readFileSync(jsonAdapter.source, 'utf-8');
          this._store = JSON.parse(raw);
          this._status = 'ready';
          this._lastSyncAt = new Date().toISOString();
          console.info(`[SyncService] Loaded ${this._store.length} schemes via ${jsonAdapter.name} at startup.`);
        } catch (err: any) {
          this._status = 'error';
          this._lastError = err.message;
          console.error('[SyncService] Startup load failed:', err);
        }
      });
    } catch (err: any) {
      this._status = 'error';
      this._lastError = err.message;
    }
  }

  /**
   * Returns the current in-memory store of schemes.
   * All services MUST use this instead of directly reading files.
   */
  public getStore(): GovernmentScheme[] {
    return this._store;
  }

  /**
   * Triggers an async re-sync using the configured adapter.
   * Safe to call at runtime (e.g., via the /sync/trigger endpoint).
   */
  public async sync(): Promise<SyncResult> {
    if (this._status === 'syncing') {
      return {
        success: false,
        count: this._store.length,
        source: this.adapter.source,
        syncedAt: this._lastSyncAt ?? '',
        error: 'A sync is already in progress.',
      };
    }

    this._status = 'syncing';
    console.info(`[SyncService] Starting sync via adapter: ${this.adapter.name}`);

    try {
      const freshData = await this.adapter.load();
      this._store = freshData;
      this._lastSyncAt = new Date().toISOString();
      this._status = 'ready';
      this._lastError = undefined;

      console.info(`[SyncService] Sync complete. ${freshData.length} schemes loaded from ${this.adapter.source}.`);

      return {
        success: true,
        count: freshData.length,
        source: this.adapter.source,
        syncedAt: this._lastSyncAt,
      };
    } catch (err: any) {
      this._status = 'error';
      this._lastError = err.message;
      console.error('[SyncService] Sync failed:', err);

      return {
        success: false,
        count: this._store.length,
        source: this.adapter.source,
        syncedAt: this._lastSyncAt ?? '',
        error: err.message,
      };
    }
  }

  /**
   * Returns metadata about the last sync operation.
   */
  public getSyncInfo(): SyncInfo {
    return {
      lastSyncAt: this._lastSyncAt,
      source: this.adapter.source,
      totalRecords: this._store.length,
      status: this._status,
      ...(this._lastError ? { lastError: this._lastError } : {}),
    };
  }

  /**
   * Swaps the active adapter at runtime.
   * Call sync() afterward to reload data with the new adapter.
   */
  public setAdapter(adapter: ISyncAdapter): void {
    console.info(`[SyncService] Switching adapter from "${this.adapter.name}" to "${adapter.name}"`);
    this.adapter = adapter;
  }

  /**
   * Returns the name of the currently active adapter.
   */
  public getAdapterName(): string {
    return this.adapter.name;
  }
}

// Singleton instance — used by all other services
export const syncService = new SyncService();
