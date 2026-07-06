"use client";

import { useEffect, useRef, useState } from "react";

/** The hero's decorative canopy, revealed once when it enters the viewport. */
export default function CanopyDivider() {
  const ref = useRef<SVGSVGElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={`canopy-divider pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full opacity-[0.07] ${
        visible ? "is-visible" : ""
      }`}
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
    >
      <path
        d="M0 200 L0 140 Q60 90 120 140 Q180 80 240 130 Q300 70 360 125 Q420 85 480 135 Q540 75 600 128 Q660 88 720 138 Q780 72 840 126 Q900 84 960 134 Q1020 78 1080 130 Q1140 92 1200 140 L1200 200 Z"
        fill="var(--green)"
      />
    </svg>
  );
}
