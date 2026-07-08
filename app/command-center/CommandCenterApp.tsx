"use client";
import React, { useState } from "react";
import { Frame1, Frame2, Frame3, Frame4, Frame5, Frame6 } from "./components/frames";
import { Frame7 } from "./components/financials";

type FrameId = "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7";

type CommandCenterAppProps = {
  adminEmail: string;
  adminName: string;
};

const NAV: { id: FrameId; label: string; icon: React.ReactNode; secure?: boolean }[] = [
  { id: "f1", label: "State Overview", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={7.5} height={7.5} rx={1.5} /><rect x={13.5} y={3} width={7.5} height={7.5} rx={1.5} /><rect x={3} y={13.5} width={7.5} height={7.5} rx={1.5} /><rect x={13.5} y={13.5} width={7.5} height={7.5} rx={1.5} /></svg> },
  { id: "f2", label: "District Drill-Down", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11Z" /><circle cx={12} cy={10} r={2.6} /></svg> },
  { id: "f3", label: "Land & Ownership", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" /><path d="M3 13l9 4.5 9-4.5" /></svg> },
  { id: "f4", label: "Stakeholders", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={8.5} cy={9} r={3} /><circle cx={16.5} cy={10.5} r={2.4} /><path d="M3.5 19c.5-3 2.6-4.6 5-4.6s4.5 1.6 5 4.6M13.8 18.6c.4-2.2 1.7-3.4 3.4-3.4 1.6 0 2.9 1 3.3 3.1" /></svg> },
  { id: "f5", label: "Species Planning", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 21V10M12 10c0-4 2.8-6.5 7-7-.3 4.4-2.6 7-7 7ZM12 13c0-3-2.1-5-5.3-5.3.2 3.4 2 5.3 5.3 5.3Z" /></svg> },
  { id: "f6", label: "Monitoring & Audit", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={11} cy={11} r={6.5} /><path d="m20 20-4-4M8.5 11l1.8 1.8 3.4-3.6" /></svg> },
  { id: "f7", label: "Financials", secure: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={4.5} y={10} width={15} height={10} rx={2} /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /><circle cx={12} cy={15} r={1.4} /></svg> },
];

export default function CommandCenterApp({
  adminEmail,
  adminName,
}: CommandCenterAppProps) {
  const [frame, setFrame] = useState<FrameId>("f1");
  const [district, setDistrict] = useState("BLG");
  const initials = adminName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const goDistrict = (code: string) => { setDistrict(code); setFrame("f2"); };

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
              <button key={n.id} className={`navbtn${frame === n.id ? " active" : ""}`} onClick={() => setFrame(n.id)}>
                {n.icon}{n.label}
              </button>
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
            <button className={frame !== "f2" ? "on" : ""} onClick={() => setFrame("f1")}>State View</button>
            <button className={frame === "f2" ? "on" : ""} onClick={() => setFrame("f2")}>District View</button>
          </div>
          <div className="proto-flag" title="Illustrative prototype — mock data for demonstration. Not live operational data.">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={9} /><path d="M12 8v5M12 16.5v.01" /></svg>
            <span>Illustrative prototype — mock data for demonstration. Not live operational data.</span>
          </div>
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
          {frame === "f2" && <Frame2 code={district} onChange={setDistrict} />}
          {frame === "f3" && <Frame3 />}
          {frame === "f4" && <Frame4 />}
          {frame === "f5" && <Frame5 />}
          {frame === "f6" && <Frame6 />}
          {frame === "f7" && <Frame7 />}
        </main>
      </div>

      <div className="protobadge"><b>Illustrative prototype</b> — mock data for demonstration. Not live operational data.</div>
    </div>
  );
}
