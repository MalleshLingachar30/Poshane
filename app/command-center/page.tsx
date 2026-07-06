import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Command Center — Poshane (ಪೋಷಣೆ)",
  description:
    "Secure portal for the Poshane programme's Command & Control Center.",
};

/**
 * /command-center — placeholder route for the secure portal.
 *
 * The authenticated proceedings and action-points repository will later be
 * mounted at this route. It is intentionally a clean stub: a dignified
 * holding page consistent with the site's design, with no authentication
 * layer yet.
 */
export default function CommandCenterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center">
      <p className="flex items-baseline gap-3">
        <span className="font-kannada text-2xl font-semibold text-gold-soft">
          ಪೋಷಣೆ
        </span>
        <span className="font-serif text-2xl tracking-tight text-paper">
          Poshane
        </span>
      </p>

      <div
        aria-hidden="true"
        className="mt-10 flex h-16 w-16 items-center justify-center rounded-full border border-gold-soft/40"
      >
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
          <rect
            x="3"
            y="12"
            width="18"
            height="13"
            rx="2"
            stroke="var(--gold-soft)"
            strokeWidth="1.5"
          />
          <path
            d="M7 12V9a5 5 0 0 1 10 0v3"
            stroke="var(--gold-soft)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <h1 className="mt-8 font-serif text-3xl text-paper md:text-4xl">
        Command &amp; Control Center
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/70">
        Secure portal — coming soon. Access to the programme&rsquo;s live
        dashboards, proceedings and action points will be available here to
        authorised personnel.
      </p>

      <Link
        href="/"
        className="mt-10 rounded-sm border border-paper/30 px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:border-gold-soft hover:text-gold-soft"
      >
        Return to the Programme site
      </Link>
    </main>
  );
}
