/**
 * Sanitization for QR/campaign tracking query parameters
 * (?source=table&campaign=summer-2026&qr=table-14).
 *
 * Tracking values are attribution labels only. They must never influence
 * redirect destinations, review URLs or any rendered HTML.
 */

const TRACKING_MAX_LENGTH = 64;
const SAFE_PATTERN = /^[a-zA-Z0-9._-]+$/;

/** Returns a sanitized tracking token or null if the value is unusable. */
export function sanitizeTrackingValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, TRACKING_MAX_LENGTH);
  if (!trimmed || !SAFE_PATTERN.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

export type TrackingParams = {
  source: string | null;
  campaign: string | null;
  qr: string | null;
};

export function parseTrackingParams(
  searchParams: Record<string, string | string[] | undefined>
): TrackingParams {
  const pick = (key: string) => {
    const raw = searchParams[key];
    return sanitizeTrackingValue(Array.isArray(raw) ? raw[0] : raw);
  };
  return { source: pick("source"), campaign: pick("campaign"), qr: pick("qr") };
}
