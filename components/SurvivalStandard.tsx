"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Reveal from "./Reveal";

/**
 * SurvivalStandard — the 95% survival standard.
 *
 * Contains the animated survival-rate gauge (illustrative, native SVG) and
 * the system-spine flow — the programme's signature conceptual thread:
 * validated nurseries → the right sapling → site-matched model →
 * committed guardian → surprise audit → 95% survival.
 *
 * Client component: the gauge arc animates when it scrolls into view.
 * Under prefers-reduced-motion the gauge renders at its final state.
 */

const SPINE_STEPS = [
  "Validated nurseries",
  "The right sapling",
  "A site-matched planting model",
  "A committed guardian",
  "Surprise ground audits",
  "95% survival",
];

/* Gauge geometry — a 240° arc. */
const GAUGE_R = 84;
const GAUGE_SWEEP_DEG = 240;
const GAUGE_ARC_LEN = (GAUGE_SWEEP_DEG / 360) * 2 * Math.PI * GAUGE_R;
const TARGET = 0.95;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function SurvivalGauge() {
  const ref = useRef<SVGSVGElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setActive(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
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
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Arc runs from -120° to +120° around the top of the dial.
  const track = arcPath(110, 112, GAUGE_R, -120, 120);
  const filledLen = GAUGE_ARC_LEN * TARGET;

  return (
    <svg
      ref={ref}
      viewBox="0 0 220 200"
      role="img"
      aria-label="Illustrative gauge showing the 95 percent survival-rate target"
      className="w-full max-w-[280px]"
    >
      {/* Track */}
      <path
        d={track}
        fill="none"
        stroke="var(--line)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Fill — gold is reserved for KPIs */}
      <path
        className="fill-animates"
        d={track}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={GAUGE_ARC_LEN}
        strokeDashoffset={active ? GAUGE_ARC_LEN - filledLen : GAUGE_ARC_LEN}
      />
      <text
        x="110"
        y="112"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontSize="44"
        fill="var(--ink)"
      >
        95%
      </text>
      <text
        x="110"
        y="136"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="10"
        letterSpacing="2"
        fill="var(--ink-soft)"
      >
        SURVIVAL TARGET
      </text>
      <text
        x="110"
        y="188"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="9.5"
        fontStyle="italic"
        fill="var(--bark)"
      >
        Illustrative — verified figures via ground audit.
      </text>
    </svg>
  );
}

function SystemSpine() {
  const ref = useRef<HTMLOListElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <ol
      ref={ref}
      className={`system-spine flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-0 ${
        active ? "is-visible" : ""
      }`}
    >
      {SPINE_STEPS.map((step, i) => {
        const isFinal = i === SPINE_STEPS.length - 1;
        const stagger = { "--spine-index": i } as CSSProperties;

        return (
          <li
            key={step}
            className="system-spine-step flex items-center gap-3 md:flex-1 md:gap-0"
            style={stagger}
          >
            <span
              className={
                isFinal
                  ? "w-full rounded-sm border border-gold bg-gold/10 px-4 py-3 text-center text-sm font-semibold text-ink"
                  : "w-full rounded-sm border border-green/30 bg-green-tint px-4 py-3 text-center text-sm font-medium text-green"
              }
            >
              {step}
            </span>
            {!isFinal && (
              <span
                aria-hidden="true"
                className="system-spine-connector hidden shrink-0 px-1.5 text-green md:inline"
              >
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path
                    d="M0 6h13M9 1l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function SurvivalStandard() {
  return (
    <section id="survival" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            The Survival Standard
          </p>
        </Reveal>

        <div className="mt-8 grid items-center gap-12 md:grid-cols-12">
          <div className="space-y-6 md:col-span-7">
            <Reveal>
              <h2 className="font-serif text-3xl leading-snug text-ink md:text-4xl">
                <strong className="font-semibold">95% survival.</strong> It is
                the programme&rsquo;s defining standard, and its most demanding
                one.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="max-w-measure text-base leading-relaxed text-ink-soft">
                Most plantation efforts count saplings at the moment they enter
                the ground. Poshane counts them at the end of the growing cycle
                — alive, established and thriving. That single shift in
                measurement changes everything about how the programme is
                designed.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="max-w-measure text-base leading-relaxed text-ink-soft">
                Survival is engineered from the very beginning:
              </p>
            </Reveal>
          </div>

          <Reveal className="flex justify-center md:col-span-5" delay={200}>
            <SurvivalGauge />
          </Reveal>
        </div>

        {/* System spine — signature horizontal flow */}
        <Reveal delay={120}>
          <figure
            className="mt-14"
            role="img"
            aria-label="The system spine: validated nurseries, the right sapling, a site-matched planting model, a committed guardian, surprise ground audits, ninety-five percent survival"
          >
            <SystemSpine />
            <figcaption className="sr-only">
              Each link in the chain protects the one that follows.
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-10 max-w-measure text-base leading-relaxed text-ink-soft">
            Each link in that chain exists to protect the one that follows. A
            95% target is credible only because the entire system is built
            around it — not bolted on after the fact.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
