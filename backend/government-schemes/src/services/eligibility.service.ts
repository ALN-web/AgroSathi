/**
 * services/eligibility.service.ts
 *
 * Rule-based Eligibility Engine for Government Schemes.
 *
 * Evaluates a FarmerProfile against every active scheme's eligibilityCriteria
 * and returns a ranked list of EligibilityResult objects.
 *
 * Scoring strategy:
 *   - Each criterion defined in a scheme counts as one "rule".
 *   - A matching rule adds weight to the eligibility percentage.
 *   - A failing mandatory-ish rule deducts weight.
 *   - eligibilityPercentage = (passed_rules / total_rules) * 100
 *   - Eligible:          100%
 *   - Possibly Eligible: 50% – 99%
 *   - Not Eligible:      < 50%
 *
 * No AI / Gemini is used. All matching is deterministic.
 */

import fs from 'fs';
import path from 'path';
import { GovernmentScheme, FarmerProfile, EligibilityResult } from '../types/scheme.types';

// ── Load data store ───────────────────────────────────────────────────────────
let _store: GovernmentScheme[] = [];

try {
  const dataPath = path.resolve(__dirname, '../../data/governmentSchemes.json');
  _store = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch {
  console.error('[EligibilityService] Failed to load schemes JSON.');
}

// ── Rule helpers ──────────────────────────────────────────────────────────────

/**
 * Case-insensitive check: does array contain the value?
 */
function arrIncludes(arr: string[], value: string): boolean {
  const v = value.toLowerCase();
  return arr.some((item) => item.toLowerCase() === v || item.toLowerCase() === 'all crops');
}

/**
 * Evaluate one scheme against a farmer profile.
 * Returns an EligibilityResult with a percentage and reasons list.
 */
function evaluateScheme(scheme: GovernmentScheme, profile: FarmerProfile): EligibilityResult {
  const criteria = scheme.eligibilityCriteria;
  const reasons: string[] = [];
  let totalRules = 0;
  let passedRules = 0;

  // Helper to record a rule check
  const check = (passes: boolean, failReason: string) => {
    totalRules++;
    if (passes) {
      passedRules++;
    } else {
      reasons.push(failReason);
    }
  };

  if (!criteria) {
    // No restrictions → open to all
    return buildResult(scheme, 100, []);
  }

  // ── Rule 1: State ─────────────────────────────────────────────────────────
  if (criteria.state && criteria.state.length > 0) {
    const stateMatches =
      criteria.state.some((s) => s.toLowerCase() === 'all india') ||
      criteria.state.some((s) => s.toLowerCase() === profile.state.toLowerCase());
    check(stateMatches, `This scheme is only available in: ${criteria.state.join(', ')}.`);
  }

  // ── Rule 2: Farm Size (min) ───────────────────────────────────────────────
  if (criteria.minLandSize !== undefined) {
    const passes = profile.farmSize >= criteria.minLandSize;
    check(passes, `Minimum farm size required is ${criteria.minLandSize} hectare(s). Your farm size: ${profile.farmSize} hectare(s).`);
  }

  // ── Rule 3: Farm Size (max) ───────────────────────────────────────────────
  if (criteria.maxLandSize !== undefined) {
    const passes = profile.farmSize <= criteria.maxLandSize;
    check(passes, `Maximum farm size allowed is ${criteria.maxLandSize} hectare(s). Your farm size: ${profile.farmSize} hectare(s).`);
  }

  // ── Rule 4: Farmer Type ───────────────────────────────────────────────────
  if (criteria.farmerType && criteria.farmerType.length > 0) {
    const passes = arrIncludes(criteria.farmerType, profile.farmerType);
    check(passes, `This scheme targets farmer types: ${criteria.farmerType.join(', ')}. Your type: ${profile.farmerType}.`);
  }

  // ── Rule 5: Crop ──────────────────────────────────────────────────────────
  if (criteria.cropCategories && criteria.cropCategories.length > 0) {
    const hasAllCrops = criteria.cropCategories.some((c) => c.toLowerCase() === 'all crops');
    const passes = hasAllCrops || arrIncludes(criteria.cropCategories, profile.crop);
    check(passes, `This scheme covers crops: ${criteria.cropCategories.join(', ')}. Your crop: ${profile.crop}.`);
  }

  // ── Rule 6: Annual Income ─────────────────────────────────────────────────
  if (criteria.maxIncome !== undefined) {
    const passes = profile.annualIncome <= criteria.maxIncome;
    check(passes, `Income limit for this scheme is ₹${criteria.maxIncome.toLocaleString('en-IN')}. Your income: ₹${profile.annualIncome.toLocaleString('en-IN')}.`);
  }

  // ── Rule 7: Gender ────────────────────────────────────────────────────────
  if (criteria.gender && criteria.gender.length > 0) {
    const passes = arrIncludes(criteria.gender, profile.gender);
    check(passes, `This scheme is specifically for: ${criteria.gender.join('/')} farmers.`);
  }

  // ── Rule 8: Minimum Age ───────────────────────────────────────────────────
  if (criteria.minAge !== undefined) {
    const passes = profile.age >= criteria.minAge;
    check(passes, `Minimum age required is ${criteria.minAge} years. Your age: ${profile.age}.`);
  }

  // ── Rule 9: Maximum Age ───────────────────────────────────────────────────
  if (criteria.maxAge !== undefined) {
    const passes = profile.age <= criteria.maxAge;
    check(passes, `Maximum age allowed is ${criteria.maxAge} years. Your age: ${profile.age}.`);
  }

  // ── Rule 10: Caste ────────────────────────────────────────────────────────
  if (criteria.caste && criteria.caste.length > 0) {
    const passes = arrIncludes(criteria.caste, profile.caste);
    check(passes, `This scheme targets caste categories: ${criteria.caste.join(', ')}. Your category: ${profile.caste}.`);
  }

  // ── Rule 11: Land Ownership ───────────────────────────────────────────────
  if (criteria.landOwnership && criteria.landOwnership.length > 0) {
    const passes = arrIncludes(criteria.landOwnership, profile.landOwnership);
    check(passes, `This scheme requires land ownership type: ${criteria.landOwnership.join(' / ')}. Your ownership: ${profile.landOwnership}.`);
  }

  // ── Calculate percentage ──────────────────────────────────────────────────
  const pct = totalRules === 0 ? 100 : Math.round((passedRules / totalRules) * 100);

  return buildResult(scheme, pct, reasons);
}

/**
 * Map a numeric percentage to an eligibility status bucket.
 */
function buildResult(scheme: GovernmentScheme, pct: number, reasons: string[]): EligibilityResult {
  let status: EligibilityResult['eligibilityStatus'];

  if (pct === 100) {
    status = 'Eligible';
  } else if (pct >= 50) {
    status = 'Possibly Eligible';
  } else {
    status = 'Not Eligible';
  }

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    eligibilityStatus: status,
    eligibilityPercentage: pct,
    reasons,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export const eligibilityService = {
  /**
   * Evaluate a farmer profile against all active schemes.
   * Returns results sorted: Eligible → Possibly Eligible → Not Eligible, then by % desc.
   */
  checkEligibility(profile: FarmerProfile): EligibilityResult[] {
    const activeSchemes = _store.filter((s) => s.status.toLowerCase() === 'active');

    const results = activeSchemes.map((scheme) => evaluateScheme(scheme, profile));

    // Sort: higher percentage first
    results.sort((a, b) => b.eligibilityPercentage - a.eligibilityPercentage);

    return results;
  },
};
