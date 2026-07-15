/**
 * External URL validation.
 *
 * Every outbound link the platform renders (Google review, website,
 * Instagram, redirect destinations) must come from trusted venue/location
 * data in the database AND pass this allowlist. URLs are never taken from
 * query parameters or any other client input.
 */

const ALLOWED_HOSTS = new Set([
  "google.com",
  "maps.google.com",
  "search.google.com",
  "goo.gl",
  "maps.app.goo.gl",
  "g.page",
  "g.co",
  "instagram.com",
  "orbi-q.com",
  // Official venue domains
  "zakapaathens.gr",
  "jasmineskylounge.gr",
  "deepclub.gr",
  "macaobeachnaxos.com",
  "scarletathens.gr",
  "nobell.gr",
]);

function hostAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (ALLOWED_HOSTS.has(host)) return true;
  // Allow subdomains of allowlisted hosts (www.zakapaathens.gr, g.page/r/…)
  for (const allowed of ALLOWED_HOSTS) {
    if (host.endsWith(`.${allowed}`)) return true;
  }
  return false;
}

/**
 * Returns a normalized, safe https URL string, or null when the value is
 * missing, malformed, non-https or not on the allowlist.
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!hostAllowed(url.hostname)) return null;
  // Strip credentials that could disguise the real destination.
  url.username = "";
  url.password = "";
  return url.toString();
}

/** Assert-style variant for seed/write paths: throws instead of hiding bad data. */
export function assertSafeExternalUrl(value: string): string {
  const safe = safeExternalUrl(value);
  if (!safe) throw new Error(`URL failed allowlist validation: ${value}`);
  return safe;
}
