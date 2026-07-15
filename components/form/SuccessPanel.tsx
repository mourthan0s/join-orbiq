"use client";

import { useEffect, useRef, useState } from "react";
import type { VenueViewModel } from "@/features/venues/view-model";
import { getDictionary, interpolate } from "@/lib/i18n/translations";
import { track } from "@/lib/analytics";
import type { AnalyticsProps } from "@/lib/analytics/events";
import { StarIcon } from "@/components/venue/JoinExperience";
import type { SubmitOutcome } from "./JoinForm";

export function SuccessPanel({
  vm,
  analyticsProps,
  outcome,
}: {
  vm: VenueViewModel;
  analyticsProps: AnalyticsProps;
  outcome: SubmitOutcome;
}) {
  const t = getDictionary(vm.locale);
  const showReview = vm.reviewCtaMode !== "HIDDEN" && Boolean(vm.googleReviewUrl);

  const [countdown, setCountdown] = useState<number | null>(
    vm.autoRedirect.enabled && vm.successRedirectUrl ? vm.autoRedirect.delaySec : null
  );
  const redirectStarted = useRef(false);

  useEffect(() => {
    if (countdown === null) return;
    if (!redirectStarted.current) {
      redirectStarted.current = true;
      track("automatic_redirect_started", analyticsProps);
    }
    if (countdown <= 0) {
      track("automatic_redirect_completed", analyticsProps);
      if (vm.successRedirectUrl) window.location.assign(vm.successRedirectUrl);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  return (
    <div className="flex flex-col items-center pb-2 text-center" aria-live="polite">
      <svg width="72" height="72" viewBox="0 0 56 56" fill="none" aria-hidden className="mt-2">
        <circle className="check-circle" cx="28" cy="28" r="26" stroke="var(--v-accent)" strokeWidth="2.5" />
        <path
          className="check-mark"
          d="M17 29.5 24.5 37 39 21"
          stroke="var(--v-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h2 className="mt-4 text-2xl font-bold">{t.successTitle}</h2>
      <p className="mt-1.5 text-[0.9375rem] opacity-75">
        {outcome === "created" ? t.successBody : t.alreadyRegistered}
      </p>

      <div className="mt-7 flex w-full flex-col gap-3">
        {showReview && vm.googleReviewUrl && (
          <a
            href={vm.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`cta-base ${vm.ctaClass}`}
            onClick={() => track("google_review_clicked", analyticsProps)}
          >
            <StarIcon />
            {t.reviewCtaPrimary}
          </a>
        )}

        {vm.websiteUrl && (
          <a
            href={vm.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-secondary"
            onClick={() => track("website_redirect_clicked", analyticsProps)}
          >
            {t.continueToWebsite}
          </a>
        )}

        {vm.instagramUrl && (
          <a
            href={vm.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-secondary"
            onClick={() => track("instagram_redirect_clicked", analyticsProps)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
            </svg>
            {t.continueToInstagram}
          </a>
        )}
      </div>

      {countdown !== null && countdown > 0 && (
        <p className="mt-5 text-sm opacity-70">
          {interpolate(t.redirectingIn, { seconds: countdown })}{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => setCountdown(null)}
          >
            {t.cancelRedirect}
          </button>
        </p>
      )}
    </div>
  );
}
