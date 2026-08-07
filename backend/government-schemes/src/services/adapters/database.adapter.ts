/**
 * adapters/database.adapter.ts
 *
 * Database Adapter — PLACEHOLDER.
 *
 * Future implementation will:
 *  1. Connect to a PostgreSQL / MongoDB database
 *  2. Query the schemes table/collection
 *  3. Map database rows/documents to the GovernmentScheme domain model
 *  4. Handle connection pooling and query errors
 *
 * To activate: replace the placeholder body below and
 * set SYNC_ADAPTER=database in .env.
 */

import { GovernmentScheme, ISyncAdapter } from '../../types/scheme.types';

export class DatabaseAdapter implements ISyncAdapter {
  public readonly name = 'Database';
  public readonly source: string;

  constructor(connectionString?: string) {
    this.source = connectionString ?? process.env.DATABASE_URL ?? 'postgresql://localhost:5432/agrosathi';
  }

  public async load(): Promise<GovernmentScheme[]> {
    // ── PLACEHOLDER ───────────────────────────────────────────────────────────
    // TODO: Implement database query.
    //
    // Example future implementation using Prisma or pg:
    //   const client = new PrismaClient();
    //   const rows = await client.governmentScheme.findMany({ where: { status: 'Active' } });
    //   return rows.map(mapDbRowToScheme);
    //
    // ─────────────────────────────────────────────────────────────────────────

    throw new Error(
      '[DatabaseAdapter] Not yet implemented. ' +
      'Set SYNC_ADAPTER=json in .env to use the JSON file source.'
    );
  }
}
