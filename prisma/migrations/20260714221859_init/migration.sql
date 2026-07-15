-- CreateEnum
CREATE TYPE "VenueCategory" AS ENUM ('RESTAURANT', 'BAR', 'CAFE', 'BEACH_BAR', 'CLUB', 'ROOFTOP', 'GASTROBAR', 'ALL_DAY');

-- CreateEnum
CREATE TYPE "VisualVariant" AS ENUM ('DARK_NIGHTLIFE', 'ROOFTOP_ELEGANCE', 'COASTAL_SUMMER', 'FINE_DINING', 'URBAN_GASTROBAR', 'RELAXED_CAFE', 'PREMIUM_ALL_DAY');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED', 'DELETED');

-- CreateEnum
CREATE TYPE "ReviewCtaMode" AS ENUM ('HIDDEN', 'AFTER_SUCCESS', 'ALWAYS');

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "category" "VenueCategory" NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "logoDarkUrl" TEXT,
    "heroImageUrl" TEXT,
    "mobileHeroImageUrl" TEXT,
    "websiteUrl" TEXT,
    "instagramUrl" TEXT,
    "defaultRedirectUrl" TEXT,
    "visualVariant" "VisualVariant" NOT NULL DEFAULT 'PREMIUM_ALL_DAY',
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "themeConfig" JSONB,
    "headline" TEXT,
    "headlineEn" TEXT,
    "supportingText" TEXT,
    "supportingTextEn" TEXT,
    "benefitText" TEXT,
    "benefitTextEn" TEXT,
    "defaultLocale" TEXT NOT NULL DEFAULT 'el',
    "reviewCtaMode" "ReviewCtaMode" NOT NULL DEFAULT 'AFTER_SUCCESS',
    "autoRedirectEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoRedirectDelaySec" INTEGER NOT NULL DEFAULT 8,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_locations" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "websiteUrl" TEXT,
    "redirectUrl" TEXT,
    "googlePlaceId" TEXT,
    "googleMapsUrl" TEXT,
    "googleReviewUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "venueLocationId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthday" DATE NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "normalizedPhone" TEXT NOT NULL,
    "termsConsent" BOOLEAN NOT NULL DEFAULT true,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT NOT NULL,
    "consentTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "campaign" TEXT,
    "qrCodeId" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'el',
    "idempotencyKey" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "venueLocationId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "campaign" TEXT,
    "destinationConfig" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "activeFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "venues_slug_key" ON "venues"("slug");

-- CreateIndex
CREATE INDEX "venues_active_idx" ON "venues"("active");

-- CreateIndex
CREATE UNIQUE INDEX "venue_locations_venueId_slug_key" ON "venue_locations"("venueId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_idempotencyKey_key" ON "registrations"("idempotencyKey");

-- CreateIndex
CREATE INDEX "registrations_venueId_normalizedEmail_idx" ON "registrations"("venueId", "normalizedEmail");

-- CreateIndex
CREATE INDEX "registrations_venueId_venueLocationId_normalizedEmail_idx" ON "registrations"("venueId", "venueLocationId", "normalizedEmail");

-- CreateIndex
CREATE INDEX "registrations_venueId_createdAt_idx" ON "registrations"("venueId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_code_key" ON "qr_codes"("code");

-- CreateIndex
CREATE INDEX "qr_codes_venueId_idx" ON "qr_codes"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "consent_versions_version_locale_key" ON "consent_versions"("version", "locale");

-- AddForeignKey
ALTER TABLE "venue_locations" ADD CONSTRAINT "venue_locations_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_venueLocationId_fkey" FOREIGN KEY ("venueLocationId") REFERENCES "venue_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_venueLocationId_fkey" FOREIGN KEY ("venueLocationId") REFERENCES "venue_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
