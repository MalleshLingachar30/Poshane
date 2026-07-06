"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Vision", href: "#vision" },
  { label: "Scale & Reach", href: "#scale" },
  { label: "Governance", href: "#governance" },
  { label: "Guardianship", href: "#guardianship" },
  { label: "Digital Platform", href: "#platform" },
  { label: "Partners", href: "#partners" },
  { label: "Contact", href: "#contact" },
];

/**
 * SiteHeader — sticky institutional masthead.
 *
 * Left: the Poshane / ಪೋಷಣೆ identity with the KSLSA attribution.
 * Right: in-page anchors and a discreet "Command Center" pill styled as a
 * secure portal entry, linking to the /command-center placeholder route.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 md:px-8">
        {/* Identity */}
        <Link
          href="#top"
          aria-label="Poshane home"
          className="flex items-center"
          onClick={closeMenu}
        >
          <span className="flex items-center gap-1">
            <span className="font-kannada text-xl font-semibold leading-none text-green">
              ಪೋಷಣೆ
            </span>
            <Image
              src="/poshane-mark.png"
              alt=""
              width={231}
              height={256}
              priority
              className="-my-1 h-11 w-auto -translate-y-2 shrink-0"
            />
            <span className="-ml-4 font-serif text-xl leading-none tracking-tight text-ink">
              Poshane
            </span>
          </span>
          <span className="ml-3 hidden border-l border-line pl-3 text-[0.65rem] font-semibold uppercase tracking-kicker text-ink-soft sm:inline">
            KSLSA
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.8rem] font-medium tracking-wide text-ink-soft transition-colors hover:text-green"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/command-center"
            className="flex items-center gap-2 rounded-full border border-navy/20 bg-navy px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-kicker text-paper transition-colors hover:bg-navy-2"
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-gold-soft"
            />
            Command Center
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded border border-line text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            {open ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary mobile"
          className="border-t border-line bg-paper px-5 pb-6 pt-3 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-green"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-3">
              <Link
                href="/command-center"
                onClick={closeMenu}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-kicker text-paper"
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-gold-soft"
                />
                Command Center
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
