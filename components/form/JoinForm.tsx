"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VenueViewModel } from "@/features/venues/view-model";
import { getDictionary, interpolate, type TranslationKey } from "@/lib/i18n/translations";
import { track } from "@/lib/analytics";
import type { AnalyticsProps } from "@/lib/analytics/events";

export type SubmitOutcome = "created" | "updated" | "replayed";

type FieldName = "fullName" | "email" | "phone" | "birthday" | "termsConsent" | "marketingConsent";

const errorKeyByField: Record<string, TranslationKey> = {
  fullName: "errorFullName",
  email: "errorEmail",
  phone: "errorPhone",
  birthday: "errorBirthday",
  termsConsent: "errorTermsConsent",
  marketingConsent: "errorMarketingConsent",
  form: "errorForm",
};

type Values = {
  fullName: string;
  email: string;
  phone: string;
  birthday: string;
  termsConsent: boolean;
  marketingConsent: boolean;
};

const emptyValues: Values = {
  fullName: "",
  email: "",
  phone: "",
  birthday: "",
  termsConsent: false,
  marketingConsent: false,
};

function validateClient(values: Values): Partial<Record<FieldName, true>> {
  const errors: Partial<Record<FieldName, true>> = {};
  if (values.fullName.trim().length < 2) errors.fullName = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = true;
  const phoneDigits = values.phone.replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) errors.phone = true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.birthday)) errors.birthday = true;
  if (!values.termsConsent) errors.termsConsent = true;
  if (!values.marketingConsent) errors.marketingConsent = true;
  return errors;
}

export function JoinForm({
  vm,
  analyticsProps,
  onClose,
  onSuccess,
}: {
  vm: VenueViewModel;
  analyticsProps: AnalyticsProps;
  onClose: () => void;
  onSuccess: (outcome: SubmitOutcome) => void;
}) {
  const t = getDictionary(vm.locale);
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<FieldName, true>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<TranslationKey | null>(null);
  const startedTracked = useRef(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  // One idempotency key per form session: retries after a network error
  // replay the same registration instead of duplicating it.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    firstFieldRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setField = (name: FieldName, value: string | boolean) => {
    if (!startedTracked.current) {
      startedTracked.current = true;
      track("form_started", analyticsProps);
    }
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return; // double-submit guard
    setGlobalError(null);
    track("form_submit_clicked", analyticsProps);

    const clientErrors = validateClient(values);
    if (Object.keys(clientErrors).some((k) => clientErrors[k as FieldName])) {
      setErrors(clientErrors);
      track("form_validation_error", analyticsProps);
      return;
    }

    setSubmitting(true);
    try {
      const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueSlug: vm.venueSlug,
          locationSlug: vm.locationSlug ?? undefined,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          birthday: values.birthday,
          termsConsent: values.termsConsent,
          marketingConsent: values.marketingConsent,
          locale: vm.locale,
          source: vm.tracking.source ?? undefined,
          campaign: vm.tracking.campaign ?? undefined,
          qr: vm.tracking.qr ?? undefined,
          idempotencyKey,
          website: honeypot,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { outcome?: SubmitOutcome };
        track("registration_success", analyticsProps);
        onSuccess(data.outcome ?? "created");
        return;
      }

      track("registration_failed", analyticsProps);
      if (res.status === 429) {
        setGlobalError("errorRateLimited");
      } else if (res.status === 400) {
        const data = (await res.json().catch(() => null)) as { fields?: Record<string, string> } | null;
        if (data?.fields) {
          const serverErrors: Partial<Record<FieldName, true>> = {};
          for (const key of Object.keys(data.fields)) {
            if (key in errorKeyByField) serverErrors[key as FieldName] = true;
          }
          setErrors(serverErrors);
          track("form_validation_error", analyticsProps);
        } else {
          setGlobalError("errorForm");
        }
      } else {
        setGlobalError("errorServer");
      }
    } catch {
      // Network failure — values stay in state, retry reuses the idempotency key.
      track("registration_failed", analyticsProps);
      setGlobalError("errorNetwork");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldError = (name: FieldName) =>
    errors[name] ? t[errorKeyByField[name]] : null;

  const maxBirthday = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t.formTitle}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="grid h-9 w-9 place-items-center rounded-full border border-current/20 opacity-70"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {globalError && (
        <p role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm">
          {t[globalError]}
        </p>
      )}

      <div className="flex flex-col gap-4 text-left">
        <Field label={t.fullNameLabel} error={fieldError("fullName")} id="fullName">
          <input
            ref={firstFieldRef}
            id="fullName"
            name="fullName"
            type="text"
            className="field-input"
            placeholder={t.fullNamePlaceholder}
            autoComplete="name"
            value={values.fullName}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            onChange={(e) => setField("fullName", e.target.value)}
          />
        </Field>

        <Field label={t.emailLabel} error={fieldError("email")} id="email">
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            className="field-input"
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            value={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={(e) => setField("email", e.target.value)}
          />
        </Field>

        <Field label={t.phoneLabel} error={fieldError("phone")} id="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className="field-input"
            placeholder={t.phonePlaceholder}
            autoComplete="tel"
            value={values.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </Field>

        <Field label={t.birthdayLabel} error={fieldError("birthday")} id="birthday">
          <input
            id="birthday"
            name="birthday"
            type="date"
            className="field-input"
            autoComplete="bday"
            max={maxBirthday}
            value={values.birthday}
            aria-invalid={Boolean(errors.birthday)}
            aria-describedby={errors.birthday ? "birthday-error" : undefined}
            onChange={(e) => setField("birthday", e.target.value)}
          />
        </Field>

        {/* Honeypot — visually hidden, tabbed over, ignored by humans */}
        <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <Consent
          id="termsConsent"
          checked={values.termsConsent}
          error={fieldError("termsConsent")}
          onChange={(v) => setField("termsConsent", v)}
        >
          {interpolateJsx(t.termsConsentLabel, {
            terms: (
              <a key="terms" href="/terms" target="_blank" className="underline underline-offset-2">
                {t.termsLinkText}
              </a>
            ),
            privacy: (
              <a key="privacy" href="/privacy" target="_blank" className="underline underline-offset-2">
                {t.privacyLinkText}
              </a>
            ),
          })}
        </Consent>

        <Consent
          id="marketingConsent"
          checked={values.marketingConsent}
          error={fieldError("marketingConsent")}
          onChange={(v) => setField("marketingConsent", v)}
        >
          {interpolate(t.marketingConsentLabel, { venue: vm.venueName })}
        </Consent>

        <button type="submit" className={`cta-base ${vm.ctaClass} mt-1`} disabled={submitting}>
          {submitting ? (
            <>
              <Spinner />
              {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  id,
  children,
}: {
  label: string;
  error: string | null;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold opacity-85">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[0.8125rem] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Consent({
  id,
  checked,
  error,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  error: string | null;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-relaxed opacity-90">
        <input
          id={id}
          type="checkbox"
          className="checkbox-input"
          checked={checked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[0.8125rem] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Interpolates {key} placeholders with JSX nodes (for inline consent links). */
function interpolateJsx(
  template: string,
  nodes: Record<string, React.ReactNode>
): React.ReactNode[] {
  const parts = template.split(/(\{\w+\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{(\w+)\}$/);
    if (match && nodes[match[1]] !== undefined) return <span key={i}>{nodes[match[1]]}</span>;
    return part;
  });
}
