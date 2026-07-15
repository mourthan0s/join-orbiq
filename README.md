# ORBIQ Join — Venue Registration Platform

Production domain: **https://join.orbi-q.com**

Multi-venue, mobile-first guest-list registration. Guests scan a QR code
inside a venue, land on a premium venue-branded page, register in seconds,
and are invited to leave a Google review and continue to the venue's website
or Instagram. One shared PostgreSQL database holds every venue, location,
QR campaign and registration.

## Stack

- Next.js 15 (App Router) + TypeScript, `output: "standalone"`
- Tailwind CSS 4, pure-CSS ambient animations (no WebGL, no client motion lib)
- Prisma 6 + PostgreSQL (Supabase-compatible)
- Zod 4 validation (shared client/server)

## URL architecture

| URL | Purpose |
|---|---|
| `/zakapa-athens`, `/jasmine-skylounge`, `/deep-club`, `/macao-beach-naxos`, `/scarlet-athens`, `/cafe-cafe-athens` | Single-location venue pages |
| `/nobell/galatsi`, `/nobell/marousi` | Multi-location venue pages (distinct Google review URLs, addresses, analytics attribution) |
| `/join.php?venue=<old-slug>` | Legacy QR codes from the previous PHP system — permanent redirect to the new page, tracking params preserved |
| `/privacy`, `/terms` | Consent documents |
| `/` | Minimal ORBIQ screen (no public venue directory) |

Tracking query params (`?source=table&campaign=summer-2026&qr=table-14`) are
sanitized (`[a-z0-9._-]`, max 64 chars), stored as attribution only, and can
never influence redirects or rendered HTML.

## Local development

```bash
npm install

# Local PostgreSQL (Docker):
docker run -d --name joinorbiq-pg -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=orbiq_join -p 54329:5432 postgres:16-alpine

cp .env.example .env
# DATABASE_URL / DIRECT_DATABASE_URL →
#   postgresql://postgres:devpass@localhost:54329/orbiq_join

npm run db:migrate      # prisma migrate deploy
npm run db:seed         # idempotent — never overwrites operator edits
npm run dev             # http://localhost:3000/deep-club
```

Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Database

Entities (see `prisma/schema.prisma`): `Venue` (branding, copy el/en, visual
variant, review-CTA mode, auto-redirect config) → `VenueLocation` (address,
phone, per-location `googlePlaceId` / `googleMapsUrl` / `googleReviewUrl`,
redirect override) → `Registration` (guest data + consent version/timestamp +
sanitized attribution) and `QrCode`, `ConsentVersion`.

Rules encoded in `features/registrations/service.ts`:

- **Duplicates**: the same email may join different venues freely; within one
  venue/location a resubmission updates the existing row (mirrors the legacy
  behaviour, no destructive unique constraint).
- **Idempotency**: the form generates a UUID per session; retries after
  network errors replay instead of duplicating.
- **Erasure/export**: `features/registrations/admin.ts` implements GDPR
  workflows for the future admin panel; nothing in `app/` exposes them.

### Importing the legacy MySQL data

The previous system (`qr-customer-signup`, PHP/MySQL on Hostinger) keeps
running untouched until cutover.

1. phpMyAdmin → export the `customers` table as CSV **with headers**, UTF-8.
2. `npx tsx scripts/import-legacy-mysql.ts /path/to/customers.csv`

The import is idempotent (reruns skip already-imported emails), maps old
slugs (`deep`, `zacapa`, `nobell-galatsi`, …) to the new venues/locations,
tags rows with `metadata.legacyImport`, and deliberately drops legacy IPs,
user agents and verification tokens (data minimization).

## Venue theming

`Venue.visualVariant` selects a preset in `lib/theme/variants.ts` +
`app/globals.css` (atmosphere layers, typography treatment, CTA shape);
per-venue colors in the database override the preset. Variants: dark
nightlife, rooftop elegance, coastal summer, fine dining, urban gastrobar,
relaxed cafe, premium all-day. All animation is compositor-friendly CSS and
honours `prefers-reduced-motion`.

