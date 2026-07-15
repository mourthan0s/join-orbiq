const FALLBACK_APP_URL = "https://join.orbi-q.com";

/**
 * Resolves the app's own public origin for metadataBase and similar uses.
 *
 * Never throws: hosting platforms sometimes store an env var as a defined
 * empty string (not unset) or with stray whitespace, and `new URL(...)`
 * throws synchronously on those — which crashes the whole server at module
 * load, before anything can be served. This runs at import time in
 * app/layout.tsx, so it must be defensive.
 */
export function getAppUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // fall through to default
    }
  }
  return new URL(FALLBACK_APP_URL);
}
