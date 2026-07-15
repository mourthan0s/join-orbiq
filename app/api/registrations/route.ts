import { NextRequest, NextResponse } from "next/server";
import { registrationInputSchema, fieldErrorsFromZod } from "@/lib/validation/registration";
import { registrationRateLimiter, rateLimitKey } from "@/lib/security/rate-limit";
import { getVenueBySlug, resolveLocation } from "@/features/venues/service";
import { createRegistration } from "@/features/registrations/service";

export const dynamic = "force-dynamic";

/**
 * POST /api/registrations — the only public write endpoint.
 * There is deliberately no GET: registrations are never listed publicly.
 *
 * Privacy: no personal data is ever logged or echoed back beyond what the
 * client already sent; errors are generic on the wire, detailed only in the
 * field map used for inline messages.
 */
export async function POST(request: NextRequest) {
  try {
    const limiterKey = await rateLimitKey(request);
    if (!(await registrationRateLimiter.check(limiterKey))) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
    }

    const parsed = registrationInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation", fields: fieldErrorsFromZod(parsed.error) },
        { status: 400 }
      );
    }
    const input = parsed.data;

    // Honeypot filled → almost certainly a bot. Report success, store nothing.
    if (input.website && input.website.length > 0) {
      return NextResponse.json({ ok: true, outcome: "created" });
    }

    const venue = await getVenueBySlug(input.venueSlug);
    if (!venue || !venue.active) {
      return NextResponse.json({ ok: false, error: "unknown_venue" }, { status: 404 });
    }

    const location = resolveLocation(venue, input.locationSlug);
    if (input.locationSlug && !location) {
      return NextResponse.json({ ok: false, error: "unknown_location" }, { status: 404 });
    }
    if (location && !location.active) {
      return NextResponse.json({ ok: false, error: "unknown_location" }, { status: 404 });
    }

    const result = await createRegistration(input, {
      venueId: venue.id,
      venueLocationId: location?.id ?? null,
    });

    return NextResponse.json({ ok: true, outcome: result.outcome });
  } catch (error) {
    // Never leak internals or personal data — log the error class only.
    console.error(
      "registration_error",
      error instanceof Error ? error.constructor.name : typeof error
    );
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
