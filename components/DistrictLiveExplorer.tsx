"use client";

import { useMemo, useState } from "react";
import {
  DISTRICTS,
  ZONES,
  fmtIN,
  lakhFix,
  y1Of,
  type District,
} from "@/app/command-center/data";
import { liveProg, useLiveSnapshot } from "@/app/command-center/live";
import Reveal from "./Reveal";

const LAKH = 100_000;

function statLabel(value: string, label: string, note?: string) {
  return (
    <div className="border-t border-line pt-4">
      <p className="font-serif text-2xl leading-none text-ink">{value}</p>
      <p className="mt-2 text-[0.66rem] font-semibold uppercase tracking-kicker text-ink-soft">
        {label}
      </p>
      {note ? <p className="mt-1 text-xs text-bark">{note}</p> : null}
    </div>
  );
}

function districtRoom(district: District, planted: number) {
  return Math.max(0, y1Of(district) * 0.94 - planted);
}

export default function DistrictLiveExplorer() {
  const live = useLiveSnapshot();
  const [selectedCode, setSelectedCode] = useState("BNU");

  const rows = useMemo(() => {
    const maxPlanted = DISTRICTS.reduce(
      (max, district) => Math.max(max, live.planted[district.code] ?? 0),
      0
    );

    return DISTRICTS
      .map((district) => {
        const planted = live.planted[district.code] ?? 0;
        return {
          district,
          planted,
          progress: liveProg(district.code, planted),
          width: maxPlanted > 0 ? (planted / maxPlanted) * 100 : 0,
        };
      })
      .sort((a, b) => b.planted - a.planted);
  }, [live]);

  const topRows = rows.slice(0, 8);
  const selected = rows.find((row) => row.district.code === selectedCode) ?? rows[0];
  const district = selected.district;
  const plantedTrees = selected.planted * LAKH;
  const target = y1Of(district);
  const zone = ZONES[district.zone];
  const species = zone.species.slice(0, 4).map(([name]) => name).join(", ");

  return (
    <section id="districts" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            District Live View
          </p>
        </Reveal>

        <Reveal className="mt-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:items-end">
            <h2 className="max-w-2xl font-serif text-3xl leading-snug text-ink md:text-4xl">
              Public district statistics, drawn from the same programme
              snapshot as the Command Center.
            </h2>
            <div className="space-y-6">
              <p className="max-w-measure text-base leading-relaxed text-ink-soft">
                Select any district to see planting progress, survival, local
                mobilisation and nursery strength at the current point in time.
                The distribution below shows the top eight districts by
                saplings planted to date.
              </p>
              <label className="block max-w-sm">
                <span className="text-[0.68rem] font-semibold uppercase tracking-kicker text-ink-soft">
                  Select District
                </span>
                <select
                  value={selectedCode}
                  onChange={(event) => setSelectedCode(event.target.value)}
                  className="mt-3 w-full rounded-sm border border-line bg-paper-2 px-4 py-3 text-sm font-semibold text-ink outline-none transition-colors focus:border-green"
                >
                  {DISTRICTS.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {!topRows.some((row) => row.district.code === selectedCode) ? (
                  <span className="mt-2 block text-xs text-bark">
                    Showing {district.name} details on the left; the leaderboard
                    remains the current top eight.
                  </span>
                ) : null}
              </label>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
          <Reveal className="h-full">
            <div className="h-full">
              <div className="h-full rounded-sm border border-line bg-paper-2 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-kicker text-green">
                      {district.code} · {zone.name}
                    </p>
                    <h3 className="mt-3 font-serif text-3xl leading-none text-ink">
                      {district.name}
                    </h3>
                  </div>
                  <p className="rounded-sm border border-green/25 bg-green-tint px-3 py-2 text-xs font-semibold text-green">
                    {selected.progress.toFixed(0)}% of Y1 target
                  </p>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {statLabel(
                    lakhFix(selected.planted, 2),
                    "Planted to date",
                    `${fmtIN(plantedTrees)} saplings`
                  )}
                  {statLabel(lakhFix(target, 2), "Year-1 target")}
                  {statLabel(`${district.survival.toFixed(1)}%`, "Survival")}
                  {statLabel(lakhFix(districtRoom(district, selected.planted), 2), "Headroom")}
                  {statLabel(String(district.ngos), "Active NGOs")}
                  {statLabel(fmtIN(district.volunteers), "Volunteers")}
                  {statLabel(String(district.nurseries), "Nurseries")}
                  {statLabel(lakhFix(district.alloc, 1), "Programme share")}
                </div>

                <p className="mt-7 border-t border-line pt-4 text-sm leading-relaxed text-ink-soft">
                  Suggested species mix:{" "}
                  <span className="font-medium text-ink">{species}</span>.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-sm border border-line bg-paper-2">
              <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
                <div>
                  <h3 className="font-serif text-xl text-ink">
                    Top 8 Districts
                  </h3>
                  <p className="mt-1 text-xs text-ink-soft">
                    Lakh saplings planted · live programme feed
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-kicker text-green">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Live
                </span>
              </div>

              <div>
                {topRows.map((row, index) => {
                  const active = row.district.code === district.code;
                  return (
                    <button
                      key={row.district.code}
                      type="button"
                      onClick={() => setSelectedCode(row.district.code)}
                      className={`grid w-full grid-cols-[2.25rem_minmax(0,1fr)_4.75rem] items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 ${
                        active ? "bg-green-tint" : "bg-paper-2 hover:bg-paper"
                      }`}
                      aria-pressed={active}
                    >
                      <span className="font-mono text-xs text-bark">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-ink">
                            {row.district.name}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-green">
                            {row.progress.toFixed(0)}%
                          </span>
                        </span>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line">
                          <span
                            className="block h-full rounded-full bg-green"
                            style={{ width: `${Math.max(3, row.width)}%` }}
                          />
                        </span>
                      </span>
                      <span className="text-right font-serif text-lg text-ink">
                        {lakhFix(row.planted, 1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
