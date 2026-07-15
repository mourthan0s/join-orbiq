import { NextRequest, NextResponse } from "next/server";
import { legacyRedirectPath } from "@/features/venues/service";
import { sanitizeTrackingValue } from "@/lib/security/tracking";

/**
 * Backward compatibility for printed QR codes from the previous PHP version:
 *   /join.php?venue=deep → /deep-club
 *   /join.php?venue=nobell-galatsi → /nobell/galatsi
 * Permanent redirect so browsers cache the mapping.
 */
export function GET(request: NextRequest) {
  const url = request.nextUrl;
  const rawSlug = url.searchParams.get("venue") ?? "";
  const slug = rawSlug.trim().toLowerCase().slice(0, 100);

  // Old slugs map explicitly; anything else may already be a new slug.
  const target = legacyRedirectPath(slug) ?? (/^[a-z0-9-]+$/.test(slug) ? `/${slug}` : null);
  if (!target) {
    return NextResponse.redirect(new URL("/", url.origin), 308);
  }

  const qs = new URLSearchParams();
  for (const key of ["source", "campaign", "qr"] as const) {
    const value = sanitizeTrackingValue(url.searchParams.get(key));
    if (value) qs.set(key, value);
  }
  const destination = new URL(qs.size > 0 ? `${target}?${qs}` : target, url.origin);
  return NextResponse.redirect(destination, 308);
}
