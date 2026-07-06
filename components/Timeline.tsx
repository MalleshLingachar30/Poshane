"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

/**
 * Timeline — the eight-year arc, 2026–2034.
 *
 * Milestones: Foundation (2026), Planting Yr 1–5 (2027–2031),
 * Survival Assurance (2032), Programme Close (2034).
 *
 * The strip's fill animates left-to-right when it scrolls into view,
 * consistent with the phased strip in Scale & Reach. Under
 * prefers-reduced-motion, it renders fully filled with no animation.
 */

const MILESTONES = [
  { year: "2026", label: "Foundation" },
  { year: "2027", label: "Planting Yr 1" },
  { year: "2028", label: "Planting Yr 2" },
  { year: "2029", label: "Planting Yr 3" },
  { year: "2030", label: "Planting Yr 4" },
  { year: "2031", label: "Planting Yr 5" },
  { year: "2032", label: "Survival Assurance" },
  { year: "2034", label: "Programme Close" },
];

export default function Timeline() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="timeline" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            The Eight-Year Arc · 2026–2034
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-8 max-w-3xl font-serif text-3xl leading-snug text-ink md:text-4xl">
            One year to prepare. Five years to plant. Two years to ensure it
            endures.
          </h2>
        </Reveal>

        <div ref={ref} className="mt-16 overflow-x-auto pb-2">
          <div className="min-w-[720px]">
            {/* Track */}
            <div className="relative h-1.5 rounded-full bg-line">
              <div
                className="fill-animates absolute inset-y-0 left-0 rounded-full bg-green"
                style={{ width: active ? "100%" : "0%" }}
              />
            </div>

            {/* Milestones */}
            <ol className="mt-0 grid grid-cols-8">
              {MILESTONES.map((m, i) => (
                <li key={m.year} className="relative pt-6">
                  {/* Node */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-[7px] left-0 h-4 w-4 rounded-full border-2 border-green bg-paper transition-colors duration-700"
                    style={{
                      backgroundColor: active ? "var(--green)" : "var(--paper)",
                      transitionDelay: `${i * 140}ms`,
                    }}
                  />
                  <p className="font-serif text-lg text-ink">{m.year}</p>
                  <p className="mt-1 pr-3 text-[0.72rem] font-medium uppercase tracking-wide text-ink-soft">
                    {m.label}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
