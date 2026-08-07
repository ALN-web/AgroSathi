/**
 * adapters/csv.adapter.ts
 *
 * CSV Import Adapter — PLACEHOLDER.
 *
 * Future implementation will:
 *  1. Read a CSV file from a configured path
 *  2. Parse each row into a GovernmentScheme object
 *  3. Validate required fields before returning
 *
 * To activate: replace the placeholder body below and
 * set SYNC_ADAPTER=csv in .env.
 */

import { GovernmentScheme, ISyncAdapter } from '../../types/scheme.types';

export class CsvImportAdapter implements ISyncAdapter {
  public readonly name = 'CSV Import';
  public readonly source: string;

  constructor(filePath?: string) {
    this.source = filePath ?? process.env.CSV_IMPORT_PATH ?? './data/schemes.csv';
  }

  public async load(): Promise<GovernmentScheme[]> {
    // ── PLACEHOLDER ───────────────────────────────────────────────────────────
    // TODO: Implement CSV parsing.
    //
    // Example future implementation using 'csv-parse':
    //   const content = fs.readFileSync(this.source, 'utf-8');
    //   const records = await parse(content, { columns: true });
    //   return records.map(mapCsvRowToScheme);
    //
    // ─────────────────────────────────────────────────────────────────────────

    throw new Error(
      '[CsvImportAdapter] Not yet implemented. ' +
      'Set SYNC_ADAPTER=json in .env to use the JSON file source.'
    );
  }
}
