/**
 * Analytics event catalogue. Only the properties in AnalyticsProps may ever
 * be attached to an event — no names, emails, phones, birthdays or raw form
 * payloads. The type system enforces this at compile time.
 */

export type AnalyticsEventName =
  | "venue_page_view"
  | "join_cta_clicked"
  | "form_opened"
  | "form_started"
  | "form_validation_error"
  | "form_submit_clicked"
  | "registration_success"
  | "registration_failed"
  | "google_review_clicked"
  | "website_redirect_clicked"
  | "instagram_redirect_clicked"
  | "automatic_redirect_started"
  | "automatic_redirect_completed";

/** The complete set of allowed event properties. Nothing else compiles. */
export type AnalyticsProps = {
  venueId?: string;
  venueSlug?: string;
  locationId?: string;
  locationSlug?: string;
  source?: string;
  campaign?: string;
  qrCodeId?: string;
  locale?: string;
};

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  props: AnalyticsProps;
  timestamp: number;
};
