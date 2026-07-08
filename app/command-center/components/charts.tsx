"use client";
import React from "react";

/* ---------- Line / area chart ---------- */
export interface LineSeries { name: string; color: string; data: number[]; dash?: boolean; fill?: boolean }
export function LineChart({ labels, series, ymin = 0, ymax, target, targetLabel, yFmt, aria }: {
  labels: string[]; series: LineSeries[]; ymin?: number; ymax: number;
  target?: number; targetLabel?: string; yFmt?: (v: number) => string; aria?: string;
}) {
  const W = 580, H = 250, pl = 46, pr = 14, pt = 16, pb = 30;
  const pw = W - pl - pr, ph = H - pt - pb, n = labels.length;
  const X = (i: number) => pl + (n === 1 ? pw / 2 : (i * pw) / (n - 1));
  const Y = (v: number) => pt + ph * (1 - (v - ymin) / (ymax - ymin));
  const steps = 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
      {Array.from({ length: steps + 1 }, (_, i) => {
        const v = ymin + ((ymax - ymin) * i) / steps, yy = Y(v);
        return (
          <g key={i}>
            <line className="gline" x1={pl} y1={yy} x2={W - pr} y2={yy} />
            <text className="axlbl" x={pl - 7} y={yy + 3} textAnchor="end">{yFmt ? yFmt(v) : Math.round(v)}</text>
          </g>
        );
      })}
      {labels.map((l, i) => <text key={l + i} className="axlbl" x={X(i)} y={H - 10} textAnchor="middle">{l}</text>)}
      {target != null && (
        <g>
          <line x1={pl} y1={Y(target)} x2={W - pr} y2={Y(target)} stroke="#C09A3E" strokeWidth={1.6} strokeDasharray="5 4" />
          <text x={W - pr} y={Y(target) - 5} textAnchor="end" fontSize={9.5} fill="#8F7326" fontWeight={700} fontFamily="var(--sans)">{targetLabel}</text>
        </g>
      )}
      {series.map(se => {
        const pts = se.data.map((v, i) => [X(i), Y(v)] as [number, number]);
        const dstr = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
        const last = pts[pts.length - 1];
        return (
          <g key={se.name}>
            {se.fill && <path d={`${dstr} L ${pts[pts.length - 1][0]} ${Y(ymin)} L ${pts[0][0]} ${Y(ymin)} Z`} fill={se.color} opacity={0.12} />}
            <path d={dstr} fill="none" stroke={se.color} strokeWidth={2.4} strokeDasharray={se.dash ? "6 5" : undefined} strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={se.color} stroke="#F7F3E9" strokeWidth={1.4} />)}
            <text className="serieslabel" x={Math.min(last[0] + 6, W - 4)} y={last[1] - 7} fill={se.color} textAnchor="end">{se.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Grouped horizontal bars ---------- */
export function HBars({ rows, colors, names, legend, fmt, max, pl = 190, rowH }: {
  rows: [string, number[]][]; colors: string[]; names: string[];
  legend?: boolean; fmt?: (v: number) => string; max?: number; pl?: number; rowH?: number;
}) {
  const W = 580, bw = 13, pr = 52;
  const rh = rowH ?? names.length * 15 + 22;
  const pt = legend ? 26 : 8;
  const H = pt + rows.length * rh + 6;
  const mx = max ?? Math.max(...rows.flatMap(r => r[1]));
  let lx = pl;
  return (
    <svg viewBox={`0 0 ${W} ${H}`}>
      {legend && names.map((nm, i) => {
        const x = lx; lx += 15 + nm.length * 6 + 18;
        return (
          <g key={nm}>
            <rect x={x} y={6} width={11} height={11} rx={3} fill={colors[i]} />
            <text className="axlbl" x={x + 15} y={15} fontSize={10}>{nm}</text>
          </g>
        );
      })}
      {rows.map((r, ri) => {
        const y0 = pt + ri * rh + 6;
        return (
          <g key={r[0] + ri}>
            <text x={pl - 8} y={y0 + (r[1].length * bw) / 2 + 4} textAnchor="end" fontSize={10.6} fill="#1F2430" fontWeight={600} fontFamily="var(--sans)">{r[0]}</text>
            {r[1].map((v, vi) => {
              const w = Math.max(2, ((W - pl - pr) * v) / mx), yy = y0 + vi * (bw + 2);
              return (
                <g key={vi}>
                  <rect x={pl} y={yy} width={w} height={bw} rx={3.5} fill={colors[vi]} />
                  <text x={pl + w + 5} y={yy + bw - 3} fontSize={9.6} fill="#5B6070" fontFamily="var(--sans)">{fmt ? fmt(v) : v}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Donut (govt vs private land split) ---------- */
export function Donut({ gPct }: { gPct: number }) {
  const R = 42, C = 2 * Math.PI * R, g = (C * gPct) / 100;
  return (
    <svg viewBox="0 0 120 120" width={128} height={128} role="img" aria-label="Government versus private split">
      <circle cx={60} cy={60} r={R} fill="none" stroke="#DCD3BE" strokeWidth={17} />
      <circle cx={60} cy={60} r={R} fill="none" stroke="#1C5A33" strokeWidth={17}
        strokeDasharray={`${g} ${C - g}`} strokeDashoffset={C / 4} />
      <text x={60} y={57} textAnchor="middle" fontFamily="var(--serif)" fontSize={19} fontWeight={600} fill="#1F2430">{gPct}%</text>
      <text x={60} y={73} textAnchor="middle" fontSize={8.5} fill="#5B6070" fontFamily="var(--sans)">GOVT LAND</text>
    </svg>
  );
}

/* ---------- Status pills ---------- */
export function OnboardPill({ s }: { s: string }) {
  return s === "Onboarded" ? <span className="pill g">Onboarded</span>
    : s === "Verifying" ? <span className="pill a">Verifying</span>
    : <span className="pill b">Invited</span>;
}
export function ContractPill({ c }: { c: string }) {
  return c === "Active" ? <span className="pill g">Active</span>
    : c === "Signed" ? <span className="pill b">Signed</span>
    : c === "Drafted" ? <span className="pill a">Drafted</span>
    : c === "Completed" ? <span className="pill n">Completed</span>
    : <span className="pill n">—</span>;
}
