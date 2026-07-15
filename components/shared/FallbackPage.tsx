import Link from "next/link";

/**
 * ORBIQ-branded neutral screen for invalid/inactive venues, 404s and the
 * root domain. Deliberately quiet: no venue directory, no marketing.
 */
export function FallbackPage({
  title,
  body,
  showPrivacyLinks = true,
}: {
  title: string;
  body: string;
  showPrivacyLinks?: boolean;
}) {
  return (
    <div className="venue-shell">
      <div className="atmosphere atm-allday" aria-hidden />
      <div className="venue-content flex min-h-dvh flex-col">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10 text-center safe-top">
          <div className="medallion" aria-hidden>
            OQ
          </div>
          <h1 className="display-serif mt-8 text-balance text-3xl leading-tight">{title}</h1>
          <p className="mt-4 max-w-xs text-pretty text-[0.9375rem] leading-relaxed opacity-75">
            {body}
          </p>
        </main>
        <footer className="flex flex-col items-center gap-2 px-6 pb-5 text-center text-xs opacity-60 safe-bottom">
          {showPrivacyLinks && (
            <p>
              <Link href="/privacy" className="underline underline-offset-2">
                Πολιτική Απορρήτου
              </Link>
              {" · "}
              <Link href="/terms" className="underline underline-offset-2">
                Όροι Χρήσης
              </Link>
            </p>
          )}
          <p>
            Powered by{" "}
            <a
              href="https://orbi-q.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold tracking-wide"
            >
              ORBIQ
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
