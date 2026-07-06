"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveal — a small scroll-reveal wrapper.
 *
 * Children fade and rise gently into place the first time they enter the
 * viewport. The visual effect lives entirely in CSS (`.reveal` in
 * globals.css), which also disables it under `prefers-reduced-motion`.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Optional stagger delay in milliseconds. */
  delay?: number;
  /** Rendered element — defaults to a div. */
  as?: "div" | "section" | "figure" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If IntersectionObserver is unavailable, show content immediately.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — ref type varies with the rendered tag; safe for our usage.
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
