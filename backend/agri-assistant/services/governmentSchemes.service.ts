/**
 * governmentSchemes.service.ts
 *
 * Implements grounded Government Schemes integration for the AgroSaathi AI Assistant.
 *
 * Flow:
 *   1. User message arrives with intent: 'government_schemes'
 *   2. This service searches governmentSchemes.json using keyword extraction
 *   3. Retrieved schemes (name, benefits, eligibility, officialWebsite) are injected as context
 *   4. Gemini receives this factual grounding and summarizes — never fabricates
 *   5. Response is returned to the user
 *
 * Gemini is NEVER allowed to invent scheme data. It only explains real data retrieved here.
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { geminiService } from './gemini.service';

// ── Scheme shape (subset of the full JSON schema) ────────────────────────────

interface SchemeRecord {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  schemeType: string[];
  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[];
  officialWebsite: string | null;
  ministry: string;
  state: string;
  cropCategories: string[];
  financialBenefit: string;
  applicationMode: string;
  status: string;
}

// ── Load JSON database once at startup ───────────────────────────────────────

let _schemeStore: SchemeRecord[] = [];

try {
  const dataPath = path.resolve(
    __dirname,
    '../../government-schemes/data/governmentSchemes.json'
  );
  _schemeStore = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  logger.info(`[GovernmentSchemesService] Loaded ${_schemeStore.length} schemes from JSON database.`);
} catch (err) {
  logger.error('[GovernmentSchemesService] Failed to load governmentSchemes.json:', err);
}

// ── Keyword extraction ────────────────────────────────────────────────────────

/**
 * Extract meaningful search terms from a user message.
 * Strips stop-words and returns unique lowercase tokens.
 */
function extractKeywords(message: string): string[] {
  const STOP_WORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'for', 'in', 'on', 'at',
    'to', 'of', 'and', 'or', 'but', 'not', 'with', 'by', 'from', 'up',
    'about', 'me', 'what', 'which', 'who', 'how', 'when', 'where', 'why',
    'tell', 'give', 'show', 'list', 'any', 'all', 'scheme', 'schemes',
    'government', 'available', 'there', 'that', 'this', 'my', 'i',
  ]);

  return [...new Set(
    message
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
  )];
}

// ── Scoring / search ──────────────────────────────────────────────────────────

interface ScoredScheme {
  scheme: SchemeRecord;
  score: number;
}

/**
 * Score each active scheme against the extracted keyword list.
 * Returns top-N matching schemes sorted by score descending.
 */
function searchSchemes(keywords: string[], topN = 4): SchemeRecord[] {
  if (keywords.length === 0) return _schemeStore.filter(s => s.status === 'Active').slice(0, topN);

  const scored: ScoredScheme[] = _schemeStore
    .filter((s) => s.status === 'Active')
    .map((scheme) => {
      let score = 0;
      const searchable = [
        scheme.name,
        scheme.shortDescription,
        scheme.fullDescription,
        scheme.ministry,
        scheme.state,
        scheme.financialBenefit,
        ...scheme.schemeType,
        ...scheme.benefits,
        ...scheme.eligibility,
        ...scheme.cropCategories,
      ].join(' ').toLowerCase();

      for (const kw of keywords) {
        // Name match is highest priority
        if (scheme.name.toLowerCase().includes(kw)) score += 10;
        else if (searchable.includes(kw)) score += 3;

        // Special boosts for exact type/crop match
        if (scheme.schemeType.some((t) => t.toLowerCase().includes(kw))) score += 5;
        if (scheme.cropCategories.some((c) => c.toLowerCase() === kw || c.toLowerCase() === 'all crops')) score += 4;
        if (scheme.state.toLowerCase().includes(kw)) score += 6;
        if (scheme.ministry.toLowerCase().includes(kw)) score += 4;
      }

      return { scheme, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // If no keyword matched anything, return general top active schemes
  if (scored.length === 0) {
    return _schemeStore.filter(s => s.status === 'Active').slice(0, topN);
  }

  return scored.slice(0, topN).map((s) => s.scheme);
}

// ── Context builder ───────────────────────────────────────────────────────────

/**
 * Format retrieved schemes into a structured context block for Gemini.
 * Gemini must only summarize this data — not invent any additional information.
 */
function buildSchemeContext(schemes: SchemeRecord[]): string {
  if (schemes.length === 0) {
    return 'No matching government schemes found in the database.';
  }

  return schemes.map((s, i) => `
### Scheme ${i + 1}: ${s.name}
- **Type**: ${s.schemeType.join(', ')}
- **Ministry**: ${s.ministry}
- **State**: ${s.state}
- **Short Description**: ${s.shortDescription}
- **Key Benefits**:
${s.benefits.map(b => `  * ${b}`).join('\n')}
- **Eligibility**:
${s.eligibility.map(e => `  * ${e}`).join('\n')}
- **Financial Benefit**: ${s.financialBenefit}
- **Application Mode**: ${s.applicationMode}
- **Official Website**: ${s.officialWebsite ?? 'Not available'}
`).join('\n---\n');
}

// ── Service class ─────────────────────────────────────────────────────────────

export class GovernmentSchemesService {
  /**
   * Handle a government schemes query.
   *
   * 1. Extract keywords from the user message.
   * 2. Search the local JSON database for matching schemes.
   * 3. Inject the real scheme data as context into Gemini's prompt.
   * 4. Return Gemini's grounded, factual summary.
   */
  public async handleSchemesQuery(message: string, conversationId: string): Promise<string> {
    logger.info('[GovernmentSchemesService] Processing schemes query', { message });

    // Step 1: Extract keywords from user message
    const keywords = extractKeywords(message);
    logger.info('[GovernmentSchemesService] Keywords extracted', { keywords });

    // Step 2: Search the JSON database
    const matchedSchemes = searchSchemes(keywords, 4);
    logger.info(`[GovernmentSchemesService] Found ${matchedSchemes.length} matching scheme(s)`);

    // Step 3: Build grounding context
    const schemeContext = buildSchemeContext(matchedSchemes);

    // Step 4: Compose a grounded prompt for Gemini
    // Gemini gets REAL data — it must not invent or add any new information.
    const groundedPrompt = `
The user asked: "${message}"

IMPORTANT: Answer using ONLY the government scheme data provided below. 
Do NOT invent or add any information not present in this data.
Do NOT fabricate scheme names, eligibility rules, or financial figures.
If the information is not in the data below, say so clearly.

## Retrieved Government Schemes from AgroSaathi Database:

${schemeContext}

Based solely on the data above, provide a helpful, concise summary for the user. 
Include the official website links where available so the user can apply directly.
`.trim();

    // Step 5: Get Gemini's grounded response
    const geminiResponse = await geminiService.getChatResponse(
      conversationId,
      groundedPrompt,
      'government_schemes'
    );

    return geminiResponse.reply;
  }
}

export const governmentSchemesService = new GovernmentSchemesService();
