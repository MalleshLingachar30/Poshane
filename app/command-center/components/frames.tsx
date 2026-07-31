"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  DISTRICTS, ZONES, NGO_POOL, SITES, LAND_TYPES, STK, NURSERIES, AUDITS, FEED, ISSUES,
  MONTHS, MONTH_ACTS, fmtIN, lakhToStr, lakhFix, y1Of, zoneAlloc,
  TOT_ALLOC, TOT_Y1, TOT_NUR, UTIL_TOTAL,
} from "../data";
import { useLiveSnapshot, useLiveTotal, useLiveWSurv, useLiveDistrict, liveProg } from "../live";
import { LineChart, Donut, OnboardPill, ContractPill, Rolling } from "./charts";
import type { CommandCenterFilterSet } from "../mitra/types";

/* ============ shared bits ============ */
function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Kpi({ label, val, sub, pct, mitraId }: { label: string; val: React.ReactNode; sub: string; pct?: number; mitraId?: string }) {
  return (
    <div className="kpi" data-mitra-id={mitraId}>
      <div className="klabel">{label}</div>
      <div className="kval">{val}</div>
      <div className="ksub">{sub}</div>
      {pct != null && <div className="kbar"><i style={{ width: `${Math.min(100, pct)}%` }} /></div>}
    </div>
  );
}

/* ---- live KPI cards --------------------------------------------------------
   These subscribe to the shared ticker (../live) individually rather than
   letting Frame1 subscribe, so a tick re-renders only the numbers that moved —
   not the 31-tile map and the two charts sitting alongside them.             */
const LAKH = 100_000;

function LivePlantedKpi() {
  const live = useLiveTotal();
  return (
    <div className="kpi" data-mitra-id="state-total-planted">
      <div className="klabel">Total Planted<span className="klive">Live</span></div>
      <div className="kval">
        <Rolling value={live} format={v => lakhFix(v, 2)} /><small> / 5 Cr</small>
      </div>
      <div className="ksub">
        {/* One Rolling for the whole line rather than three: all three figures
            derive from the same value, so three rAF loops would be waste.
            The exact tree count moves every tick; the headline above advances
            every ~18s. That split is what makes it read as live but credible. */}
        <Rolling value={live} format={v =>
          `${fmtIN(v * LAKH)} trees · ${(v / TOT_ALLOC * 100).toFixed(1)}% of programme · ${(v / TOT_Y1 * 100).toFixed(0)}% of Y1`
        } />
      </div>
      <div className="kbar"><i style={{ width: `${Math.min(100, live / TOT_Y1 * 100)}%` }} /></div>
    </div>
  );
}

function LiveSurvivalKpi() {
  // Recomputed from the live planted weights so it can never silently disagree
  // with the total. In practice it holds steady at 95.7 for the whole session.
  const wSurv = useLiveWSurv();
  return (
    <div className="kpi" data-mitra-id="state-overall-survival">
      <div className="klabel">Overall Survival</div>
      <div className="kval"><Rolling value={wSurv} format={v => v.toFixed(1)} /><small> %</small></div>
      <div className="ksub">Standard: 95% · weighted by stock</div>
      <div className="kbar"><i style={{ width: `${Math.min(100, wSurv)}%` }} /></div>
    </div>
  );
}

/* Charts subscribe on their own too, for the same reason. */
function CumulativePlantingChart() {
  const live = useLiveTotal();
  return (
    <LineChart labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]} ymax={60} aria="Cumulative planting, lakh saplings"
      yFmt={v => v + " L"}
      series={[
        { name: "Plan", color: "#27467A", data: [2.5, 5, 10, 17, 26, 36, 46], dash: true },
        { name: "Actual", color: "#1C5A33", data: [1.8, 4.2, 7.6, 13.1, 21.9, 33.4, Math.round(live * 10) / 10], fill: true },
      ]} />
  );
}

