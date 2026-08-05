/**
 * utils/url.util.ts
 *
 * Utility functions for URL validation.
 */

/**
 * Validates if a given URL string points to an official Indian government website
 * (.gov.in or .nic.in).
 *
 * @param urlString - The URL to validate
 * @returns The original URL if valid, or null if invalid/malformed.
 */
export function getValidatedGovUrl(urlString: string | null | undefined): string | null {
  if (!urlString) return null;

  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();

    // Check if it ends with .gov.in or .nic.in
    if (hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in')) {
      return parsed.toString(); // Return normalized URL
    }

    return null;
  } catch (error) {
    // Malformed URL
    return null;
  }
}
