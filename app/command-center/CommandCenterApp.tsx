"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Frame1, Frame2, Frame3, Frame4, Frame5, Frame6 } from "./components/frames";
import { Frame7 } from "./components/financials";
import { Frame8 } from "./components/schematics";
import type { SchematicSectionId } from "./schematics";
import { TalukFrame } from "./components/taluk-frame";
import { TALUKS, TALUKS_BY_DISTRICT, firstTalukCode } from "./taluks";
import PoshaneMitra from "./mitra/PoshaneMitra";
import {
  MITRA_UI_ACTION_EVENT,
  type MitraUiActionEvent,
} from "./mitra/ui-action-event";
import type {
  CommandCenterFilterSet,
  CommandCenterFrameId,
  CommandCenterUiAction,
} from "./mitra/types";

type FrameId = CommandCenterFrameId;

type CommandCenterAppProps = {
  adminEmail: string;
  adminName: string;
  logoutSlot?: React.ReactNode;
};

const ARCHITECTURE_SUBNAV: { id: SchematicSectionId; label: string }[] = [
  { id: "walkthrough", label: "Walkthrough" },
  { id: "data-flow", label: "Data Flow" },
  { id: "controls", label: "Controls" },
  { id: "gis", label: "GIS" },
];

const NAV: { id: FrameId; label: string; icon: React.ReactNode; secure?: boolean }[] = [
  { id: "f1", label: "State Overview", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={7.5} height={7.5} rx={1.5} /><rect x={13.5} y={3} width={7.5} height={7.5} rx={1.5} /><rect x={3} y={13.5} width={7.5} height={7.5} rx={1.5} /><rect x={13.5} y={13.5} width={7.5} height={7.5} rx={1.5} /></svg> },
  { id: "f2", label: "District Drill-Down", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11Z" /><circle cx={12} cy={10} r={2.6} /></svg> },
  { id: "f9", label: "Taluk Drill-Down", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 5.5h6.5v5H4zM13.5 5.5H20v5h-6.5zM8.75 15H15v5H8.75z" /><path d="M7.25 10.5V13h9.5v-2.5M11.9 13v2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: "f3", label: "Land & Ownership", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" /><path d="M3 13l9 4.5 9-4.5" /></svg> },
  { id: "f4", label: "Stakeholders", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={8.5} cy={9} r={3} /><circle cx={16.5} cy={10.5} r={2.4} /><path d="M3.5 19c.5-3 2.6-4.6 5-4.6s4.5 1.6 5 4.6M13.8 18.6c.4-2.2 1.7-3.4 3.4-3.4 1.6 0 2.9 1 3.3 3.1" /></svg> },
  { id: "f5", label: "Species Planning", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 21V10M12 10c0-4 2.8-6.5 7-7-.3 4.4-2.6 7-7 7ZM12 13c0-3-2.1-5-5.3-5.3.2 3.4 2 5.3 5.3 5.3Z" /></svg> },
  { id: "f6", label: "Monitoring & Audit", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={11} cy={11} r={6.5} /><path d="m20 20-4-4M8.5 11l1.8 1.8 3.4-3.6" /></svg> },
  { id: "f8", label: "System Architecture", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={6.5} height={5} rx={1.2} /><rect x={14.5} y={3} width={6.5} height={5} rx={1.2} /><rect x={8.75} y={16} width={6.5} height={5} rx={1.2} /><path d="M6.25 8v3.5h11.5V8M12 11.5V16" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: "f7", label: "Financials", secure: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={4.5} y={10} width={15} height={10} rx={2} /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /><circle cx={12} cy={15} r={1.4} /></svg> },
];

export default function CommandCenterApp({
  adminEmail,
  adminName,
  logoutSlot,
}: CommandCenterAppProps) {
  const [frame, setFrame] = useState<FrameId>("f1");
  const [architectureSection, setArchitectureSection] = useState<SchematicSectionId>("walkthrough");
  const [district, setDistrict] = useState("BLG");
  const [taluk, setTaluk] = useState(() => firstTalukCode("BLG"));
  const [voiceFilters, setVoiceFilters] = useState<CommandCenterFilterSet>({});
  const [voiceHighlight, setVoiceHighlight] = useState("");
  const initials = adminName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const goDistrict = (code: string) => { setDistrict(code); setFrame("f2"); };
  const goTaluk = (talukCode: string) => {
    const selectedTaluk = TALUKS.find((item) => item.code === talukCode);
    if (selectedTaluk) setDistrict(selectedTaluk.districtCode);
    setTaluk(talukCode);
    setFrame("f9");
  };
  const openTalukView = () => {
    if (!(TALUKS_BY_DISTRICT[district] ?? []).some((item) => item.code === taluk)) {
      setTaluk(firstTalukCode(district));
    }
    setFrame("f9");
  };
  const openSystemArchitecture = (section: SchematicSectionId) => {
    setArchitectureSection(section);
    setFrame("f8");
  };

  const applyMitraAction = useCallback((action: CommandCenterUiAction) => {
    if (action.frame) setFrame(action.frame);
    if (action.districtCode) setDistrict(action.districtCode);
    if (action.talukCode) setTaluk(action.talukCode);
    if (action.filters) setVoiceFilters((current) => ({ ...current, ...action.filters }));
    if (action.highlightId) setVoiceHighlight(action.highlightId);
  }, []);

  useEffect(() => {
    const handleMitraUiAction = (event: Event) => {
      applyMitraAction((event as MitraUiActionEvent).detail);
    };

    window.addEventListener(MITRA_UI_ACTION_EVENT, handleMitraUiAction);
    return () => window.removeEventListener(MITRA_UI_ACTION_EVENT, handleMitraUiAction);
  }, [applyMitraAction]);

  useEffect(() => {
    if (!voiceHighlight) return;
    const timeout = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-mitra-id="${CSS.escape(voiceHighlight)}"]`
      );
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.classList.add("mitra-highlight");
      window.setTimeout(() => target?.classList.remove("mitra-highlight"), 4200);
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [frame, district, voiceFilters, voiceHighlight]);

  return (
    <div className="pcc">
      <div className="app">
        {/* ============ SIDEBAR ============ */}
        <aside className="sidebar">
          <div className="brand">
            <div className="mark">
              <div className="leaf">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 21c-5 0-8-3.6-8-8.2C4 7 9 3.4 19 3c.6 8.6-2 18-7 18Z" stroke="#E6CC85" strokeWidth={1.7} />
                  <path d="M12 21c.4-6 2.4-10.4 6-13.5" stroke="#E6CC85" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </div>
              <div><h1>Poshane <span className="kn">ಪೋಷಣೆ</span></h1></div>
            </div>
            <div className="sub">Command &amp; Control Center<br />KSLSA · Five Crore Sapling Programme</div>
          </div>

          <nav className="navgroup" aria-label="Operations">
            <div className="glabel">Operations</div>
            {NAV.filter(n => !n.secure).map(n => (
              n.id === "f8" ? (
                <div className="navitem-stack" key={n.id}>
                  <button
                    className={`navbtn${frame === n.id ? " active" : ""}`}
                    onClick={() => openSystemArchitecture(architectureSection)}
                  >
                    {n.icon}{n.label}
                  </button>
                  <div className="navsublist" aria-label="System Architecture sections">
                    {ARCHITECTURE_SUBNAV.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`navsubbtn${frame === "f8" && architectureSection === item.id ? " active" : ""}`}
                        onClick={() => openSystemArchitecture(item.id)}
                      >
                        <span className="navsubdot" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button key={n.id} className={`navbtn${frame === n.id ? " active" : ""}`} onClick={() => setFrame(n.id)}>
                  {n.icon}{n.label}
                </button>
              )
            ))}
          </nav>
          <nav className="navgroup" aria-label="Restricted">
            <div className="glabel">Restricted</div>
            {NAV.filter(n => n.secure).map(n => (
              <button key={n.id} className={`navbtn${frame === n.id ? " active" : ""}`} onClick={() => setFrame(n.id)}>
                {n.icon}{n.label} <span className="lockchip">SECURE</span>
              </button>
            ))}
          </nav>

          <div className="mitra-dock">
            <PoshaneMitra
              uiContext={{
                frame,
                districtCode: district,
                talukCode: taluk,
                filters: voiceFilters,
                highlightId: voiceHighlight,
              }}
            />
          </div>

          <div className="side-actions">
            {logoutSlot}
          </div>

          <div className="side-foot">
            <b>IAFT</b> — Program Management &amp;<br />Principal Scientific Advisor<br />
            <span style={{ opacity: 0.75 }}>Programme window 2026–2034</span>
          </div>
        </aside>

        {/* ============ TOPBAR ============ */}
        <header className="topbar">
          <div className="ttl">
            <span className="t1">KSLSA Five Crore Sapling Plantation Programme</span>
            <span className="t2">POSHANE · STATE-WIDE OPERATIONS CONSOLE</span>
          </div>
          <div className="scope-toggle" role="tablist" aria-label="Scope">
            <button className={frame !== "f2" && frame !== "f9" ? "on" : ""} onClick={() => setFrame("f1")}>State View</button>
            <button className={frame === "f2" ? "on" : ""} onClick={() => setFrame("f2")}>District View</button>
            <button className={frame === "f9" ? "on" : ""} onClick={openTalukView}>Taluk View</button>
          </div>
          <a
            className="demo-link"
            href="https://poshane-demo.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Demo in a new tab"
          >
            Demo
          </a>
          <div className="userchip">
            <div className="avatar">{initials || "SA"}</div>
            <div>
              <div className="uname">{adminName}</div>
              <div className="urole">{adminEmail} · Programme HQ</div>
            </div>
          </div>
        </header>

        {/* ============ MAIN ============ */}
        <main className="main">
          {frame === "f1" && <Frame1 onSelectDistrict={goDistrict} />}
          {frame === "f2" && <Frame2 code={district} onChange={setDistrict} onSelectTaluk={goTaluk} />}
          {frame === "f9" && (
            <TalukFrame
              districtCode={district}
              talukCode={taluk}
              onDistrictChange={setDistrict}
              onTalukChange={setTaluk}
            />
          )}
          {frame === "f3" && <Frame3 voiceFilters={voiceFilters} />}
          {frame === "f4" && <Frame4 voiceFilters={voiceFilters} />}
          {frame === "f5" && <Frame5 voiceFilters={voiceFilters} />}
          {frame === "f6" && <Frame6 />}
          {frame === "f7" && <Frame7 />}
          {frame === "f8" && (
            <Frame8
              requestedSection={architectureSection}
              onSectionChange={setArchitectureSection}
            />
          )}
        </main>
      </div>

    </div>
  );
}
