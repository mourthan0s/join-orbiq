import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVenueBySlug, resolveLocation } from "@/features/venues/service";
import { buildVenueViewModel } from "@/features/venues/view-model";
import { parseTrackingParams } from "@/lib/security/tracking";
import { resolveLocale } from "@/lib/i18n/translations";
import { VenuePage } from "@/components/venue/VenuePage";
import { FallbackPage } from "@/components/shared/FallbackPage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ venue: string; location: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venue: venueSlug, location: locationSlug } = await params;
  const venue = await getVenueBySlug(venueSlug).catch(() => null);
  if (!venue) return { title: "ORBIQ Join" };
  const location = resolveLocation(venue, locationSlug);
  const name = location ? `${venue.name} — ${location.name}` : venue.name;
  return { title: `${name} — Join the List` };
}

export default async function VenueLocationRoute({ params, searchParams }: Props) {
  const { venue: venueSlug, location: locationSlug } = await params;
  const sp = await searchParams;

  const venue = await getVenueBySlug(venueSlug);
  if (!venue) notFound();

  const location = resolveLocation(venue, locationSlug);
  if (!location) notFound();

  if (!venue.active || !location.active) {
    return (
      <FallbackPage
        title="Οι εγγραφές είναι προσωρινά κλειστές"
        body={`Οι εγγραφές για ${location.name} δεν είναι διαθέσιμες αυτή τη στιγμή.`}
      />
    );
  }

  const rawLang = Array.isArray(sp.lang) ? sp.lang[0] : sp.lang;
  const locale = resolveLocale(venue.defaultLocale, rawLang);
  const tracking = parseTrackingParams(sp);

  const vm = buildVenueViewModel({ venue, location, locale, tracking });
  return <VenuePage vm={vm} />;
}
