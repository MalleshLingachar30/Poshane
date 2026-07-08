"use client";
import React, { useEffect, useRef, useState } from "react";
import { FUNDS, DISTRICTS, plantedOf, UTIL_PER_LAKH, cr, ACCESS_CODE } from "../data";
import { HBars } from "./charts";

const committed = FUNDS.reduce((a, f) => a + f[2], 0);
const received = FUNDS.reduce((a, f) => a + f[3], 0);
const utilised = FUNDS.reduce((a, f) => a + f[4], 0);

function MaskedChart() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, padding: "44px 10px", color: "var(--ink-dim)", fontSize: 12 }}>
      <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#8A8467" strokeWidth={1.7}>
        <rect x={4.5} y={10} width={15} height={10} rx={2} /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /><circle cx={12} cy={15} r={1.4} />
      </svg>
      Charts masked. Unlock with the finance access code to view.
    </div>
  );
}

function PinModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const [attempts, setAttempts] = useState(3);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const tryCode = (v: string) => {
    if (v === ACCESS_CODE) { onSuccess(); return; }
    const left = attempts - 1;
    setAttempts(left);
    setShake(false); requestAnimationFrame(() => setShake(true));
    setErr(left > 0
      ? `Incorrect access code. ${left} attempt${left > 1 ? "s" : ""} remaining.`
      : "Access blocked — finance controller notified (mock). Close and retry.");
    setVal("");
    if (left > 0) inputRef.current?.focus(); else setTimeout(onClose, 900);
  };

  return (
    <div className="pinoverlay on" role="dialog" aria-modal="true" aria-label="Step-up authorisation"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`pinmodal${shake ? " err" : ""}`}>
        <div className="pshield">
          <svg viewBox="0 0 24 24" fill="none" stroke="#E6CC85" strokeWidth={1.7}>
            <path d="M12 3.5 5 6v5.2c0 4.6 3 7.6 7 9.3 4-1.7 7-4.7 7-9.3V6l-7-2.5Z" />
            <rect x={9.4} y={10.6} width={5.2} height={4.6} rx={1.1} /><path d="M10.4 10.6V9.4a1.6 1.6 0 0 1 3.2 0v1.2" />
          </svg>
        </div>
        <h4>Step-Up Authorisation</h4>
        <div className="pdesc">
          Financial data is segregated with second-factor access.<br />
          Enter the 6-digit finance access code — required even for <b style={{ color: "#C7D2E4" }}>Super Admin</b>.
        </div>
        <input ref={inputRef} className="pininput" type="password" inputMode="numeric" autoComplete="one-time-code"
          maxLength={6} aria-label="6-digit access code" placeholder="······" value={val}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, "");
            setVal(v);
            if (v.length === 6) tryCode(v);
          }}
          onKeyDown={e => { if (e.key === "Enter") tryCode(val); if (e.key === "Escape") onClose(); }} />
        <div className="pinerr">{err}</div>
        <div className="pinactions">
          <button className="cancel" onClick={onClose}>Cancel</button>
          <button className="go" onClick={() => tryCode(val)}>Verify &amp; unlock</button>
        </div>
        <div className="pinfoot">
          <svg viewBox="0 0 24 24" fill="none" stroke="#5E6C88" strokeWidth={2}><circle cx={12} cy={12} r={9} /><path d="M12 7.5V12l3 2" /></svg>
          3 attempts · every attempt is logged with user, time &amp; device (mock behaviour)
        </div>
      </div>
    </div>
  );
}

