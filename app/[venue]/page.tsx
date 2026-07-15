import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getVenueBySlug, legacyRedirectPath, resolveLocation } from "@/features/venues/service";
import { buildVenueViewModel } from "@/features/venues/view-model";
import { parseTrackingParams } from "@/lib/security/tracking";
import { resolveLocale } from "@/lib/i18n/translations";
import { VenuePage } from "@/components/venue/VenuePage";
import { FallbackPage } from "@/components/shared/FallbackPage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ venue: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venue: slug } = await params;
  const venue = await getVenueBySlug(slug).catch(() => null);
  if (!venue) return { title: "ORBIQ Join" };
  return {
    title: `${venue.name} — Join the List`,
    description: venue.description ?? `Join the ${venue.name} guest list.`,
  };
}

export default async function VenueRoute({ params, searchParams }: Props) {
  const { venue: slug } = await params;
  const sp = await searchParams;

  const venue = await getVenueBySlug(slug);
  if (!venue) {
    // Old QR slugs (deep, zacapa, nobell-galatsi, …) keep working forever.
    const legacy = legacyRedirectPath(slug);
    if (legacy) {
      const qs = new URLSearchParams();
      const tracking = parseTrackingParams(sp);
      if (tracking.source) qs.set("source", tracking.source);
      if (tracking.campaign) qs.set("campaign", tracking.campaign);
      if (tracking.qr) qs.set("qr", tracking.qr);
      redirect(qs.size > 0 ? `${legacy}?${qs}` : legacy);
    }
    notFound();
  }

  if (!venue.active) {
    return (
      <FallbackPage
        title="Οι εγγραφές είναι προσωρινά κλειστές"
        body={`Οι εγγραφές για ${venue.name} δεν είναι διαθέσιμες αυτή τη στιγμή.`}
      />
    );
  }

  const location = resolveLocation(venue);
  const rawLang = Array.isArray(sp.lang) ? sp.lang[0] : sp.lang;
  const locale = resolveLocale(venue.defaultLocale, rawLang);
  const tracking = parseTrackingParams(sp);

  const vm = buildVenueViewModel({ venue, location, locale, tracking });
  return <VenuePage vm={vm} />;
}
