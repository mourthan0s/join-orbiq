import "server-only";
import { prisma } from "@/lib/db/client";

/**
 * Admin-readiness layer — NOT exposed via any public route. A future
 * authenticated admin panel imports these functions; nothing in app/ does.
 * Keeping them here documents the intended workflows (GDPR export/erasure,
 * CSV export, reporting) and keeps business logic out of UI components.
 */

export async function listRegistrations(opts: {
  venueId: string;
  venueLocationId?: string;
  take?: number;
  cursor?: string;
}) {
  return prisma.registration.findMany({
    where: {
      venueId: opts.venueId,
      venueLocationId: opts.venueLocationId,
      status: { not: "DELETED" },
    },
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 100,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });
}

export async function registrationsToCsv(venueId: string): Promise<string> {
  const rows = await listRegistrations({ venueId, take: 10_000 });
  const header = "fullName,email,phone,birthday,marketingConsent,consentVersion,source,campaign,locale,createdAt";
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      escape(r.fullName),
      escape(r.email),
      escape(r.phone),
      r.birthday.toISOString().slice(0, 10),
      String(r.marketingConsent),
      r.consentVersion,
      r.source ?? "",
      r.campaign ?? "",
      r.locale,
      r.createdAt.toISOString(),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

/** GDPR erasure: clears PII while keeping an anonymized row for statistics. */
export async function eraseRegistration(registrationId: string) {
  return prisma.registration.update({
    where: { id: registrationId },
    data: {
      fullName: "[erased]",
      email: `erased-${registrationId}@erased.invalid`,
      phone: "",
      normalizedEmail: `erased-${registrationId}`,
      normalizedPhone: "",
      birthday: new Date("1900-01-01T00:00:00Z"),
      status: "DELETED",
      metadata: { erasedAt: new Date().toISOString() },
    },
  });
}

/** GDPR export: all data held for one email across all venues. */
export async function exportPersonalData(email: string) {
  return prisma.registration.findMany({
    where: { normalizedEmail: email.trim().toLowerCase(), status: { not: "DELETED" } },
    include: { venue: { select: { name: true, slug: true } } },
  });
}
