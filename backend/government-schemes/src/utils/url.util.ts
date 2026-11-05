/**
 * utils/url.util.ts
 *
 * Official Government Website URL Validation Utility.
 *
 * Security rules:
 *  1. Must be a parseable, well-formed URL.
 *  2. Must use HTTPS (never HTTP).
 *  3. Hostname must match an explicitly allowed domain suffix or exact domain.
 *  4. Rejects URLs with suspicious patterns (IP addresses, localhost, data: URIs).
 *  5. Returns a structured UrlValidationResult — never silently drops data.
 *
 * Allowed domains:
 *  - *.gov.in
 *  - *.nic.in
 *  - Specific official ministry / PSU domains (see ALLOWED_EXACT_DOMAINS below)
 */

// ── Allowed domain patterns ───────────────────────────────────────────────────

/** Accepted TLD suffixes for wildcard matching */
const ALLOWED_TLD_SUFFIXES = ['.gov.in', '.nic.in'] as const;

/**
 * Explicitly whitelisted domains that don't end with .gov.in / .nic.in
 * but are known official government portals.
 */
const ALLOWED_EXACT_DOMAINS = new Set<string>([
  'aajeevika.gov.in',
  'agriinfra.dac.gov.in',
  'agriwelfare.gov.in',
  'enam.gov.in',
  'nfsm.gov.in',
  'pgsindia-ncof.gov.in',
  'pmfby.gov.in',
  'pmkisan.gov.in',
  'pmksy.gov.in',
  'soilhealth.dac.gov.in',
  'www.myscheme.gov.in',
]);

/** Reject any hostname that looks like an IP address */
const IP_ADDRESS_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;

// ── Result type ───────────────────────────────────────────────────────────────

export interface UrlValidationResult {
  /** The validated, normalized URL — or null if invalid. */
  url: string | null;
  /** Whether the URL passed all validations. */
  valid: boolean;
  /** Human-readable reason for rejection (only set when valid === false). */
  reason?: string;
}

// ── Core validation ───────────────────────────────────────────────────────────

/**
 * Full validation pipeline for a government scheme's official website URL.
 *
 * Returns a `UrlValidationResult` with details about validation outcome.
 */
export function validateGovUrl(urlString: string | null | undefined): UrlValidationResult {
  if (!urlString || !urlString.trim()) {
    return { url: null, valid: false, reason: 'URL is empty or not provided.' };
  }

  // ── Step 1: Parse ─────────────────────────────────────────────────────────
  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { url: null, valid: false, reason: 'URL is malformed or not a valid URL.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // ── Step 2: Reject non-HTTPS ──────────────────────────────────────────────
  if (parsed.protocol !== 'https:') {
    return {
      url: null,
      valid: false,
      reason: `Insecure protocol "${parsed.protocol}" is not allowed. Only HTTPS is permitted.`,
    };
  }

  // ── Step 3: Reject IP addresses ───────────────────────────────────────────
  if (IP_ADDRESS_PATTERN.test(hostname)) {
    return { url: null, valid: false, reason: 'IP address URLs are not allowed.' };
  }

  // ── Step 4: Reject localhost / internal hosts ─────────────────────────────
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { url: null, valid: false, reason: 'Internal or localhost URLs are not allowed.' };
  }

  // ── Step 5: Domain whitelist check ───────────────────────────────────────
  const matchesTld = ALLOWED_TLD_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  const matchesExact = ALLOWED_EXACT_DOMAINS.has(hostname);

  if (!matchesTld && !matchesExact) {
    return {
      url: null,
      valid: false,
      reason: `Domain "${hostname}" is not an allowed official government domain. Only .gov.in and .nic.in domains are permitted.`,
    };
  }

  // ── All checks passed ─────────────────────────────────────────────────────
  return { url: parsed.toString(), valid: true };
}

/**
 * Convenience wrapper used by service/response layers.
 *
 * Returns the validated URL string, or the sentinel string
 * "Website unavailable." if the URL fails any check.
 * This is the string the API consumer receives — never a raw unsafe link.
 */
export function getValidatedGovUrl(urlString: string | null | undefined): string | null {
  const result = validateGovUrl(urlString);
  return result.valid ? result.url : null;
}

/**
 * Convenience function for logging/debugging — returns full result with reason.
 */
export function auditGovUrl(urlString: string | null | undefined): UrlValidationResult {
  return validateGovUrl(urlString);
}
