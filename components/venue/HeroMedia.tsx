import { getImageProps } from "next/image";

/**
 * Venue hero photo behind the atmosphere, with real art direction:
 * mobile devices download ONLY the portrait crop, desktop only the wide one.
 * Asset contract (see public/venues/README.md): hero.webp is 1920×1080,
 * hero-mobile.webp is 1080×1440.
 */
export function HeroMedia({
  heroImageUrl,
  mobileHeroImageUrl,
}: {
  heroImageUrl: string;
  mobileHeroImageUrl: string | null;
}) {
  const common = { alt: "", sizes: "100vw", quality: 75, priority: true };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, width: 1920, height: 1080, src: heroImageUrl });
  const { props: mobileProps } = getImageProps({
    ...common,
    width: 1080,
    height: 1440,
    src: mobileHeroImageUrl ?? heroImageUrl,
  });

  return (
    <div className="hero-media" aria-hidden>
      <picture>
        <source media="(min-width: 640px)" srcSet={desktopSrcSet} />
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          {...mobileProps}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      </picture>
      <div className="hero-overlay" />
    </div>
  );
}
