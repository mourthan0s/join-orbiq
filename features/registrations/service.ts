import "server-only";
import { prisma } from "@/lib/db/client";
import {
  normalizeEmail,
  normalizePhone,
  type RegistrationInput,
} from "@/lib/validation/registration";

/**
 * Registration write layer — the single path through which guest data enters
 * the shared database. Kept UI-free so a future admin panel and exports can
 * reuse it.
 *
 * Duplicate policy (mirrors the previous production system, which upserted on
 * email + venue): the same email may register at different venues freely, but
 * within one venue/location scope a resubmission UPDATES the existing row
 * instead of creating an uncontrolled duplicate. Enforced in application
 * logic — no destructive unique constraint on legacy-imported data.
 *
 * Idempotency: the client sends a UUID per form session. A retry after a
 * network error hits the unique idempotencyKey and returns the same result.
 */

export type RegistrationResult = {
  outcome: "created" | "updated" | "replayed";
  registrationId: string;
};

export async function createRegistration(
  input: RegistrationInput,
  scope: { venueId: string; venueLocationId: string | null }
): Promise<RegistrationResult> {
  const nEmail = normalizeEmail(input.email);
  const nPhone = normalizePhone(input.phone);

  const activeConsent = await prisma.consentVersion.findFirst({
    where: { locale: input.locale, activeFrom: { lte: new Date() } },
    orderBy: { activeFrom: "desc" },
  });
  const consentVersion = activeConsent?.version ?? "v2";

  // Replay of the exact same submission (e.g. retry after timeout).
  const replay = await prisma.registration.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: { id: true },
  });
  if (replay) return { outcome: "replayed", registrationId: replay.id };

  const qrCode = input.qr
    ? await prisma.qrCode.findFirst({
        where: { code: input.qr, venueId: scope.venueId, active: true },
        select: { id: true },
      })
    : null;

  const commonData = {
    fullName: input.fullName,
    email: nEmail,
    phone: input.phone.trim(),
    birthday: new Date(`${input.birthday}T00:00:00Z`),
    normalizedEmail: nEmail,
    normalizedPhone: nPhone,
    termsConsent: true,
    marketingConsent: input.marketingConsent,
    consentVersion,
    consentTimestamp: new Date(),
    source: input.source,
    campaign: input.campaign,
    qrCodeId: qrCode?.id ?? null,
    locale: input.locale,
  };

  // Duplicate scope: same normalized email within the same venue + location.
  const existing = await prisma.registration.findFirst({
    where: {
      venueId: scope.venueId,
      venueLocationId: scope.venueLocationId,
      normalizedEmail: nEmail,
      status: { not: "DELETED" },
    },
    select: { id: true },
  });

  if (existing) {
    const updated = await prisma.registration.update({
      where: { id: existing.id },
      data: { ...commonData, status: "ACTIVE", idempotencyKey: input.idempotencyKey },
    });
    return { outcome: "updated", registrationId: updated.id };
  }

  const created = await prisma.registration.create({
    data: {
      ...commonData,
      venueId: scope.venueId,
      venueLocationId: scope.venueLocationId,
      idempotencyKey: input.idempotencyKey,
    },
  });
  return { outcome: "created", registrationId: created.id };
}
