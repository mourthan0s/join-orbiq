import Image from "next/image";
import Link from "next/link";
import type { VenueViewModel } from "@/features/venues/view-model";
import { getDictionary } from "@/lib/i18n/translations";
import { JoinExperience } from "./JoinExperience";
import { HeroMedia } from "./HeroMedia";

/**
 * Shared server shell for every venue/location page. Atmosphere and identity
 * render on the server; everything interactive lives in the JoinExperience
 * client island below the headline.
 */
export function VenuePage({ vm }: { vm: VenueViewModel }) {
  const t = getDictionary(vm.locale);

  // Small language switcher: same page, tracking preserved, locale flipped.
  const basePath = vm.locationSlug && vm.locationSlug !== "main"
    ? `/${vm.venueSlug}/${vm.locationSlug}`
    : `/${vm.venueSlug}`;
  const qs = new URLSearchParams();
  if (vm.tracking.source) qs.set("source", vm.tracking.source);
  if (vm.tracking.campaign) qs.set("campaign", vm.tracking.campaign);
  if (vm.tracking.qr) qs.set("qr", vm.tracking.qr);
  qs.set("lang", vm.locale === "el" ? "en" : "el");
  const langToggleHref = `${basePath}?${qs}`;

  const hasHero = Boolean(vm.heroImageUrl);

  return (
    <div
      className={`venue-shell ${hasHero ? "has-hero" : ""}`}
      style={vm.cssVars as React.CSSProperties}
    >
      {hasHero && (
        <HeroMedia
          heroImageUrl={vm.heroImageUrl!}
          mobileHeroImageUrl={vm.mobileHeroImageUrl}
        />
      )}
      <div className={`atmosphere ${vm.atmosphereClass}`} aria-hidden />

      <div className="venue-content flex min-h-dvh flex-col">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10 text-center safe-top">
          {/* Identity */}
          {vm.logoUrl ? (
            <Image
              src={vm.logoUrl}
              alt={vm.venueName}
              width={132}
              height={132}
              priority
              className={`reveal-up w-auto object-contain ${vm.logoSize === "lg" ? "h-32" : "h-24"} ${vm.logoFrame ? "rounded-2xl ring-1 ring-white/10" : ""}`}
            />
          ) : (
            <div className="medallion reveal-up" aria-hidden>
              {vm.monogram}
            </div>
          )}

          <h1 className={`${vm.displayClass} reveal-up reveal-d1 mt-5 text-[1.375rem] leading-snug`}>
            {vm.venueName}
          </h1>

          {vm.locationLabel && (
            <p className="reveal-up reveal-d1 mt-2 inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--v-text)_20%,transparent)] px-3.5 py-1 text-sm font-medium tracking-wide opacity-90">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="10" r="2.5" fill="currentColor" />
              </svg>
              {vm.locationLabel}
            </p>
          )}

          {/* Thesis */}
          <p className={`${vm.displayClass} reveal-up reveal-d2 mt-8 text-balance text-[2rem] leading-[1.15] sm:text-4xl`}>
            {vm.headline}
          </p>

          {vm.benefitText && (
            <p className="reveal-up reveal-d2 mt-4 max-w-xs text-pretty text-[0.9375rem] leading-relaxed opacity-75">
              {vm.benefitText}
            </p>
          )}

          {/* CTA + form + success flow (client island) */}
          <JoinExperience vm={vm} />
        </main>

        <footer className="flex flex-col items-center gap-2 px-6 pb-5 text-center text-xs opacity-60 safe-bottom">
          <p>
            <Link href="/privacy" className="underline underline-offset-2">
              {t.privacyLinkText}
            </Link>
            {" · "}
            <Link href="/terms" className="underline underline-offset-2">
              {t.termsLinkText}
            </Link>
            {" · "}
            <Link href={langToggleHref} className="underline underline-offset-2 uppercase">
              {vm.locale === "el" ? "EN" : "ΕΛ"}
            </Link>
          </p>
          <p>
            {t.poweredBy}{" "}
            <a
              href="https://orbi-q.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold tracking-wide"
            >
              ORBIQ
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
