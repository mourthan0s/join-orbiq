# Venue assets

Official brand assets go here, one directory per venue slug:

```
public/venues/<slug>/logo.webp        → Venue.logoUrl        = /venues/<slug>/logo.webp
public/venues/<slug>/logo-dark.webp   → Venue.logoDarkUrl
public/venues/<slug>/hero.webp        → Venue.heroImageUrl
public/venues/<slug>/hero-mobile.webp → Venue.mobileHeroImageUrl
```

Guidelines:

- Use WebP or AVIF. Logos ≤ 60 KB, heroes ≤ 250 KB (mobile ≤ 150 KB).
- **Fixed dimensions contract** (HeroMedia relies on it): `hero.webp` =
  1920×1080, `hero-mobile.webp` = 1080×1440. Convert with sharp, e.g.
  `sharp(src).resize(1920, 1080, { fit: "cover" }).webp({ quality: 72 })`.
- Only add assets the venue has approved for this use — never hotlink or
  scrape from their website.
- After adding files, set the matching URL columns on the `venues` row.
  Pages render the typographic monogram medallion until `logoUrl` is set,
  so missing assets never break a page.
- These paths can later move to a CDN: the database columns accept absolute
  URLs as well (add the CDN host to `next.config.ts` images config if you
  switch to remote images).
