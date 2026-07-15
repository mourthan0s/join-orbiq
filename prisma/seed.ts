/**
 * ORBIQ Join Platform — idempotent seed.
 *
 * Safe to run repeatedly: existing rows (matched by slug / version) are left
 * untouched (`update: {}`), so operator edits made later in the database are
 * never overwritten. Only missing rows are created.
 *
 * IMPORTANT — data policy:
 *  - Google Place IDs / Maps URLs / Review URLs are NEVER guessed. They are
 *    seeded as null and must be filled in with verified values from each
 *    venue's Google Business Profile (see README → "Missing real data").
 *  - Addresses, phones and Instagram handles below were taken from the
 *    venues' official websites (July 2026).
 *  - No secrets in this file.
 */
import { PrismaClient, VenueCategory, VisualVariant, ReviewCtaMode } from "@prisma/client";

const prisma = new PrismaClient();

const CONSENT_VERSION = "v2";

const consentTexts = [
  {
    version: CONSENT_VERSION,
    locale: "el",
    text: "Αποδέχομαι τους Όρους Χρήσης και την Πολιτική Απορρήτου. Συναινώ στην επεξεργασία των στοιχείων μου από το κατάστημα με σκοπό την εγγραφή μου στη λίστα επισκεπτών. Εφόσον το επιλέξω, συναινώ επίσης στη λήψη ενημερώσεων, προσφορών και προσκλήσεων σε εκδηλώσεις. Μπορώ να ανακαλέσω τη συγκατάθεσή μου οποιαδήποτε στιγμή.",
  },
  {
    version: CONSENT_VERSION,
    locale: "en",
    text: "I accept the Terms of Use and Privacy Policy. I consent to the processing of my details by the venue for the purpose of joining its guest list. If I opt in, I also consent to receiving updates, offers and event invitations. I can withdraw my consent at any time.",
  },
];

type LocationSeed = {
  slug: string;
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  redirectUrl?: string;
  // Per-location branding overrides (null = inherit from venue)
  instagramUrl?: string;
  heroImageUrl?: string;
  mobileHeroImageUrl?: string;
  // Verified Google Business Profile data only — null until provided.
  googlePlaceId?: string | null;
  googleMapsUrl?: string | null;
  googleReviewUrl?: string | null;
};

type VenueSeed = {
  slug: string;
  name: string;
  category: VenueCategory;
  description?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  mobileHeroImageUrl?: string;
  defaultRedirectUrl?: string;
  /** Safe non-sensitive theme overrides, e.g. { logoFrame: true } for opaque logos. */
  themeConfig?: Record<string, unknown>;
  visualVariant: VisualVariant;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headline: string;
  headlineEn: string;
  supportingText: string;
  supportingTextEn: string;
  benefitText: string;
  benefitTextEn: string;
  reviewCtaMode: ReviewCtaMode;
  autoRedirectEnabled?: boolean;
  autoRedirectDelaySec?: number;
  locations: LocationSeed[];
};

