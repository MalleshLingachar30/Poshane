"use client";

import React, { useMemo, useState } from "react";
import { DISTRICTS, ZONES, fmtIN, lakhFix, lakhToStr, type District } from "../data";
import {
  TALUKS_BY_DISTRICT,
  TALUK_COUNT,
  buildTalukMetrics,
  firstTalukCode,
  type TalukMetrics,
} from "../taluks";
import { useLiveDistrict } from "../live";
import { Donut, Rolling } from "./charts";

type SortKey =
  | "name"
  | "programmeShare"
  | "yearOneTarget"
  | "planted"
  | "progress"
  | "survival"
  | "ngos"
  | "volunteers"
  | "nurseries";

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function compareRows(left: TalukMetrics, right: TalukMetrics, key: SortKey) {
  if (key === "name") return left.name.localeCompare(right.name);
  return left[key] - right[key];
}

function TalukTable({
  rows,
  selectedCode,
  onSelect,
  compact = false,
}: {
  rows: readonly TalukMetrics[];
  selectedCode?: string;
  onSelect: (talukCode: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="taluk-table-wrap">
      <table className="tbl taluk-table">
        <thead>
          <tr>
            <th>Taluk</th>
            <th className="num">Programme share</th>
            <th className="num">Year-1 target</th>
            <th className="num">Planted</th>
            <th className="num">Progress</th>
            <th className="num">Survival</th>
            {!compact ? <th className="num">NGOs</th> : null}
            {!compact ? <th className="num">Volunteers</th> : null}
            {!compact ? <th className="num">Nurseries</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.code}
              className={row.code === selectedCode ? "selected" : ""}
              data-mitra-id={`taluk-${slug(row.name)}`}
            >
              <td className="b">
                <button className="taluk-link" onClick={() => onSelect(row.code)}>
                  {row.name}
                  {!compact ? <span>{row.districtName}</span> : null}
                </button>
              </td>
              <td className="num">{lakhToStr(row.programmeShare)}</td>
              <td className="num">{lakhFix(row.yearOneTarget, 2)}</td>
              <td className="num">{lakhFix(row.planted, 2)}</td>
              <td className="num">{row.progress.toFixed(1)}%</td>
              <td className={`num taluk-survival ${row.survival < 95 ? "below" : ""}`}>
                {row.survival.toFixed(1)}%
              </td>
              {!compact ? <td className="num">{row.ngos}</td> : null}
              {!compact ? <td className="num">{fmtIN(row.volunteers)}</td> : null}
              {!compact ? <td className="num">{row.nurseries}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DistrictTalukSplit({
  district,
  planted,
  onSelectTaluk,
}: {
  district: District;
  planted: number;
  onSelectTaluk: (talukCode: string) => void;
}) {
  const rows = useMemo(() => buildTalukMetrics(district, planted), [district, planted]);
  return (
    <div className="panel district-taluk-panel" data-mitra-id="district-taluk-split">
      <div className="phead">
        <h3>Taluk Allocation Split — {district.name}</h3>
        <span className="pnote">{rows.length} taluks · district totals fully reconciled</span>
      </div>
      <div className="pbody">
        <TalukTable rows={rows} onSelect={onSelectTaluk} compact />
      </div>
    </div>
  );
}

export function TalukFrame({
  districtCode,
  talukCode,
  onDistrictChange,
  onTalukChange,
}: {
  districtCode: string;
  talukCode: string;
  onDistrictChange: (districtCode: string) => void;
  onTalukChange: (talukCode: string) => void;
}) {
  const district = DISTRICTS.find((item) => item.code === districtCode) ?? DISTRICTS[5];
  const districtPlanted = useLiveDistrict(district.code);
  const rows = useMemo(
    () => buildTalukMetrics(district, districtPlanted),
    [district, districtPlanted]
  );
  const selected = rows.find((row) => row.code === talukCode) ?? rows[0];
  const zone = ZONES[district.zone];
  const [query, setQuery] = useState("");
  const [survivalFilter, setSurvivalFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [descending, setDescending] = useState(false);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        const searchable = [
          row.name,
          row.code,
          row.districtName,
          row.programmeShare,
          row.yearOneTarget,
          row.planted,
          row.progress.toFixed(1),
          row.survival.toFixed(1),
          row.ngos,
          row.volunteers,
          row.nurseries,
        ].join(" ").toLowerCase();
        const matchesSearch = !needle || searchable.includes(needle);
        const matchesSurvival = survivalFilter === "all"
          || (survivalFilter === "below" ? row.survival < 95 : row.survival >= 95);
        const matchesProgress = progressFilter === "all"
          || (progressFilter === "under-60" ? row.progress < 60
            : progressFilter === "60-75" ? row.progress >= 60 && row.progress < 75
            : row.progress >= 75);
        return matchesSearch && matchesSurvival && matchesProgress;
      })
      .sort((left, right) => {
        const result = compareRows(left, right, sortKey);
        return descending ? -result : result;
      });
  }, [descending, progressFilter, query, rows, sortKey, survivalFilter]);

  const handleDistrictChange = (nextDistrictCode: string) => {
    setQuery("");
    setSurvivalFilter("all");
    setProgressFilter("all");
    onDistrictChange(nextDistrictCode);
    onTalukChange(firstTalukCode(nextDistrictCode));
  };

  if (!selected) return null;
  return (
    <section className="frame on" aria-label="Taluk Drill-Down">
      <div className="frame-head">
        <h2>Taluk Drill-Down</h2>
        <span className="fdesc">District-linked operational split · {TALUK_COUNT} taluks statewide</span>
        <span className="spacer" />
        <select
          className="dselect"
          value={district.code}
          onChange={(event) => handleDistrictChange(event.target.value)}
          aria-label="Select parent district"
        >
          {DISTRICTS.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
        <select
          className="dselect"
          value={selected.code}
          onChange={(event) => onTalukChange(event.target.value)}
          aria-label="Select taluk"
        >
          {(TALUKS_BY_DISTRICT[district.code] ?? []).map((item) => (
            <option key={item.code} value={item.code}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="taluk-crumb" aria-label="Administrative hierarchy">
        <span>Karnataka</span><i>›</i><span>{district.name}</span><i>›</i><b>{selected.name}</b>
      </div>

      <div className="mkpis taluk-kpis" data-mitra-id="taluk-kpis">
        <div className="mkpi"><div className="l">Programme share</div><div className="v">{lakhToStr(selected.programmeShare)}</div></div>
        <div className="mkpi"><div className="l">Year-1 target</div><div className="v">{lakhFix(selected.yearOneTarget, 2)}</div></div>
        <div className="mkpi good"><div className="l">Planted to date</div><div className="v">
          <Rolling key={selected.code} value={selected.planted} format={(value) => lakhFix(value, 2)} />{" "}
          <em>· {selected.progress.toFixed(1)}% of Y1</em>
        </div></div>
        <div className={`mkpi ${selected.survival < 95 ? "bad" : "good"}`}><div className="l">Survival</div><div className="v">{selected.survival.toFixed(1)}% <em>vs 95%</em></div></div>
        <div className="mkpi"><div className="l">Active NGOs</div><div className="v">{selected.ngos}</div></div>
        <div className="mkpi"><div className="l">Volunteers</div><div className="v">{fmtIN(selected.volunteers)}</div></div>
        <div className="mkpi"><div className="l">Nurseries</div><div className="v">{selected.nurseries}</div></div>
      </div>

      <div className="taluk-layout">
        <div className="panel" data-mitra-id="taluk-directory">
          <div className="phead">
            <h3>Taluk Allocation Directory — {district.name}</h3>
            <span className="pnote">Search and sort every operational parameter</span>
          </div>
          <div className="pbody">
            <div className="filters taluk-filters">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search taluk or any value…"
                aria-label="Search all taluk parameters"
              />
              <select value={survivalFilter} onChange={(event) => setSurvivalFilter(event.target.value)} aria-label="Filter by survival">
                <option value="all">All survival</option>
                <option value="below">Below 95% standard</option>
                <option value="standard">At / above standard</option>
              </select>
              <select value={progressFilter} onChange={(event) => setProgressFilter(event.target.value)} aria-label="Filter by progress">
                <option value="all">All progress</option>
                <option value="under-60">Under 60%</option>
                <option value="60-75">60–75%</option>
                <option value="75-plus">75% and above</option>
              </select>
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} aria-label="Sort taluks">
                <option value="name">Sort: Taluk</option>
                <option value="programmeShare">Sort: Programme share</option>
                <option value="yearOneTarget">Sort: Year-1 target</option>
                <option value="planted">Sort: Planted</option>
                <option value="progress">Sort: Progress</option>
                <option value="survival">Sort: Survival</option>
                <option value="ngos">Sort: NGOs</option>
                <option value="volunteers">Sort: Volunteers</option>
                <option value="nurseries">Sort: Nurseries</option>
              </select>
              <button
                className="sort-direction"
                onClick={() => setDescending((current) => !current)}
                aria-label={descending ? "Sort ascending" : "Sort descending"}
                title={descending ? "Descending" : "Ascending"}
              >
                {descending ? "↓" : "↑"}
              </button>
              <span className="count">{visibleRows.length} of {rows.length} taluks</span>
            </div>
            {visibleRows.length ? (
              <TalukTable rows={visibleRows} selectedCode={selected.code} onSelect={onTalukChange} />
            ) : (
              <div className="taluk-empty">No taluk matches all active filters.</div>
            )}
          </div>
        </div>

        <div className="grid taluk-side">
          <div className="panel" data-mitra-id="taluk-land-split">
            <div className="phead"><h3>{selected.name} — Land Split</h3><span className="pnote">Mock allocation</span></div>
            <div className="pbody taluk-donut">
              <Donut gPct={Number(selected.governmentLandPct.toFixed(1))} />
              <div className="legendrow">
                <span className="k"><span className="sw" style={{ background: "#1C5A33" }} />Government &amp; community — {selected.governmentLandPct.toFixed(0)}%</span>
                <span className="k"><span className="sw" style={{ background: "#DCD3BE" }} />Private / institutional — {(100 - selected.governmentLandPct).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          <div className="panel" data-mitra-id="taluk-zone">
            <div className="phead"><h3>Agro-Climatic Zone</h3></div>
            <div className="pbody">
              <div className="tag" style={{ marginBottom: 5 }}>Zone inherited from {district.name}</div>
              <div className="taluk-zone-name">{zone.name}</div>
              <div className="tag" style={{ marginBottom: 7 }}>Recommended native species</div>
              <div className="spchips">{zone.species.map((species) => <span key={species[0]} className="spchip">{species[0]} <em>{species[1]}</em></span>)}</div>
            </div>
          </div>
          <div className="panel" data-mitra-id="taluk-monitoring">
            <div className="phead"><h3>Monitoring Cadence</h3><span className="pnote">Taluk committee</span></div>
            <div className="pbody">
              <div className="taluk-cadence">
                <b>Fortnightly</b><span>during planting season</span>
                <b>Monthly</b><span>after establishment</span>
                <b>Escalation</b><span>survival below 95% to district unit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
