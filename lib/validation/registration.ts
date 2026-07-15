import { z } from "zod";
import { sanitizeTrackingValue } from "@/lib/security/tracking";

/**
 * Registration input schema — used on both client (inline errors) and server
 * (authoritative validation). Field set mirrors the previous production
 * version (full name, email, phone, birthday, terms + marketing consent).
 */

const MIN_AGE = 18; // carried over from the previous production version
const MAX_AGE = 120;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes Greek and international phone numbers to a comparable form:
 * digits with a leading +CC. Greek national formats (69xxxxxxxx, 2xxxxxxxxx)
 * are prefixed with +30.
 */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[\s().-]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;
  if (!digits.startsWith("+") && /^(69|2)\d{8}$/.test(digits)) {
    digits = `+30${digits}`;
  }
  return digits;
}

const phonePattern = /^\+?[\d\s().-]{7,20}$/;

export const registrationInputSchema = z.object({
  venueSlug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  locationSlug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),

  fullName: z
    .string()
    .trim()
    .min(2, "fullName")
    .max(120, "fullName")
    .refine((v) => /\p{L}/u.test(v), "fullName"),
  email: z.string().trim().max(254).email("email").transform(normalizeEmail),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, "phone")
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    }, "phone"),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "birthday")
    .refine((v) => {
      const date = new Date(`${v}T00:00:00Z`);
      if (Number.isNaN(date.getTime())) return false;
      const now = new Date();
      let age = now.getUTCFullYear() - date.getUTCFullYear();
      const monthDiff = now.getUTCMonth() - date.getUTCMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < date.getUTCDate())) age -= 1;
      return age >= MIN_AGE && age <= MAX_AGE;
    }, "birthday"),

  termsConsent: z.literal(true, { message: "termsConsent" }),
  marketingConsent: z.literal(true, { message: "marketingConsent" }),

  locale: z.enum(["el", "en"]).default("el"),

  // Attribution — sanitized, never trusted for redirects.
  source: z
    .string()
    .max(64)
    .optional()
    .transform((v) => sanitizeTrackingValue(v)),
  campaign: z
    .string()
    .max(64)
    .optional()
    .transform((v) => sanitizeTrackingValue(v)),
  qr: z
    .string()
    .max(64)
    .optional()
    .transform((v) => sanitizeTrackingValue(v)),

  /** Client-generated UUID so retries after network errors are idempotent. */
  idempotencyKey: z.string().uuid(),

  /** Honeypot — humans never see or fill this field; a non-empty value is
   *  detected in the route and answered with a fake success. */
  website: z.string().max(200).optional(),
});

export type RegistrationInput = z.infer<typeof registrationInputSchema>;

/** Field-level error map keyed for translation lookup. */
export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0]?.toString() ?? "form";
    if (!fields[field]) fields[field] = field;
  }
  return fields;
}
