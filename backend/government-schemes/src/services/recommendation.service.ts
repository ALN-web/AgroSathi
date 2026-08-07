/**
 * services/recommendation.service.ts
 *
 * Provides a similarity-based recommendation engine to find related government schemes.
 */

import { RelatedScheme, GovernmentScheme } from '../types/scheme.types';
import { schemesService } from './schemes.service';
import { getValidatedGovUrl } from '../utils/url.util';

/**
 * Calculate Jaccard similarity-like score for string arrays.
 */
function calculateArrayOverlap(arr1: string[], arr2: string[]): number {
  if (!arr1.length || !arr2.length) return 0;
  
  const set1 = new Set(arr1.map(i => i.toLowerCase()));
  let matchCount = 0;

  for (const item of arr2) {
    if (set1.has(item.toLowerCase())) {
      matchCount++;
    }
  }

  // Weight by number of matches
  return matchCount;
}

export const recommendationService = {
  /**
   * Find the top 5 most similar schemes to a given target scheme.
   * Compares Category, Crop, State, Ministry, etc.
   */
  getRelatedSchemes(targetId: string): RelatedScheme[] {
    const targetScheme = schemesService.getSchemeById(targetId);
    if (!targetScheme) {
      throw new Error(`Scheme with id "${targetId}" not found.`);
    }

    // Get all schemes but NOT the target itself
    // Re-fetch raw data or use existing service. 
    // We can fetch all and filter since the dataset is small.
    const allSchemesResponse = schemesService.getAllSchemes({ limit: 1000 });
    const allSummaries = allSchemesResponse.data;

    // To do deep matching, we actually need the full scheme data, so let's get it.
    // Assuming `getAllSchemes` only returns summaries, we can just use `getSchemeById` for each, 
    // but a cleaner way is just accessing the private store if we were inside schemes.service.
    // Instead, we can fetch all full schemes by mapping their IDs.
    const allFullSchemes = allSummaries
      .map(s => schemesService.getSchemeById(s.id))
      .filter((s): s is GovernmentScheme => s !== null && s.id !== targetId && s.status.toLowerCase() === 'active');

    const scoredSchemes: RelatedScheme[] = [];

    for (const scheme of allFullSchemes) {
      let score = 0;

      // 1. Ministry Match (Strong indicator of related domain)
      if (scheme.ministry.toLowerCase() === targetScheme.ministry.toLowerCase()) {
        score += 3;
      }

      // 2. State Match
      if (scheme.state.toLowerCase() === targetScheme.state.toLowerCase()) {
        score += 2;
      } else if (scheme.state.toLowerCase() === 'all india' || targetScheme.state.toLowerCase() === 'all india') {
        score += 1;
      }

      // 3. Scheme Type (Category) Match
      score += calculateArrayOverlap(scheme.schemeType, targetScheme.schemeType) * 2;

      // 4. Crop Overlap
      score += calculateArrayOverlap(scheme.cropCategories, targetScheme.cropCategories) * 2;

      // 5. Keyword Overlap (Benefits / Tags logic)
      const targetStr = [
        ...targetScheme.benefits,
        targetScheme.financialBenefit,
        ...targetScheme.eligibility
      ].join(' ').toLowerCase();

      const candidateStr = [
        ...scheme.benefits,
        scheme.financialBenefit,
        ...scheme.eligibility
      ].join(' ').toLowerCase();

      const keywords = ['insurance', 'subsidy', 'loan', 'credit', 'organic', 'technology', 'women', 'irrigation', 'water', 'equipment'];
      
      for (const kw of keywords) {
        if (targetStr.includes(kw) && candidateStr.includes(kw)) {
          score += 2; // Both share a major thematic keyword
        }
      }

      scoredSchemes.push({
        id: scheme.id,
        name: scheme.name,
        shortDescription: scheme.shortDescription,
        schemeType: scheme.schemeType,
        ministry: scheme.ministry,
        officialWebsite: getValidatedGovUrl(scheme.officialWebsite),
        similarityScore: score,
      });
    }

    // Sort descending by score, take top 5
    return scoredSchemes
      .filter(s => s.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);
  },
};
