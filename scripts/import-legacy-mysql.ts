/**
 * One-time import of registrations from the previous PHP/MySQL system
 * (`customers` table) into the new shared PostgreSQL database.
 *
 * Safe by design:
 *  - reads a CSV export, never touches the live MySQL database
 *  - idempotent: rows already imported (same email + venue scope) are skipped
 *  - the legacy system keeps running untouched until cutover
 *
 * Usage:
 *  1. In phpMyAdmin (Hostinger), export the `customers` table as CSV
 *     WITH column headers, comma-separated, UTF-8.
 *  2. npx tsx scripts/import-legacy-mysql.ts /path/to/customers.csv
 *
 * Expected columns (from the legacy schema):
 *   id, venue_slug, full_name, email, phone, birthday, terms_consent,
 *   marketing_consent, consent_text_version, consent_ip, consent_user_agent,
 *   email_verified, verification_token, created_at, updated_at
 *   (consent_ip / user_agent / tokens are NOT imported — data minimization)
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { normalizeEmail, normalizePhone } from "../lib/validation/registration";

const prisma = new PrismaClient();

// Legacy slug → { venue slug, location slug } in the new database.
const LEGACY_MAP: Record<string, { venue: string; location: string }> = {
  deep: { venue: "deep-club", location: "main" },
  zacapa: { venue: "zakapa-athens", location: "main" },
  jasmine: { venue: "jasmine-skylounge", location: "main" },
  macao: { venue: "macao-beach-naxos", location: "main" },
  scarlet: { venue: "scarlet-athens", location: "main" },
  "nobell-galatsi": { venue: "nobell", location: "galatsi" },
  "nobell-marousi": { venue: "nobell", location: "marousi" },
};

function parseCsv(text: string): Record<string, string>[] {
  // Minimal RFC4180 parser (handles quoted fields with commas/newlines).
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows;
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), r[i] ?? ""])));
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error("Usage: npx tsx scripts/import-legacy-mysql.ts <customers.csv>");
    process.exit(1);
  }

  const records = parseCsv(fs.readFileSync(csvPath, "utf8"));
  console.log(`Parsed ${records.length} legacy rows.`);

  let imported = 0, skippedExisting = 0, skippedUnknownVenue = 0, skippedInvalid = 0;

  for (const rec of records) {
    const mapping = LEGACY_MAP[rec.venue_slug?.trim().toLowerCase()];
    if (!mapping) { skippedUnknownVenue++; continue; }

    const venue = await prisma.venue.findUnique({
      where: { slug: mapping.venue },
      include: { locations: true },
    });
    const location = venue?.locations.find((l) => l.slug === mapping.location);
    if (!venue || !location) { skippedUnknownVenue++; continue; }

    const email = normalizeEmail(rec.email ?? "");
    const birthday = new Date(`${rec.birthday}T00:00:00Z`);
    if (!email.includes("@") || Number.isNaN(birthday.getTime())) { skippedInvalid++; continue; }

    const existing = await prisma.registration.findFirst({
      where: { venueId: venue.id, venueLocationId: location.id, normalizedEmail: email },
      select: { id: true },
    });
    if (existing) { skippedExisting++; continue; }

    await prisma.registration.create({
      data: {
        venueId: venue.id,
        venueLocationId: location.id,
        fullName: rec.full_name?.trim() || "(unknown)",
        email,
        phone: rec.phone?.trim() ?? "",
        birthday,
        normalizedEmail: email,
        normalizedPhone: normalizePhone(rec.phone ?? ""),
        termsConsent: rec.terms_consent === "1",
        marketingConsent: rec.marketing_consent === "1",
        consentVersion: rec.consent_text_version?.trim() || "v1",
        consentTimestamp: rec.created_at ? new Date(rec.created_at) : new Date(),
        locale: "el",
        metadata: { legacyImport: true, legacyId: rec.id ?? null },
        createdAt: rec.created_at ? new Date(rec.created_at) : undefined,
      },
    });
    imported++;
  }

  console.log(
    `Done. imported=${imported} skippedExisting=${skippedExisting} ` +
      `skippedUnknownVenue=${skippedUnknownVenue} skippedInvalid=${skippedInvalid}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
