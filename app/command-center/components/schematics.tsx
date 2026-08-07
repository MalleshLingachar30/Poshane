"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SCHEMATICS,
  SCHEMATIC_SECTIONS,
  firstSchematicIdForSection,
  schematicSrc,
  type SchematicSectionId,
} from "../schematics";

/* ============================================================================
   FRAME 8 — SYSTEM ARCHITECTURE

   A presenter's frame. The architecture documents in public/schematics are
   shown one at a time in an iframe, with a section rail above it.

   Why an iframe rather than inline SVG: the diagrams are ~350 KB of hand-drawn
   markup carrying their own type scale and their own <marker> ids. Inlined,
   every diagram would ship to every visitor whether or not this frame is ever
   opened, and two diagrams sharing a document would silently steal each other's
   arrowheads. A separate browsing context per diagram costs one request and
   removes both problems.

   The frame is built for a room, not a desk:
     · ← / → step between diagrams without reaching for the strip
     · F toggles fullscreen on the viewer only, so the diagram fills a projector
     · the iframe is sized to its content via postMessage, so there is never a
       nested scrollbar to hunt for mid-sentence
   ==========================================================================*/

const FALLBACK_HEIGHT = 900;

type Frame8Props = {
  requestedSection?: SchematicSectionId;
  onSectionChange?: (section: SchematicSectionId) => void;
};

export function Frame8({ requestedSection = "walkthrough", onSectionChange }: Frame8Props) {
  const [activeId, setActiveId] = useState(() => firstSchematicIdForSection(requestedSection));
  /* Heights are cached per diagram. Without this, stepping back to a diagram
     already seen would collapse the frame to the fallback height and bounce the
     page until the reporter fires again. */
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  /* The message handler below is registered once, so it reads the current
     diagram through a ref rather than closing over a stale activeId. */
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const index = SCHEMATICS.findIndex((s) => s.id === activeId);
  const active = SCHEMATICS[index] ?? SCHEMATICS[0];
  const sectionItems = SCHEMATICS.filter((item) => item.section === active.section);

  const select = useCallback((id: string) => {
    setActiveId((current) => {
      if (current === id) return current;
      setLoading(true);
      return id;
    });
  }, []);

  const step = useCallback(
    (delta: number) => {
      const next = SCHEMATICS[index + delta];
      if (next) select(next.id);
    },
    [index, select]
  );

  const selectSection = useCallback(
    (section: SchematicSectionId) => {
      const nextId = firstSchematicIdForSection(section);
      select(nextId);
    },
    [select]
  );

  useEffect(() => {
    if (active.section === requestedSection) return;
    selectSection(requestedSection);
  }, [active.section, requestedSection, selectSection]);

  useEffect(() => {
    onSectionChange?.(active.section);
  }, [active.section, onSectionChange]);

  /* Height handshake with the embedded document. The reporter injected by
     scripts/split-schematics.mjs posts on load, on resize and on any observed
     mutation of the root element. */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; height?: number } | null;
      if (!data || data.type !== "poshane-schematic-height") return;
      const height = Number(data.height);
      if (!Number.isFinite(height) || height < 200) return;
      setHeights((current) =>
        current[activeIdRef.current] === height
          ? current
          : { ...current, [activeIdRef.current]: height }
      );
      setLoading(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = viewerRef.current;
    if (!node) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else node.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Keyboard stepping. Ignored while focus sits in the iframe — the animation
     document binds its own arrow keys for its nine steps — and while any text
     input has focus. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "IFRAME" || target?.isContentEditable) return;
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
      else if (event.key === "f" || event.key === "F") { event.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, toggleFullscreen]);

  /* Keeps the selected chip in view when stepping with the keyboard — otherwise
     the strip silently scrolls out from under the presenter. */
  useEffect(() => {
    const chip = stripRef.current?.querySelector<HTMLElement>(`[data-schematic="${activeId}"]`);
    chip?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [activeId]);

  const height = heights[activeId] ?? FALLBACK_HEIGHT;

  return (
    <section className="frame on" aria-label="System Architecture">
      <div className="frame-head">
        <h2>System Architecture</h2>
        <span className="fdesc">
          System architecture baseline v0.9 — {SCHEMATICS.length} documents · use ← → to step, F for fullscreen
        </span>
      </div>

      {/* ---------- section menu plus active section chips ---------- */}
      <div className="schematic-strip">
        <div className="schematic-sections" aria-label="System architecture sections">
          {SCHEMATIC_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`ssection${section.id === active.section ? " active" : ""}`}
              aria-pressed={section.id === active.section}
              onClick={() => selectSection(section.id)}
              title={section.blurb}
            >
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <div className="schematic-strip-note">
          <span className="sglabel">
            {SCHEMATIC_SECTIONS.find((section) => section.id === active.section)?.label}
          </span>
          <span className="sgmeta">
            {SCHEMATIC_SECTIONS.find((section) => section.id === active.section)?.blurb}
          </span>
        </div>

        <div className="sgitems" ref={stripRef} role="tablist" aria-label="Architecture documents">
          {sectionItems.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              data-schematic={s.id}
              aria-selected={s.id === activeId}
              className={`schip${s.id === activeId ? " active" : ""}${s.id === "flow" ? " anim" : ""}`}
              onClick={() => select(s.id)}
              title={s.title}
            >
              <span className="sno">{s.no}</span>
              <span className="slabel">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- selected diagram ---------- */}
      <div className={`schematic-viewer${fullscreen ? " fs" : ""}`} ref={viewerRef}>
        <div className="sv-head">
          <div className="sv-title">
            <h3>
              {active.no !== "▶" && <span className="sv-no">{active.no}</span>}
              {active.title}
            </h3>
            <div className="sv-ref">{active.ref}</div>
          </div>
          <div className="sv-tools">
            <button type="button" onClick={() => step(-1)} disabled={index <= 0} aria-label="Previous diagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m14.5 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span className="sv-count">{index + 1} / {SCHEMATICS.length}</span>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={index >= SCHEMATICS.length - 1}
              aria-label="Next diagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m9.5 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={toggleFullscreen} aria-label="Toggle fullscreen" className="wide">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                {fullscreen
                  ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
              {fullscreen ? "Exit" : "Present"}
            </button>
            <a
              className="wide"
              href={schematicSrc(active.id)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open diagram in a new tab"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}><path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Open
            </a>
          </div>
        </div>

        <p className="sv-cue">{active.cue}</p>

        <div className="sv-stage">
          {loading && <div className="sv-loading" role="status">Loading diagram…</div>}
          <iframe
            key={active.id}
            src={schematicSrc(active.id)}
            title={active.title}
            className="sv-frame"
            style={{ height }}
            onLoad={() => setLoading(false)}
            /* Same-origin static documents; the sandbox keeps scripts to the
               height reporter and the animation's own controls, and forbids
               navigation of the parent console. */
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>

        <div className="sv-foot">
          <span>Architecture baseline v0.9 — issued for review. Illustrative of system structure.</span>
          <span>Poshane · Institution of Agroforestry Farmers and Technologists</span>
        </div>
      </div>
    </section>
  );
}
