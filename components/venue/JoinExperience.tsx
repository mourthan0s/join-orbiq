"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VenueViewModel } from "@/features/venues/view-model";
import { getDictionary } from "@/lib/i18n/translations";
import { track } from "@/lib/analytics";
import type { AnalyticsProps } from "@/lib/analytics/events";
import { JoinForm, type SubmitOutcome } from "@/components/form/JoinForm";
import { SuccessPanel } from "@/components/form/SuccessPanel";

type Stage = "idle" | "form" | "success";

/**
 * All transitions are CSS animations (see globals.css) rather than JS-driven
 * motion: they stay smooth on low-end devices and can never strand the UI
 * half-visible when the browser throttles requestAnimationFrame.
 */
export function JoinExperience({ vm }: { vm: VenueViewModel }) {
  const t = getDictionary(vm.locale);
  const [stage, setStage] = useState<Stage>("idle");
  const [closing, setClosing] = useState(false);
  const [outcome, setOutcome] = useState<SubmitOutcome>("created");
  const viewTracked = useRef(false);

  const analyticsProps: AnalyticsProps = {
    venueId: vm.venueId,
    venueSlug: vm.venueSlug,
    locationId: vm.locationId ?? undefined,
    locationSlug: vm.locationSlug ?? undefined,
    source: vm.tracking.source ?? undefined,
    campaign: vm.tracking.campaign ?? undefined,
    qrCodeId: vm.tracking.qr ?? undefined,
    locale: vm.locale,
  };

  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      track("venue_page_view", analyticsProps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (stage !== "idle") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [stage]);

  const openForm = useCallback(() => {
    track("join_cta_clicked", analyticsProps);
    setClosing(false);
    setStage("form");
    track("form_opened", analyticsProps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeSheet = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setStage("idle");
      setClosing(false);
    }, 200);
  }, []);

  const onSuccess = useCallback((o: SubmitOutcome) => {
    setOutcome(o);
    setStage("success");
  }, []);

  return (
    <>
      <div className="reveal-up reveal-d3 mt-9 w-full">
        <button type="button" className={`cta-base ${vm.ctaClass}`} onClick={openForm}>
          {t.joinCta}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.8125rem] opacity-65">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t.takesSeconds}
        </p>

        {vm.reviewCtaMode === "ALWAYS" && vm.googleReviewUrl && (
          <a
            href={vm.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm underline underline-offset-4 opacity-70"
            onClick={() => track("google_review_clicked", analyticsProps)}
          >
            <StarIcon />
            {t.reviewCtaSubtle}
          </a>
        )}
      </div>

      {stage !== "idle" && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
          <div
            className={`sheet-backdrop absolute inset-0 bg-black/60 ${closing ? "closing" : ""}`}
            onClick={stage === "form" ? closeSheet : undefined}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={stage === "form" ? t.formTitle : t.successTitle}
            className={`sheet-panel sheet-enter relative z-10 max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl px-6 pt-3 pb-6 safe-bottom sm:rounded-3xl ${closing ? "closing" : ""}`}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-current opacity-20 sm:hidden" aria-hidden />

            {stage === "form" ? (
              <JoinForm
                vm={vm}
                analyticsProps={analyticsProps}
                onClose={closeSheet}
                onSuccess={onSuccess}
              />
            ) : (
              <SuccessPanel vm={vm} analyticsProps={analyticsProps} outcome={outcome} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
    </svg>
  );
}