const venues: VenueSeed[] = [
  {
    slug: "zakapa-athens",
    name: "Zakapa Athens",
    category: VenueCategory.GASTROBAR,
    description: "Rooftop gastrobar στο Νέο Ηράκλειο με πανοραμική θέα στην πόλη.",
    websiteUrl: "https://www.zakapaathens.gr",
    instagramUrl: "https://www.instagram.com/zakapa.athens",
    logoUrl: "/venues/zakapa-athens/logo.webp",
    heroImageUrl: "/venues/zakapa-athens/hero.webp",
    mobileHeroImageUrl: "/venues/zakapa-athens/hero-mobile.webp",
    themeConfig: { logoFrame: true }, // logo has an opaque black background
    visualVariant: VisualVariant.URBAN_GASTROBAR,
    primaryColor: "#0e1526",
    secondaryColor: "#1c2a45",
    accentColor: "#d4a34f",
    backgroundColor: "#0a0f1d",
    textColor: "#f4ede0",
    headline: "Η πόλη από ψηλά. Εσύ στη λίστα.",
    headlineEn: "The city from above. You, on the list.",
    supportingText: "Γίνε μέλος της λίστας του Zakapa για προσκλήσεις και προνόμια.",
    supportingTextEn: "Join the Zakapa list for invitations and privileges.",
    benefitText: "Προσκλήσεις σε βραδιές, προτεραιότητα σε κρατήσεις και ό,τι νέο έρχεται στο rooftop.",
    benefitTextEn: "Event invitations, reservation priority and everything new on the rooftop.",
    reviewCtaMode: ReviewCtaMode.AFTER_SUCCESS,
    locations: [
      {
        slug: "main",
        name: "Zakapa Athens",
        address: "Κωνσταντίνου Ωραιόπουλου 2",
        city: "Νέο Ηράκλειο",
        phone: "+30 210 2774945",
        redirectUrl: "https://www.zakapaathens.gr/",
        googlePlaceId: null, // owner has not provided a verified Place ID yet
        googleMapsUrl:
          "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a1992cd1006aa3:0xffa913e8a928764b?sa=X&ved=1t:8290&ictx=111",
        googleReviewUrl: null, // TODO: official review link (g.page/r/…/review) — CTA hidden until set
      },
    ],
  },
  {
    slug: "jasmine-skylounge",
    name: "Jasmine Skylounge",
    category: VenueCategory.ROOFTOP,
    description: "Premium rooftop lounge στην Κηφισιά — sky is not the limit.",
    websiteUrl: "https://www.jasmineskylounge.gr",
    instagramUrl: "https://www.instagram.com/jasmine.skylounge",
    logoUrl: "/venues/jasmine-skylounge/logo.webp",
    heroImageUrl: "/venues/jasmine-skylounge/hero.webp",
    mobileHeroImageUrl: "/venues/jasmine-skylounge/hero-mobile.webp",
    themeConfig: { logoSize: "lg" }, // detailed lockup needs the larger size
    visualVariant: VisualVariant.ROOFTOP_ELEGANCE,
    primaryColor: "#101720",
    secondaryColor: "#233242",
    accentColor: "#c9b28a",
    backgroundColor: "#0c1219",
    textColor: "#f2ede4",
    headline: "Πιο κοντά στον ουρανό.",
    headlineEn: "Closer to the sky.",
    supportingText: "Μπες στη λίστα του Jasmine για sunsets, events και προνόμια.",
    supportingTextEn: "Join the Jasmine list for sunsets, events and privileges.",
    benefitText: "Πρόσβαση σε ξεχωριστές βραδιές και προτεραιότητα στις κρατήσεις σου.",
    benefitTextEn: "Access to special evenings and priority on your reservations.",
    reviewCtaMode: ReviewCtaMode.AFTER_SUCCESS,
    locations: [
      {
        slug: "main",
        name: "Jasmine Skylounge",
        address: "Λεωφόρος Κηφισίας 232",
        city: "Κηφισιά",
        postalCode: "145 62",
        phone: "+30 210 8015054",
        googlePlaceId: null, // owner has not provided a verified Place ID yet
        googleMapsUrl:
          "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a19f42872172e5:0xa932f0e196089032?sa=X&ved=1t:8290&ictx=111",
        googleReviewUrl: null, // TODO: official review link — CTA hidden until set
      },
    ],
  },
  {
    slug: "deep-club",
    name: "Deep Club",
    category: VenueCategory.CLUB,
    description: "Deep in the night — νυχτερινή διασκέδαση στο Νέο Ηράκλειο.",
    websiteUrl: "https://www.deepclub.gr",
    instagramUrl: "https://www.instagram.com/deep.nightlife",
    logoUrl: "/venues/deep-club/logo.webp",
    heroImageUrl: "/venues/deep-club/hero.webp",
    mobileHeroImageUrl: "/venues/deep-club/hero-mobile.webp",
    visualVariant: VisualVariant.DARK_NIGHTLIFE,
    primaryColor: "#07070d",
    secondaryColor: "#141428",
    accentColor: "#37d6e8",
    backgroundColor: "#050509",
    textColor: "#eef2f7",
    headline: "Deep in the night.",
    headlineEn: "Deep in the night.",
    supportingText: "Μπες στη λίστα για guest list, events και VIP ενημερώσεις.",
    supportingTextEn: "Join the list for guest list access, events and VIP updates.",
    benefitText: "Guest list, προσκλήσεις σε ξεχωριστές βραδιές και ό,τι παίζει πριν από όλους.",
    benefitTextEn: "Guest list access, event invitations and first word on what's next.",
    reviewCtaMode: ReviewCtaMode.AFTER_SUCCESS,
    locations: [
      {
        slug: "main",
        name: "Deep Club",
        address: "Μαρίνου Αντύπα 62-66",
        city: "Νέο Ηράκλειο",
        postalCode: "141 21",
        phone: "+30 210 2758608",
        googlePlaceId: null, // owner has not provided a verified Place ID yet
        googleMapsUrl:
          "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a198988f37f235:0x3755f1dd3fa16eac?sa=X&ved=1t:8290&ictx=111",
        googleReviewUrl: null, // TODO: official review link — CTA hidden until set
      },
    ],
  },
  {
    slug: "macao-beach-naxos",
    name: "Macao Beach Naxos",
    category: VenueCategory.BEACH_BAR,
    description: "Beachfront restaurant & bar στον Άγιο Προκόπιο της Νάξου.",
    websiteUrl: "https://macaobeachnaxos.com",
    instagramUrl: "https://www.instagram.com/macaobeach.naxos",
    logoUrl: "/venues/macao-beach-naxos/logo.webp",
    heroImageUrl: "/venues/macao-beach-naxos/hero.webp",
    mobileHeroImageUrl: "/venues/macao-beach-naxos/hero-mobile.webp",
    themeConfig: { logoFrame: true }, // logo has an opaque parchment background
    visualVariant: VisualVariant.COASTAL_SUMMER,
    primaryColor: "#062c3e",
    secondaryColor: "#0d4f66",
    accentColor: "#f0b45c",
    backgroundColor: "#04222f",
    textColor: "#f4f6f2",
    headline: "Εκεί που ο ήλιος συναντά τη θάλασσα.",
    headlineEn: "Where the sun meets the sea.",
    supportingText: "Μπες στη λίστα του Macao για καλοκαιρινά προνόμια και events.",
    supportingTextEn: "Join the Macao list for summer privileges and events.",
    benefitText: "Sunset events, προτεραιότητα σε sunbeds και προσφορές όλο το καλοκαίρι.",
    benefitTextEn: "Sunset events, sunbed priority and offers all summer long.",
    reviewCtaMode: ReviewCtaMode.AFTER_SUCCESS,
    locations: [
      {
        slug: "main",
        name: "Macao Beach Naxos",
        address: "Παραλία Αγίου Προκοπίου",
        city: "Νάξος",
        postalCode: "843 00",
        phone: "+30 22850 41454",
        googlePlaceId: null, // owner has not provided a verified Place ID yet
        googleMapsUrl:
          "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14980b8a73ba033d:0xcfccdde8d4e9b566?sa=X&ved=1t:8290&ictx=111",
        googleReviewUrl: null, // TODO: official review link — CTA hidden until set
      },
    ],
  },
  {
    slug: "scarlet-athens",
    name: "Scarlet Athens",
    category: VenueCategory.RESTAURANT,
    description: "Fine dining & all-day bar — the new all-day spot of Athens.",
    websiteUrl: "https://www.scarletathens.gr",
    instagramUrl: "https://www.instagram.com/scarlet_athens",
    logoUrl: "/venues/scarlet-athens/logo.webp",
    heroImageUrl: "/venues/scarlet-athens/hero.webp",
    mobileHeroImageUrl: "/venues/scarlet-athens/hero-mobile.webp",
    visualVariant: VisualVariant.FINE_DINING,
    primaryColor: "#1a0a0e",
    secondaryColor: "#3d1220",
    accentColor: "#c8323e",
    backgroundColor: "#140609",
    textColor: "#f5ece7",
    headline: "Μια θέση στο τραπέζι μας.",
    headlineEn: "A seat at our table.",
    supportingText: "Γίνε μέλος της λίστας του Scarlet για gastronomy events και προνόμια.",
    supportingTextEn: "Join the Scarlet list for gastronomy events and privileges.",
    benefitText: "Προσκλήσεις σε degustation βραδιές και προτεραιότητα στις κρατήσεις σου.",
    benefitTextEn: "Invitations to tasting evenings and priority on your reservations.",
    reviewCtaMode: ReviewCtaMode.AFTER_SUCCESS,
    locations: [
      {
        slug: "main",
        name: "Scarlet Athens",
        address: "Πλατεία Αγίου Ανδρέα",
        city: "Γαλάτσι",
        phone: "+30 210 2929989",
        googlePlaceId: null, // owner has not provided a verified Place ID yet
        googleMapsUrl:
          "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a1a332bb2c9b7f:0x3076de0f648656b5?sa=X&ved=1t:8290&ictx=111",
        googleReviewUrl: null, // TODO: official review link — CTA hidden until set
      },
    ],
  },
  {
    slug: "nobell",
    name: "Nobell",
    category: VenueCategory.ALL_DAY,
    description: "All-day eatery café — everyday exceptional experience.",
    websiteUrl: "https://www.nobell.gr",
    // No brand-level Instagram: each location has its own account (see below).
    instagramUrl: undefined,
    logoUrl: "/venues/nobell/logo.webp",
    themeConfig: { logoFrame: true }, // logo has an opaque charcoal background
    visualVariant: VisualVariant.PREMIUM_ALL_DAY,
    primaryColor: "#171412",
    secondaryColor: "#2e2723",
    accentColor: "#c99a5b",
    backgroundColor: "#121010",
    textColor: "#f3efe9",
    headline: "Everyday exceptional.",
    headlineEn: "Everyday exceptional.",
    supportingText: "Μπες στη λίστα του Nobell για προνόμια σε κάθε σου επίσκεψη.",
    supportingTextEn: "Join the Nobell list for privileges on every visit.",
    benefitText: "Ενημερώσεις για νέα μενού, brunch events και αποκλειστικές προσφορές.",
    benefitTextEn: "Updates on new menus, brunch events and exclusive offers.",
    reviewCtaMode: ReviewCtaMode.AFTER_SUCCESS,
    locations: [
      {
        slug: "galatsi",
        name: "Nobell Γαλάτσι",
        address: "Λεωφόρος Βεΐκου 101",
        city: "Γαλάτσι",
        postalCode: "111 46",
        phone: "+30 210 2134943",
        instagramUrl: "https://www.instagram.com/nobell_101",
        heroImageUrl: "/venues/nobell/galatsi-hero.webp",
        mobileHeroImageUrl: "/venues/nobell/galatsi-hero-mobile.webp",
        googlePlaceId: null, // owner has not provided a verified Place ID yet
        googleMapsUrl:
          "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a1a2847679a1eb:0x10d7d0ad3ea2a519?sa=X&ved=1t:8290&ictx=111",
        googleReviewUrl: null, // TODO: Galatsi review link — must differ from Marousi
      },
      {
        slug: "marousi",
        name: "Nobell Μαρούσι",
        address: "Περικλέους 2",
        city: "Μαρούσι",
        postalCode: "151 22",
        phone: "+30 210 8022966",
        instagramUrl: "https://www.instagram.com/nobell_2",
        heroImageUrl: "/venues/nobell/marousi-hero.webp",
        mobileHeroImageUrl: "/venues/nobell/marousi-hero-mobile.webp",
        googlePlaceId: null, // owner has not provided a verified Place ID yet
        googleMapsUrl:
          "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a1990aa6302a4d:0x734c0d7c107de4cf?sa=X&ved=1t:8290&ictx=111",
        googleReviewUrl: null, // TODO: Marousi review link — must differ from Galatsi
      },
    ],
  },
  {
    slug: "cafe-cafe-athens",
    name: "Cafe Cafe Athens",
    category: VenueCategory.CAFE,
    // No official website — Instagram is the primary external link and the
    // success-screen fallback destination. Review CTA stays hidden until a
    // verified googleReviewUrl is set on the location.
    description: "High end espresso στην καρδιά της Αθήνας.",
    websiteUrl: undefined,
    instagramUrl: "https://www.instagram.com/cafecafe_athens",
    logoUrl: "/venues/cafe-cafe-athens/logo.webp",
    heroImageUrl: "/venues/cafe-cafe-athens/hero.webp",
    mobileHeroImageUrl: "/venues/cafe-cafe-athens/hero-mobile.webp",
    themeConfig: { logoFrame: true }, // logo has an opaque circular background
    visualVariant: VisualVariant.RELAXED_CAFE,
    primaryColor: "#1c1713",
    secondaryColor: "#33291f",
    accentColor: "#c98f4e",
    backgroundColor: "#161210",
    textColor: "#f4eee6",
    headline: "Ο καφές σου, με προνόμια.",
    headlineEn: "Your coffee, with perks.",
    supportingText: "Μπες στη λίστα μας και μάθε πρώτος τα νέα μας.",
    supportingTextEn: "Join our list and be the first to hear our news.",
    benefitText: "Προσφορές και νέα του καταστήματος, κατευθείαν σε σένα.",
    benefitTextEn: "Offers and venue news, straight to you.",
    reviewCtaMode: ReviewCtaMode.HIDDEN, // flip to AFTER_SUCCESS once a verified review URL is set
    locations: [
      {
        slug: "main",
        name: "Cafe Cafe Athens",
        googlePlaceId: null, // owner has not provided a verified Place ID yet
        googleMapsUrl:
          "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a1a28ef2e948e5:0x5e9d006078fea00e?sa=X&ved=1t:8290&ictx=111",
        googleReviewUrl: null, // TODO: official review link from the business — CTA hidden until set
      },
    ],
  },
];