export function Frame7() {
  const [revealed, setRevealed] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [accessLog, setAccessLog] = useState("");

  const unlock = () => {
    setPinOpen(false);
    setRevealed(true);
    const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    setAccessLog(`Unlocked · Super Admin (step-up verified) · ${t} IST · access logged`);
  };
  const relock = () => { setRevealed(false); setAccessLog(""); };

  const fv = (v: number) => (revealed ? cr(v) : "••••••");
  const topDistricts = DISTRICTS.map(d => [d.name, [Math.round(plantedOf(d) * UTIL_PER_LAKH * 10) / 10]] as [string, number[]])
    .sort((a, b) => b[1][0] - a[1][0]).slice(0, 10);

  return (
    <section className="frame on" aria-label="Financials — Secure Module">
      <div className="frame-head">
        <h2>Financials</h2>
        <span className="fdesc">Elevated-security module — role-gated access</span>
      </div>
      <div className="securewrap">
        <div className="securehead">
          <div className="shield">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E6CC85" strokeWidth={1.7}>
              <path d="M12 3.5 5 6v5.2c0 4.6 3 7.6 7 9.3 4-1.7 7-4.7 7-9.3V6l-7-2.5Z" /><path d="m9.2 12 2 2 3.6-3.8" />
            </svg>
          </div>
          <div>
            <h3>Secure Financial Module</h3>
            <div className="ssub">Fund commitments, receipts &amp; utilisation · segregated from operational data · full audit trail</div>
          </div>
          <div className="restrictbadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x={4.5} y={10} width={15} height={10} rx={2} /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
            </svg>
            ACCESS: RESTRICTED — FINANCE ROLE
          </div>
        </div>
        <div className="securebody">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <button className="revealbtn" onClick={() => (revealed ? relock() : setPinOpen(true))}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx={12} cy={12} r={2.6} />
              </svg>
              {revealed ? "Mask figures & re-lock" : "Unlock figures (access code)"}
            </button>
            <span className="audnote">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#7688A8" strokeWidth={2}><circle cx={12} cy={12} r={9} /><path d="M12 7.5V12l3 2" /></svg>
              Every reveal is logged with user, time &amp; purpose (mock behaviour)
            </span>
            {accessLog && <span className="audnote" style={{ marginLeft: "auto", color: "#9FB69F" }}>{accessLog}</span>}
          </div>

          <div className="finkpis">
            <div className="finkpi"><div className="fl">Funds committed</div><div className={`fv${revealed ? "" : " masked"}`}>{fv(committed)}</div><div className="fs">Across {FUNDS.length} funding agencies</div></div>
            <div className="finkpi"><div className="fl">Funds received</div><div className={`fv${revealed ? "" : " masked"}`}>{fv(received)}</div><div className="fs">{revealed ? (received / committed * 100).toFixed(0) + "% of commitments" : "Masked — Finance role required"}</div></div>
            <div className="finkpi"><div className="fl">Funds utilised</div><div className={`fv${revealed ? "" : " masked"}`}>{fv(utilised)}</div><div className="fs">{revealed ? (utilised / received * 100).toFixed(0) + "% of receipts" : "Masked — Finance role required"}</div></div>
            <div className="finkpi"><div className="fl">Utilisation audit</div><div className="fv" style={{ fontSize: 16, color: "#9FB69F", paddingTop: 8 }}>Concurrent audit — current</div><div className="fs">Quarterly UC filing on schedule</div></div>
          </div>

          <div className="split11">
            <div className="panel">
              <div className="phead"><h3>Committed vs Received vs Utilised — by Source</h3><span className="pnote">₹ crore</span></div>
              <div className="pbody chartwrap">
                {revealed ? (
                  <HBars rows={FUNDS.map(f => [f[0].split("—")[0].trim(), [f[2], f[3], f[4]]] as [string, number[]])}
                    colors={["#27467A", "#2E7D4B", "#C09A3E"]} names={["Committed", "Received", "Utilised"]}
                    legend fmt={v => v + " Cr"} max={120} pl={200} />
                ) : <MaskedChart />}
              </div>
            </div>
            <div className="panel">
              <div className="phead"><h3>Utilisation by District — Top 10</h3><span className="pnote">₹ crore · Year 1</span></div>
              <div className="pbody chartwrap">
                {revealed ? (
                  <HBars rows={topDistricts} colors={["#2E7D4B"]} names={["Utilised"]} fmt={v => "₹" + v + " Cr"} pl={150} rowH={26} />
                ) : <MaskedChart />}
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 14 }}>
            <div className="phead"><h3>Funding Agencies</h3><span className="pnote">All figures illustrative</span></div>
            <div className="pbody" style={{ overflowX: "auto" }}>
              <table className="tbl">
                <tbody>
                  <tr><th>Funding agency</th><th>Type</th><th className="num">Committed</th><th className="num">Received</th><th className="num">Utilised</th><th>Receipt status</th></tr>
                  {FUNDS.map(f => (
                    <tr key={f[0]}>
                      <td className="b">{f[0]}</td><td className="dim">{f[1]}</td>
                      <td className="num">{fv(f[2])}</td><td className="num">{fv(f[3])}</td><td className="num">{fv(f[4])}</td>
                      <td>{f[3] / f[2] >= 0.5 ? <span className="pill g">On schedule</span> : <span className="pill a">Tranche pending</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {pinOpen && <PinModal onClose={() => setPinOpen(false)} onSuccess={unlock} />}
    </section>
  );
}