Logos/heroes: see `public/venues/README.md`. Until official assets are
approved, pages render a typographic monogram medallion.

## Google Review CTA

- Uses **only** `VenueLocation.googleReviewUrl` from the database, validated
  against the allowlist in `lib/urls/allowlist.ts` (google.com, g.page,
  maps.app.goo.gl, instagram.com, official venue domains; https only).
- Hidden automatically while the URL is `null` — never guessed, never built
  from search results, never taken from query params.
- `Venue.reviewCtaMode`: `HIDDEN` / `AFTER_SUCCESS` (default — protects
  registration conversion) / `ALWAYS` (adds a subtle pre-registration link).
- Reviews are optional, never incentivized, never gated by sentiment.

Success-screen redirect priority: location `redirectUrl` → venue
`defaultRedirectUrl` → website → Instagram → stay. Auto-redirect is off by
default; when enabled per venue the default countdown is 8 s with a visible
cancel, so the review CTA stays readable.

## Deployment on Hostinger

Requires a Node.js-capable plan (VPS or hPanel “Node.js App”), Node 20+.

```bash
# on the server
git clone <repo> && cd <repo>
npm ci
cp .env.example .env        # fill in real values (see below)
npm run db:migrate          # applies prisma/migrations
npm run db:seed             # first deploy only (idempotent anyway)
npm run build
```

Run one of:

- **hPanel Node.js App / PM2**: start command `npm start` (next start, port
  via `PORT` env).
- **Standalone (smallest footprint)**: copy `.next/standalone` +
  `.next/static` + `public` per Next.js docs and run
  `node server.js` behind Hostinger's reverse proxy.

Point `join.orbi-q.com` at the app, enable SSL in hPanel. Nothing in the app
is Vercel-specific.

### Environment variables (`.env.example`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL URL (Supabase: port 6543, `?pgbouncer=true`) — used at runtime |
| `DIRECT_DATABASE_URL` | Direct URL (port 5432) — used only by `prisma migrate` |
| `NEXT_PUBLIC_APP_URL` | `https://join.orbi-q.com` |

No other secrets exist. Never commit `.env` (already gitignored).

## Security & privacy

Server-side Zod validation, input normalization, in-memory rate limiting
(10/10 min per hashed IP; `RateLimiter` interface ready for Redis), honeypot
field answered with fake success, idempotency keys, external-URL allowlist,
CSP + security headers (`next.config.ts`), no public registration reads, no
PII in logs or analytics (`lib/analytics/events.ts` type-forbids it), consent
version + timestamp stored per registration, GDPR erase/export functions
ready for the admin panel.

## Analytics

`lib/analytics` is a PII-free abstraction (page view, CTA clicks, form
funnel, registration outcome, review/redirect clicks). Default transport:
console in dev, no-op in prod. Swap `setAnalyticsTransport()` for Plausible/
Umami/first-party collection without touching components.

## Missing real data (do not guess — ask the venues)

1. **Google Place IDs / review URLs** for every location (all `null` today;
   the review CTA is hidden until set). Nobell Galatsi and Nobell Marousi
   need **different** links from their respective Google Business Profiles.
2. **Official logos & hero photos** with usage approval
   (`public/venues/README.md`), incl. any Nobell brand assets.
3. **Nobell Instagram URL** (not published on nobell.gr).
4. **Cafe Cafe Athens**: website, address, phone, branding, Google listing —
   currently a provisional neutral config with the review CTA hidden.
5. **Production database credentials** (Supabase or other managed Postgres).
6. **Legacy `customers` CSV export** from Hostinger MySQL for the import.
7. Per-venue decisions on `reviewCtaMode` and auto-redirect (defaults:
   `AFTER_SUCCESS`, auto-redirect off).