async function main() {
  for (const consent of consentTexts) {
    await prisma.consentVersion.upsert({
      where: { version_locale: { version: consent.version, locale: consent.locale } },
      update: {},
      create: consent,
    });
  }

  for (const v of venues) {
    const venue = await prisma.venue.upsert({
      where: { slug: v.slug },
      update: {}, // never overwrite operator edits on re-run
      create: {
        slug: v.slug,
        name: v.name,
        category: v.category,
        description: v.description,
        websiteUrl: v.websiteUrl,
        instagramUrl: v.instagramUrl,
        logoUrl: v.logoUrl,
        heroImageUrl: v.heroImageUrl,
        mobileHeroImageUrl: v.mobileHeroImageUrl,
        defaultRedirectUrl: v.defaultRedirectUrl,
        themeConfig: v.themeConfig as never,
        visualVariant: v.visualVariant,
        primaryColor: v.primaryColor,
        secondaryColor: v.secondaryColor,
        accentColor: v.accentColor,
        backgroundColor: v.backgroundColor,
        textColor: v.textColor,
        headline: v.headline,
        headlineEn: v.headlineEn,
        supportingText: v.supportingText,
        supportingTextEn: v.supportingTextEn,
        benefitText: v.benefitText,
        benefitTextEn: v.benefitTextEn,
        reviewCtaMode: v.reviewCtaMode,
        autoRedirectEnabled: v.autoRedirectEnabled ?? false,
        autoRedirectDelaySec: v.autoRedirectDelaySec ?? 8,
        defaultLocale: "el",
        active: true,
      },
    });

    for (const loc of v.locations) {
      await prisma.venueLocation.upsert({
        where: { venueId_slug: { venueId: venue.id, slug: loc.slug } },
        update: {},
        create: {
          venueId: venue.id,
          slug: loc.slug,
          name: loc.name,
          address: loc.address,
          city: loc.city,
          postalCode: loc.postalCode,
          phone: loc.phone,
          redirectUrl: loc.redirectUrl,
          instagramUrl: loc.instagramUrl,
          heroImageUrl: loc.heroImageUrl,
          mobileHeroImageUrl: loc.mobileHeroImageUrl,
          googlePlaceId: loc.googlePlaceId ?? null,
          googleMapsUrl: loc.googleMapsUrl ?? null,
          googleReviewUrl: loc.googleReviewUrl ?? null,
          active: true,
        },
      });
    }
  }

  const venueCount = await prisma.venue.count();
  const locationCount = await prisma.venueLocation.count();
  console.log(`Seed complete: ${venueCount} venues, ${locationCount} locations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
