import type { VenueLocation } from "@prisma/client";
import type { VenueWithLocations } from "./service";
import { themeForVenue } from "@/lib/theme/variants";
import { safeExternalUrl } from "@/lib/urls/allowlist";
import type { Locale } from "@/lib/i18n/translations";
import type { TrackingParams } from "@/lib/security/tracking";

/**
 * Serializable, client-safe projection of a venue page. Everything the client
 * island receives passes through here: URLs are allowlist-validated
 * server-side, and no database entities or secrets cross the boundary.
 */

export type VenueViewModel = {
  venueId: string;
  venueSlug: string;
  venueName: string;
  locationId: string | null;
  locationSlug: string | null;
  locationLabel: string | null;
  monogram: string;
  logoUrl: string | null;
  /** True for opaque logos (e.g. baked black background) that need a framed
   *  card treatment; transparent logos render bare. From themeConfig. */
  logoFrame: boolean;
  /** Rendered logo height: md (default) or lg for detailed lockups. */
  logoSize: "md" | "lg";
  heroImageUrl: string | null;
  mobileHeroImageUrl: string | null;

  headline: string;
  supportingText: string | null;
  benefitText: string | null;

  atmosphereClass: string;
  displayClass: string;
  ctaClass: string;
  cssVars: Record<string, string>;

  // Validated external URLs (null when missing or failed validation)
  websiteUrl: string | null;
  instagramUrl: string | null;
  googleReviewUrl: string | null;
  /** Post-success destination: location redirect → venue default → website → instagram. */
  successRedirectUrl: string | null;

  reviewCtaMode: "HIDDEN" | "AFTER_SUCCESS" | "ALWAYS";
  autoRedirect: { enabled: boolean; delaySec: number };

  locale: Locale;
  tracking: TrackingParams;
};

function themeFlag(themeConfig: unknown, key: string): boolean {
  return (
    typeof themeConfig === "object" &&
    themeConfig !== null &&
    (themeConfig as Record<string, unknown>)[key] === true
  );
}

function monogramFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function buildVenueViewModel(opts: {
  venue: VenueWithLocations;
  location: VenueLocation | null;
  locale: Locale;
  tracking: TrackingParams;
}): VenueViewModel {
  const { venue, location, locale, tracking } = opts;
  const theme = themeForVenue(venue);

  const websiteUrl = safeExternalUrl(location?.websiteUrl ?? venue.websiteUrl);
  const instagramUrl = safeExternalUrl(location?.instagramUrl ?? venue.instagramUrl);
  const googleReviewUrl = safeExternalUrl(location?.googleReviewUrl);
  const successRedirectUrl =
    safeExternalUrl(location?.redirectUrl) ??
    safeExternalUrl(venue.defaultRedirectUrl) ??
    websiteUrl ??
    instagramUrl;

  const en = locale === "en";
  const headline =
    (en ? venue.headlineEn : venue.headline) ?? venue.headline ?? venue.name;
  const supportingText = (en ? venue.supportingTextEn : venue.supportingText) ?? venue.supportingText;
  const benefitText = (en ? venue.benefitTextEn : venue.benefitText) ?? venue.benefitText;

  // A review CTA without a verified URL hides itself regardless of mode.
  const reviewCtaMode = googleReviewUrl ? venue.reviewCtaMode : "HIDDEN";

  // Only show a location label when the venue actually has multiple physical
  // stores (so Nobell guests always see which store they're reviewing).
  const multiLocation = venue.locations.length > 1;

  return {
    venueId: venue.id,
    venueSlug: venue.slug,
    venueName: venue.name,
    locationId: location?.id ?? null,
    locationSlug: location?.slug ?? null,
    locationLabel: multiLocation && location ? location.name : null,
    monogram: monogramFor(venue.name),
    logoUrl: venue.logoUrl,
    logoFrame: themeFlag(venue.themeConfig, "logoFrame"),
    logoSize:
      (typeof venue.themeConfig === "object" &&
        venue.themeConfig !== null &&
        (venue.themeConfig as Record<string, unknown>).logoSize) === "lg"
        ? "lg"
        : "md",
    heroImageUrl: location?.heroImageUrl ?? venue.heroImageUrl,
    mobileHeroImageUrl: location?.mobileHeroImageUrl ?? venue.mobileHeroImageUrl,

    headline,
    supportingText: supportingText ?? null,
    benefitText: benefitText ?? null,

    atmosphereClass: theme.preset.atmosphereClass,
    displayClass: theme.preset.displayClass,
    ctaClass: theme.preset.ctaClass,
    cssVars: theme.cssVars,

    websiteUrl,
    instagramUrl,
    googleReviewUrl,
    successRedirectUrl,

    reviewCtaMode,
    autoRedirect: {
      enabled: venue.autoRedirectEnabled && Boolean(successRedirectUrl),
      delaySec: venue.autoRedirectDelaySec,
    },

    locale,
    tracking,
  };
}
