"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CountUp — animates a number from 0 to `value` when it enters the viewport.
 *
 * Numbers are formatted with Indian digit grouping (e.g. 12,47,580) via
 * Intl.NumberFormat("en-IN"). Under `prefers-reduced-motion`, the final
 * value is shown immediately with no animation.
 */
const formatter = new Intl.NumberFormat("en-IN");

export default function CountUp({
  value,
  duration = 1800,
  suffix = "",
  className = "",
}: {
  /** Final value to count up to. */
  value: number;
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Optional suffix rendered after the number (e.g. "%"). */
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (started.current) return;
      started.current = true;

      if (prefersReduced) {
        setDisplay(value);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        // Ease-out cubic — settles gently into the final figure.
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(eased * value));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className} aria-label={`${formatter.format(value)}${suffix}`}>
      {formatter.format(display)}
      {suffix}
    </span>
  );
}
