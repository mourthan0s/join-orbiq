"use client";

import type { AnalyticsEvent, AnalyticsEventName, AnalyticsProps } from "./events";

/**
 * Analytics abstraction — PII-free by construction (see events.ts).
 *
 * Transport integration point: swap `transport` for Plausible, Umami,
 * PostHog (with PII scrubbing) or a first-party endpoint. The default
 * transport logs in development and no-ops in production so no third-party
 * script ever blocks the page.
 */

type Transport = (event: AnalyticsEvent) => void;

const devTransport: Transport = (event) => {
  console.debug(`[analytics] ${event.name}`, event.props);
};

const noopTransport: Transport = () => {};

let transport: Transport =
  process.env.NODE_ENV === "development" ? devTransport : noopTransport;

export function setAnalyticsTransport(custom: Transport) {
  transport = custom;
}

export function track(name: AnalyticsEventName, props: AnalyticsProps = {}) {
  try {
    transport({ name, props, timestamp: Date.now() });
  } catch {
    // Analytics must never break the conversion flow.
  }
}
