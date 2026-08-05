/**
 * utils/search.util.ts
 *
 * Full-text search utility for government schemes.
 * Computes a relevance score for each scheme against a query string
 * by checking fields in priority order.
 *
 * Priority (highest → lowest):
 *   1. name exact word match
 *   2. schemeType match
 *   3. shortDescription match
 *   4. ministry / fullDescription match
 */

import { GovernmentScheme, SchemeSearchResult } from '../types/scheme.types';
import { getValidatedGovUrl } from './url.util';

/**
 * Score a single scheme against a query string.
 * Returns a score ≥ 0; schemes scoring 0 are excluded from results.
 */
function scoreScheme(scheme: GovernmentScheme, terms: string[]): number {
  let score = 0;

  // Pre-process fields for faster, case-insensitive partial matching
  const nameStr = scheme.name.toLowerCase();
  const shortDescStr = scheme.shortDescription.toLowerCase();
  const fullDescStr = scheme.fullDescription.toLowerCase();
  const ministryStr = scheme.ministry.toLowerCase();
  const stateStr = scheme.state.toLowerCase();
  
  const typeStr = scheme.schemeType.join(' ').toLowerCase(); // Matches: Technology, Insurance, Financial Support
  const benefitsStr = scheme.benefits.join(' ').toLowerCase();
  const eligibilityStr = scheme.eligibility.join(' ').toLowerCase();
  const cropStr = scheme.cropCategories.join(' ').toLowerCase();

  for (const term of terms) {
    const t = term.toLowerCase();

    // 1. Scheme Name
    if (nameStr === t) score += 20; // Exact match boost
    else if (nameStr.includes(t)) score += 10; // Partial match

    // 2. Scheme Type (Keyword/Category like Technology, Insurance)
    if (typeStr.includes(t)) score += 8;

    // 3. Ministry & State
    if (ministryStr.includes(t)) score += 6;
    if (stateStr.includes(t)) score += 6;

    // 4. Crop
    if (cropStr.includes(t)) score += 5;

    // 5. Benefits & Eligibility
    if (benefitsStr.includes(t)) score += 4;
    if (eligibilityStr.includes(t)) score += 3;

    // 6. Description
    if (shortDescStr.includes(t)) score += 3;
    if (fullDescStr.includes(t)) score += 2;
  }

  return score;
}

/**
 * Search schemes and return ranked results with a relevanceScore field.
 */
export function searchSchemes(
  schemes: GovernmentScheme[],
  query: string
): SchemeSearchResult[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1); // drop single-char tokens

  if (terms.length === 0) return [];

  const results: SchemeSearchResult[] = [];

  for (const scheme of schemes) {
    const relevanceScore = scoreScheme(scheme, terms);
    if (relevanceScore > 0) {
      results.push({
        id: scheme.id,
        name: scheme.name,
        shortDescription: scheme.shortDescription,
        schemeType: scheme.schemeType,
        ministry: scheme.ministry,
        relevanceScore,
        officialWebsite: getValidatedGovUrl(scheme.officialWebsite),
      });
    }
  }

  // Sort by descending relevance
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}
