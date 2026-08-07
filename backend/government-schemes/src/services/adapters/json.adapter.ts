/**
 * adapters/json.adapter.ts
 *
 * JSON File Adapter — the current and default data source.
 * Reads governmentSchemes.json from disk at every sync call.
 * Implements the ISyncAdapter contract.
 */

import fs from 'fs';
import path from 'path';
import { GovernmentScheme, ISyncAdapter } from '../../types/scheme.types';

export class JsonFileAdapter implements ISyncAdapter {
  public readonly name = 'JSON File';
  public readonly source: string;

  constructor(filePath?: string) {
    this.source = filePath ?? path.resolve(__dirname, '../../../data/governmentSchemes.json');
  }

  public async load(): Promise<GovernmentScheme[]> {
    const raw = fs.readFileSync(this.source, 'utf-8');
    const data = JSON.parse(raw) as GovernmentScheme[];

    if (!Array.isArray(data)) {
      throw new Error(`[JsonFileAdapter] Expected an array but got: ${typeof data}`);
    }

    return data;
  }
}
