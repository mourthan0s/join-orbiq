import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/client";
import type { Venue, VenueLocation } from "@prisma/client";

/**
 * Venue read layer. Public venue data is cached for 5 minutes so QR bursts
 * (a busy Saturday night) hit the database once, not per scan. Personal data
 * is never cached — this layer only ever touches Venue/VenueLocation.
 */

const VENUE_CACHE_SECONDS = 300;

export type VenueWithLocations = Venue & { locations: VenueLocation[] };

export const getVenueBySlug = unstable_cache(
  async (slug: string): Promise<VenueWithLocations | null> => {
    return prisma.venue.findUnique({
      where: { slug },
      include: { locations: { where: { active: true }, orderBy: { slug: "asc" } } },
    });
  },
  ["venue-by-slug"],
  { revalidate: VENUE_CACHE_SECONDS, tags: ["venues"] }
);

/**
 * Resolves the effective location for a venue page:
 *  - explicit location slug (e.g. /nobell/galatsi) → that location
 *  - single-location venue → its only location (holds address + Google data)
 *  - otherwise null (multi-location venue visited without a location)
 */
export function resolveLocation(
  venue: VenueWithLocations,
  locationSlug?: string
): VenueLocation | null {
  if (locationSlug) {
    return venue.locations.find((l) => l.slug === locationSlug) ?? null;
  }
  return venue.locations.length === 1 ? venue.locations[0] : null;
}

/**
 * Legacy QR URLs from the previous PHP version (join.php?venue=<slug>) and
 * old short slugs keep working through this map. New venues never need it.
 */
export const LEGACY_SLUG_MAP: Record<string, string> = {
  deep: "deep-club",
  zacapa: "zakapa-athens",
  jasmine: "jasmine-skylounge",
  macao: "macao-beach-naxos",
  scarlet: "scarlet-athens",
  "nobell-galatsi": "nobell/galatsi",
  "nobell-marousi": "nobell/marousi",
};

export function legacyRedirectPath(oldSlug: string): string | null {
  const target = LEGACY_SLUG_MAP[oldSlug];
  return target ? `/${target}` : null;
}