function SurvivalTrendChart() {
  const wSurv = useLiveWSurv();
  return (
    <LineChart labels={["Feb", "Mar", "Apr", "May", "Jun", "Jul"]} ymin={88} ymax={100} target={95} targetLabel="95% standard"
      aria="Statewide survival rate trend" yFmt={v => v + "%"}
      series={[{ name: "Survival", color: "#2E7D4B", data: [97.4, 96.8, 96.1, 95.4, 95.9, Math.round(wSurv * 10) / 10], fill: true }]} />
  );
}

/* ============ FRAME 1 — STATE OVERVIEW ============ */
const GREENS = ["#CFE3CD", "#A8CBA6", "#7DB07E", "#4E8F58", "#2E6E3E", "#174D2A"];
function progColor(p: number) {
  const t = [50, 58, 65, 72, 80];
  let i = 0; while (i < t.length && p >= t[i]) i++;
  return GREENS[i];
}

function KarnatakaMap({ onSelect }: { onSelect: (code: string) => void }) {
  // Tiles all move together on a tick, so this one subscribes to the whole
  // snapshot. They SNAP (with a CSS fill ease) rather than each running its own
  // rAF roll — 31 concurrent animation loops for integer percentages is waste.
  const live = useLiveSnapshot();
  // Store the CODE, not the District object: holding the static object would
  // make the tooltip read a stale % while the tile under the cursor reads live.
  const [tip, setTip] = useState<{ code: string; x: number; y: number } | null>(null);
  const size = 60, gap = 7, pad = 8, cols = 6, rows = 10;
  const w = pad * 2 + cols * (size + gap) - gap, h = pad * 2 + rows * (size + gap) - gap;
  const tipD = tip ? DISTRICTS.find(d => d.code === tip.code) : null;
  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Stylized district progress map of Karnataka" style={{ maxWidth: 460, margin: "0 auto", display: "block", width: "100%", height: "auto" }}>
        {DISTRICTS.map(d => {
          const x = pad + d.col * (size + gap), yy = pad + d.row * (size + gap);
          const prog = liveProg(d.code, live.planted[d.code]);
          const c = progColor(prog), light = prog < 65;
          return (
            // key must stay d.code — it's what keeps the hovered <g> from being
            // remounted on a tick, which would spuriously fire mouseleave.
            <g key={d.code} className="dtile" tabIndex={0}
              onMouseMove={e => setTip({ code: d.code, x: Math.min(window.innerWidth - 220, e.clientX + 14), y: e.clientY + 14 })}
              onMouseLeave={() => setTip(null)}
              onClick={() => { setTip(null); onSelect(d.code); }}
              onKeyDown={e => { if (e.key === "Enter") onSelect(d.code); }}>
              <rect x={x} y={yy} width={size} height={size} rx={10} fill={c} />
              <text x={x + size / 2} y={yy + size / 2 - 3} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={light ? "#20402A" : "#F2F6EE"} fontFamily="var(--sans)">{d.code}</text>
              <text x={x + size / 2} y={yy + size / 2 + 13} textAnchor="middle" fontSize={9.5} fill={light ? "#3F5C46" : "#D5E5D3"} fontFamily="var(--sans)">{prog.toFixed(0)}%</text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--ink-dim)", marginTop: 8 }}>
        Stylized tile cartogram — approximate geography. Tile value = planting progress vs Year-1 district target. Click a district to drill down.
      </div>
      {tip && tipD && (
        <div className="maptip" style={{ display: "block", left: tip.x, top: tip.y }}>
          <div className="t">{tipD.name}</div>
          <div className="r"><span>Programme share</span><span>{lakhToStr(tipD.alloc)}</span></div>
          <div className="r"><span>Planted (Y1)</span><span>
            {lakhFix(live.planted[tipD.code])} · {liveProg(tipD.code, live.planted[tipD.code]).toFixed(0)}%
          </span></div>
          <div className="r"><span>Survival</span><span>{tipD.survival}%</span></div>
          <div className="r"><span>Nurseries</span><span>{tipD.nurseries}</span></div>
        </div>
      )}
    </>
  );
}

const ALERT_ICONS: Record<string, React.ReactNode> = {
  r: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 4 2.8 20h18.4L12 4Z" /><path d="M12 10v4.4M12 17.4v.01" /></svg>,
  a: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={9} /><path d="M12 8v5M12 16.5v.01" /></svg>,
  b: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 15V9.8L20 5v14L4 15Z" /><path d="M8 15.5V18a2 2 0 0 0 4 0v-1.6" /></svg>,
};

export function Frame1({ onSelectDistrict }: { onSelectDistrict: (code: string) => void }) {
  const alerts = useMemo(() => {
    const items: [string, React.ReactNode, string, string][] = [];
    DISTRICTS.filter(d => d.survival < 95).sort((a, b) => a.survival - b.survival).slice(0, 3).forEach(d => {
      items.push(["r", <><b>{d.name}</b> below survival threshold — {d.survival}% vs 95% standard. Casualty-replacement plan escalated to district unit.</>, "Survival watch · updated today", `alert-${slug(d.name)}`]);
    });
    items.push(["a", <>Audit flagged <b>Raichur Krishna Nursery</b> — shade-net gap on Bevu beds; rectification due 18 Jul.</>, "Nursery audit · 03 Jul", "alert-raichur"]);
    items.push(["a", <><b>Sira Block 12, Tumakuru</b> — casualty replacement pending on 2.1% of pits.</>, "Plantation audit · 04 Jul", "alert-tumakuru"]);
    items.push(["b", <>IMD monsoon advisory: heavy-rain window 10–14 Jul — planting drives advanced in <b>Malnad &amp; coastal districts</b>.</>, "Operations advisory", "alert-monsoon-advisory"]);
    items.push(["b", <><b>Corporate Volunteer Pool</b> (Bengaluru Urban) invitation pending acceptance — 3,100 volunteers offered.</>, "Onboarding", "alert-bengaluru-urban"]);
    return items;
  }, []);

  return (
    <section className="frame on" aria-label="State Overview">
      <div className="frame-head">
        <h2>State Overview</h2>
        <span className="fdesc">All districts · consolidated as of 08 Jul 2026 (mock)</span>
      </div>
      <div className="kpirow">
        <LivePlantedKpi />
        <LiveSurvivalKpi />
        <Kpi mitraId="state-districts-active" label="Districts Active" val={<>31<small> / 31</small></>} sub="All district units reporting" pct={100} />
        <Kpi mitraId="state-nurseries-operational" label="Nurseries Operational" val={fmtIN(TOT_NUR)} sub="Combined capacity ≈ 92 lakh seedlings" pct={78} />
        <Kpi mitraId="state-funds-utilised" label="Funds Utilised" val={<>₹{UTIL_TOTAL}<small> Cr</small></>} sub="Of ₹94 Cr received · details in Secure Module" pct={UTIL_TOTAL / 94 * 100} />
      </div>
      <div className="split2">
        <div className="panel" data-mitra-id="state-progress-map">
          <div className="phead">
            <h3>District Progress Map — Karnataka</h3>
            <div className="pnote maplegend">
              <span>Progress:</span>
              {GREENS.map(g => <span key={g} className="sw" style={{ background: g }} />)}
              <span>&nbsp;low → high</span>
            </div>
          </div>
          <div className="pbody"><KarnatakaMap onSelect={onSelectDistrict} /></div>
        </div>
        <div className="panel" data-mitra-id="alerts">
          <div className="phead"><h3>Alerts &amp; Exceptions</h3><span className="pnote">Auto-generated (mock)</span></div>
          <div className="pbody alist">
            {alerts.map((a, i) => (
              <div key={i} className={`aitem sev-${a[0]}`} data-mitra-id={a[3]}>
                <div className="ic">{ALERT_ICONS[a[0]]}</div>
                <div><div className="at">{a[1]}</div><div className="am">{a[2]}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="split11" style={{ marginTop: 14 }}>
        <div className="panel" data-mitra-id="state-planting-trend">
          <div className="phead"><h3>Cumulative Planting — Year 1</h3><span className="pnote">Lakh saplings · Jan–Jul 2026</span></div>
          <div className="pbody chartwrap"><CumulativePlantingChart /></div>
        </div>
        <div className="panel" data-mitra-id="state-survival-trend">
          <div className="phead"><h3>Survival Rate Trend</h3><span className="pnote">Statewide monthly assessment vs 95% standard</span></div>
          <div className="pbody chartwrap"><SurvivalTrendChart /></div>
        </div>
      </div>
    </section>
  );
}

/* ============ FRAME 2 — DISTRICT DRILL-DOWN ============ */
export function Frame2({ code, onChange }: { code: string; onChange: (c: string) => void }) {
  const d = DISTRICTS.find(x => x.code === code) ?? DISTRICTS[5];
  const z = ZONES[d.zone];
  const gPct = 52 + ((d.name.length * 7) % 31);
  // Subscribes to this district only, so it re-renders on the ~5% of ticks that
  // actually credit it rather than on every tick.
  const pl = useLiveDistrict(d.code), t = y1Of(d);
  const prog = liveProg(d.code, pl);
  const ngos = STK.filter(s => s[1] === "NGO" && s[2] === d.name);
  const ngoRows: [string, string, string, string, number][] = ngos.length
    ? ngos.map(s => [s[0], s[4], s[3], s[5], s[6]])
    : [
      [NGO_POOL[(d.name.length * 3) % NGO_POOL.length], "Block planting & maintenance", "Onboarded", "Signed", Math.round(d.volunteers * 0.18)],
      [NGO_POOL[(d.name.length * 5 + 4) % NGO_POOL.length], "Monitoring & survival audit support", "Verifying", "Drafted", Math.round(d.volunteers * 0.09)],
    ];
  const timeline: [string, string, string][] = [
    ["Jan–Feb", "Site survey & pit marking", "done"], ["Mar", "Soil work, pitting & fencing", "done"],
    ["Apr–May", "Nursery hardening & site handover", "done"], ["Jun", "Monsoon planting wave 1", "done"],
    ["Jul", "Planting wave 2 + first casualty check", "now"], ["Aug–Oct", "Watering roster & weeding cycle", ""],
    ["Nov–Dec", "First survival census (Y1)", ""],
  ];
  return (
    <section className="frame on" aria-label="District Drill-Down">
      <div className="frame-head">
        <h2>District Drill-Down</h2>
        <span className="fdesc">Single-district operational picture</span>
        <span className="spacer" />
        <select className="dselect" value={code} onChange={e => onChange(e.target.value)} aria-label="Select district">
          {DISTRICTS.map(x => <option key={x.code} value={x.code}>{x.name}</option>)}
        </select>
      </div>
      <div className="mkpis" style={{ marginBottom: 14 }} data-mitra-id="district-kpis">
        <div className="mkpi"><div className="l">Programme share</div><div className="v">{lakhToStr(d.alloc)}</div></div>
        <div className="mkpi"><div className="l">Year-1 target</div><div className="v">{lakhToStr(t)}</div></div>
        {/* key={d.code} remounts these on district change so the figures SNAP to
            the new district instead of rolling across from the previous one. */}
        <div className="mkpi good"><div className="l">Planted to date</div><div className="v">
          <Rolling key={d.code} value={pl} format={v => lakhFix(v)} />{" "}
          <em>· <Rolling key={d.code} value={prog} format={v => v.toFixed(0)} />% of Y1</em>
        </div></div>
        <div className={`mkpi ${d.survival < 95 ? "bad" : "good"}`}><div className="l">Survival</div><div className="v">{d.survival}% <em>vs 95%</em></div></div>
        <div className="mkpi"><div className="l">Active NGOs</div><div className="v">{d.ngos}</div></div>
        <div className="mkpi"><div className="l">Volunteers</div><div className="v">{fmtIN(d.volunteers)}</div></div>
        <div className="mkpi"><div className="l">Nurseries</div><div className="v">{d.nurseries}</div></div>
      </div>
      <div className="split2">
        <div className="grid">
          <div className="panel" data-mitra-id="district-land-split">
            <div className="phead"><h3>{d.name} — Allocation &amp; Land Split</h3><span className="pnote">Mock split</span></div>
            <div className="pbody donutwrap">
              <Donut gPct={gPct} />
              <div style={{ flex: 1 }}>
                <div className="legendrow" style={{ marginBottom: 10 }}>
                  <span className="k"><span className="sw" style={{ background: "#1C5A33" }} />Government &amp; community land — {gPct}%</span>
                  <span className="k"><span className="sw" style={{ background: "#DCD3BE" }} />Private / institutional — {100 - gPct}%</span>
                </div>
                <div style={{ fontSize: 12.3, color: "var(--ink-dim)", lineHeight: 1.6 }}>
                  Government parcels carry departmental custody after planting; private and institutional
                  parcels are held under CSR or campus maintenance contracts through the two survival-assurance years.
                </div>
              </div>
            </div>
          </div>
          <div className="panel" data-mitra-id="district-ngo-partners">
            <div className="phead"><h3>NGO Partners in {d.name}</h3><span className="pnote">Contract accountability</span></div>
            <div className="pbody" style={{ overflowX: "auto" }}>
              <table className="tbl">
                <tbody>
                  <tr><th>Partner</th><th>Assigned scope</th><th>Onboarding</th><th>Contract</th><th className="num">Volunteers</th></tr>
                  {ngoRows.map((r, i) => (
                    <tr key={i} data-mitra-id={`stakeholder-${slug(r[0])}`}><td className="b">{r[0]}</td><td>{r[1]}</td><td><OnboardPill s={r[2]} /></td><td><ContractPill c={r[3]} /></td><td className="num">{fmtIN(r[4])}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="grid">
          <div className="panel" data-mitra-id="district-timeline">
            <div className="phead"><h3>Monitoring Timeline — 2026</h3></div>
            <div className="pbody tline">
              {timeline.map(tt => (
                <div key={tt[0]} className={`tstep ${tt[2]}`}><div className="tm">{tt[0]}</div><div className="tt">{tt[1]}</div></div>
              ))}
            </div>
          </div>
          <div className="panel" data-mitra-id="district-zone">
            <div className="phead"><h3>Agro-Climatic Zone</h3></div>
            <div className="pbody">
              <div className="tag" style={{ marginBottom: 5 }}>Zone</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600, color: "var(--green-deep)", marginBottom: 11 }}>{z.name}</div>
              <div className="tag" style={{ marginBottom: 7 }}>Recommended native species</div>
              <div className="spchips">{z.species.map(sp => <span key={sp[0]} className="spchip">{sp[0]} <em>{sp[1]}</em></span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ FRAME 3 — LAND & OWNERSHIP ============ */
export function Frame3({ voiceFilters }: { voiceFilters?: CommandCenterFilterSet }) {
  const [fd, setFd] = useState(""); const [ft, setFt] = useState(""); const [fs, setFs] = useState("");
  useEffect(() => {
    if (voiceFilters?.landDistrict !== undefined) setFd(voiceFilters.landDistrict ?? "");
    if (voiceFilters?.landType !== undefined) setFt(voiceFilters.landType ?? "");
    if (voiceFilters?.landStatus !== undefined) setFs(voiceFilters.landStatus ?? "");
  }, [voiceFilters?.landDistrict, voiceFilters?.landStatus, voiceFilters?.landType]);
  const dnames = useMemo(() => Array.from(new Set(SITES.map(s => s[0]))).sort(), []);
  const rows = SITES.filter(s => (!fd || s[0] === fd) && (!ft || s[2] === ft) && (!fs || s[4] === fs));
  const statusPill = (st: string) => st === "Planted" ? <span className="pill g">Planted</span>
    : st === "Selected" ? <span className="pill b">Selected</span> : <span className="pill n">Available</span>;
  return (
    <section className="frame on" aria-label="Land and Ownership Registry">
      <div className="frame-head">
        <h2>Land &amp; Ownership Registry</h2>
        <span className="fdesc">Planting sites, selection status &amp; post-plantation custody</span>
      </div>
      <div className="panel" data-mitra-id="land-registry">
        <div className="pbody" style={{ paddingBottom: 8 }}>
          <div className="filters">
            <select value={fd} onChange={e => setFd(e.target.value)}>
              <option value="">All districts</option>
              {dnames.map(n => <option key={n}>{n}</option>)}
            </select>
            <select value={ft} onChange={e => setFt(e.target.value)}>
              <option value="">All land types</option>
              {LAND_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={fs} onChange={e => setFs(e.target.value)}>
              <option value="">All statuses</option><option>Available</option><option>Selected</option><option>Planted</option>
            </select>
            <span className="count">{rows.length} of {SITES.length} sites</span>
          </div>
        </div>
        <div className="pbody" style={{ paddingTop: 4, overflowX: "auto" }}>
          <table className="tbl">
            <tbody>
              <tr><th>Site</th><th>District</th><th>Land type</th><th className="num">Area (ac)</th><th>Agro-climatic zone</th><th>Status</th><th>Post-plantation ownership</th></tr>
              {rows.length ? rows.map((s, i) => {
                const dd = DISTRICTS.find(x => x.name === s[0])!;
                return (
                  <tr key={i} data-mitra-id={`site-${slug(s[1])}`}><td className="b">{s[1]}</td><td>{s[0]}</td><td>{s[2]}</td><td className="num">{s[3]}</td>
                    <td className="dim">{ZONES[dd.zone].name}</td><td>{statusPill(s[4])}</td><td className="dim">{s[5]}</td></tr>
                );
              }) : <tr><td colSpan={7} className="dim" style={{ textAlign: "center", padding: 20 }}>No sites match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="notecard" style={{ marginTop: 12 }}>
        Ownership model column records who owns and maintains each site after planting — a government body, private industry (CSR custody),
        community institution, or academic campus — with maintenance obligations running through the two survival-assurance years.
      </div>
    </section>
  );
}

/* ============ FRAME 4 — STAKEHOLDERS ============ */
const STK_COLORS: Record<string, string> = { "NGO": "#1C5A33", "Government agency": "#27467A", "Volunteer network": "#8F5A14" };
const STK_LABELS: Record<string, string> = {
  All: "All",
  NGO: "NGOs",
  "Government agency": "Government agencies",
  "Volunteer network": "Volunteer networks",
};
const initials = (n: string) => n.split(" ").filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join("");

export function Frame4({ voiceFilters }: { voiceFilters?: CommandCenterFilterSet }) {
  const [cur, setCur] = useState("All");
  const [district, setDistrict] = useState("");
  useEffect(() => {
    if (voiceFilters?.stakeholderCategory) setCur(voiceFilters.stakeholderCategory);
  }, [voiceFilters?.stakeholderCategory]);
  useEffect(() => {
    if (voiceFilters?.stakeholderDistrict !== undefined) setDistrict(voiceFilters.stakeholderDistrict ?? "");
  }, [voiceFilters?.stakeholderDistrict]);
  const types = ["All", "NGO", "Government agency", "Volunteer network"];
  const selectedDistrict = DISTRICTS.find(d => d.name === district);
  const matchesDistrict = (s: (typeof STK)[number]) => {
    if (!district) return true;
    return s[2] === district || s[2] === "All districts";
  };
  const rows = STK.filter(s => (cur === "All" || s[1] === cur) && matchesDistrict(s));
  const declaredNgos = STK.filter(s => s[1] === "NGO" && (!district || s[2] === district)).length;
  const on = rows.filter(s => s[3] === "Onboarded").length;
  const activeContracts = rows.filter(s => s[5] === "Active").length;
  const volunteers = rows.reduce((a, s) => a + s[6], 0);
  return (
    <section className="frame on" aria-label="Stakeholders and Onboarding">
      <div className="frame-head">
        <h2>Stakeholder &amp; Onboarding</h2>
        <span className="fdesc">NGOs, agencies &amp; volunteer networks by district</span>
        <span className="spacer" />
        <div className="stakeholder-filter">
          <label htmlFor="stakeholder-district">District</label>
          <select id="stakeholder-district" value={district} onChange={e => setDistrict(e.target.value)} aria-label="Filter stakeholders by district">
            <option value="">All districts</option>
            {DISTRICTS.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
          </select>
          <span>
            {district
              ? `${declaredNgos} declared NGO${declaredNgos === 1 ? "" : "s"}${selectedDistrict ? ` of ${selectedDistrict.ngos}` : ""}`
              : `${declaredNgos} declared NGOs`}
          </span>
        </div>
        <div className="chipbtns">
          {types.map(t => (
            <button key={t} className={`chipbtn${cur === t ? " on" : ""}`} onClick={() => setCur(t)}>
              {STK_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="mkpis" style={{ marginBottom: 14 }}>
        <div className="mkpi"><div className="l">Total partners</div><div className="v">{rows.length}</div></div>
        <div className="mkpi good"><div className="l">Onboarded</div><div className="v">{on}</div></div>
        <div className="mkpi"><div className="l">Verifying</div><div className="v">{rows.filter(s => s[3] === "Verifying").length}</div></div>
        <div className="mkpi"><div className="l">Invited</div><div className="v">{rows.filter(s => s[3] === "Invited").length}</div></div>
        <div className="mkpi"><div className="l">Contracts active</div><div className="v">{activeContracts}</div></div>
        <div className="mkpi"><div className="l">Registered volunteers</div><div className="v">{fmtIN(volunteers)}</div></div>
      </div>
      <div className="stkgrid" data-mitra-id="stakeholders">
        {rows.length ? rows.map(s => (
          <div key={s[0]} className="stkcard" data-mitra-id={`stakeholder-${slug(s[0])}`}>
            <div className="sh">
              <div className="savatar" style={{ background: STK_COLORS[s[1]] }}>{initials(s[0])}</div>
              <div><div className="sname">{s[0]}</div><div className="stype">{s[1]} · {s[2]}</div></div>
            </div>
            <hr />
            <div className="srow"><span>Onboarding</span><OnboardPill s={s[3]} /></div>
            <div className="srow"><span>Assigned scope</span><b style={{ textAlign: "right", maxWidth: "65%" }}>{s[4]}</b></div>
            <div className="srow"><span>Job contract</span><ContractPill c={s[5]} /></div>
            {s[6] > 0 && <div className="srow"><span>Volunteers</span><b>{fmtIN(s[6])}</b></div>}
          </div>
        )) : (
          <div className="stakeholder-empty">
            No stakeholder records match this district and category.
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ FRAME 5 — SPECIES PLANNING ============ */
export function Frame5() {
  return (
    <section className="frame on" aria-label="Species and Agro-Climatic Planning">
      <div className="frame-head">
        <h2>Species &amp; Agro-Climatic Planning</h2>
        <span className="fdesc">Zone-wise native species &amp; allocation of the 5 crore</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
        {ZONES.map((z, zi) => {
          const alloc = zoneAlloc(zi), dc = DISTRICTS.filter(d => d.zone === zi).length;
          return (
            <div key={z.name} className="zonecard" data-mitra-id={`zone-${slug(z.name)}`}>
              <h4>{z.name}</h4>
              <div className="zmeta">{dc} district{dc > 1 ? "s" : ""} · allocation <b>{lakhToStr(alloc)}</b> of 5 Cr ({(alloc / TOT_ALLOC * 100).toFixed(1)}%)</div>
              <div className="zbar"><i style={{ width: `${(alloc / TOT_ALLOC * 100) / 0.15}%` }} /></div>
              <div className="spchips">{z.species.map(sp => <span key={sp[0]} className="spchip">{sp[0]} <em>{sp[1]}</em></span>)}</div>
            </div>
          );
        })}
      </div>
      <div className="panel" style={{ marginTop: 14 }} data-mitra-id="nursery-mapping">
        <div className="phead"><h3>Nursery → Species Mapping</h3><span className="pnote">Sample of operational nurseries (mock)</span></div>
        <div className="pbody" style={{ overflowX: "auto" }}>
          <table className="tbl">
            <tbody>
              <tr><th>Nursery</th><th>District</th><th className="num">Capacity</th><th>Species raised</th><th>Status</th></tr>
              {NURSERIES.map(n => (
                <tr key={n[0]} data-mitra-id={`nursery-${slug(n[0])}`}><td className="b">{n[0]}</td><td>{n[1]}</td><td className="num">{n[2]}</td><td className="dim">{n[3]}</td>
                  <td>{n[4] === "Operational" ? <span className="pill g">Operational</span> : <span className="pill a">Stocking</span>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ============ FRAME 6 — MONITORING & AUDIT ============ */
export function Frame6() {
  return (
    <section className="frame on" aria-label="Monitoring and Audit">
      <div className="frame-head">
        <h2>Monitoring &amp; Audit</h2>
        <span className="fdesc">Schedules, inspections, field entries &amp; issues</span>
      </div>
      <div className="panel" data-mitra-id="monitoring-calendar">
        <div className="phead"><h3>Monitoring Calendar — 2026</h3><span className="pnote">Month-by-month cycle</span></div>
        <div className="pbody monthstrip">
          {MONTHS.map((m, i) => (
            <div key={m} className={`mcell ${i < 6 ? "done" : i === 6 ? "now" : ""}`} data-mitra-id={`month-${slug(m)}`}>
              <div className="mn">{m}</div><div className="mact">{MONTH_ACTS[i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="split11" style={{ marginTop: 14 }}>
        <div className="panel" data-mitra-id="audit-log">
          <div className="phead"><h3>Audit Log — Site &amp; Nursery Inspections</h3><span className="pnote">Incl. surprise visits</span></div>
          <div className="pbody" style={{ overflowX: "auto" }}>
            <table className="tbl">
              <tbody>
                <tr><th>Date</th><th>Site</th><th>Type</th><th>Visit</th><th>Finding</th><th>Status</th></tr>
                {AUDITS.map((a, i) => (
                  <tr key={i} data-mitra-id={`audit-${slug(a[1])}`}>
                    <td className="dim" style={{ whiteSpace: "nowrap" }}>{a[0]}</td><td className="b">{a[1]}</td><td>{a[2]}</td>
                    <td>{a[3] === "Surprise" ? <span className="pill gold">Surprise</span> : <span className="pill n">Scheduled</span>}</td>
                    <td className="dim">{a[4]}</td>
                    <td>{a[5] === "Pass" ? <span className="pill g">Pass</span> : <span className="pill r">Flag</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="panel" data-mitra-id="field-feed">
            <div className="phead"><h3>Field Data-Entry Feed</h3><span className="livechip" style={{ marginLeft: "auto" }}>Live entry</span></div>
            <div className="pbody">
              {FEED.map((f, i) => (
                <div key={i} className="feeditem" data-mitra-id={`feed-${slug(`${f[1]}-${f[0]}`)}`}>
                  <span className="ftime">{f[0]}</span><span className="fdot" />
                  <div className="ftxt">
                    <div><b>{f[1]}</b> <span dangerouslySetInnerHTML={{ __html: f[2] }} /></div>
                    <div className="fsub">{f[3]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{ marginTop: 14 }} data-mitra-id="complaints">
            <div className="phead"><h3>Complaints &amp; Issues</h3><span className="pnote">Open + recently closed</span></div>
            <div className="pbody" style={{ overflowX: "auto" }}>
              <table className="tbl">
                <tbody>
                  <tr><th>ID</th><th>District</th><th>Issue</th><th>Severity</th><th>Status</th></tr>
                  {ISSUES.map(iss => (
                    <tr key={iss[0]} data-mitra-id={`issue-${slug(iss[0])}`}>
                      <td className="dim">{iss[0]}</td><td>{iss[1]}</td><td className="b">{iss[2]}</td>
                      <td>{iss[3] === "High" ? <span className="pill r">High</span> : iss[3] === "Medium" ? <span className="pill a">Medium</span> : <span className="pill n">Low</span>}</td>
                      <td>{iss[4] === "Open" ? <span className="pill r">Open</span> : iss[4] === "In progress" ? <span className="pill b">In progress</span> : <span className="pill g">Closed</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
