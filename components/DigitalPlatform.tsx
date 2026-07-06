import Link from "next/link";
import Reveal from "./Reveal";

/**
 * DigitalPlatform — the programme's digital backbone.
 *
 * Copy is verbatim. Per the brief, the platform is presented as delivered
 * under IAFT's programme management; the technology partner is acknowledged
 * only in the site footer.
 *
 * The command-center panel below is an illustrative interface concept in
 * dark-mode contrast against the light body — signalling the live
 * operational layer without presenting fabricated live numbers as real.
 */

const DISTRICT_GRID = [
  "on", "on", "on", "warn", "on", "on", "on", "on",
  "on", "on", "warn", "on", "on", "on", "off", "on",
  "on", "on", "on", "on", "warn", "on", "on", "on",
  "on", "off", "on", "on", "on", "on", "on", "warn",
] as const;

const FEED = [
  { time: "10:42", text: "Site audit completed — Tumakuru division" },
  { time: "10:37", text: "Nursery batch validated — Belagavi" },
  { time: "10:31", text: "Guardian commitment registered — Mysuru" },
  { time: "10:24", text: "District dashboard synced — Kalaburagi" },
];

function statusColor(s: (typeof DISTRICT_GRID)[number]) {
  if (s === "on") return "var(--green-2)";
  if (s === "warn") return "var(--gold-soft)";
  return "#3A4A55";
}

function CommandCenterPanel() {
  return (
    <div className="overflow-hidden rounded-md border border-navy-2 bg-navy shadow-2xl">
      {/* Panel chrome */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-kicker text-paper/70">
          Poshane · Command &amp; Control Center
        </p>
        <span className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-kicker text-gold-soft">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-gold-soft"
          />
          Live View
        </span>
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-2">
        {/* District status grid */}
        <div className="bg-navy p-5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-kicker text-paper/50">
            District Status
          </p>
          <svg
            viewBox="0 0 176 88"
            role="img"
            aria-label="Illustrative district status grid"
            className="mt-4 w-full max-w-[220px]"
          >
            {DISTRICT_GRID.map((s, i) => {
              const col = i % 8;
              const row = Math.floor(i / 8);
              return (
                <rect
                  key={i}
                  x={col * 22}
                  y={row * 22}
                  width="16"
                  height="16"
                  rx="2"
                  fill={statusColor(s)}
                  opacity={s === "off" ? 0.5 : 0.9}
                />
              );
            })}
          </svg>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.62rem] text-paper/60">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-green-2" />
              Reporting
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-gold-soft" />
              Attention
            </span>
            <span
              className="flex items-center gap-1.5"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-[2px]"
                style={{ backgroundColor: "#3A4A55" }}
              />
              Pending sync
            </span>
          </div>
        </div>

        {/* Survival gauge (mini) */}
        <div className="bg-navy p-5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-kicker text-paper/50">
            Survival Standard
          </p>
          <svg
            viewBox="0 0 140 90"
            role="img"
            aria-label="Illustrative survival gauge at ninety-five percent"
            className="mt-4 w-full max-w-[180px]"
          >
            <path
              d="M 15 80 A 55 55 0 0 1 125 80"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 15 80 A 55 55 0 0 1 125 80"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="172.7"
              strokeDashoffset="8.6"
            />
            <text
              x="70"
              y="72"
              textAnchor="middle"
              fontFamily="var(--font-fraunces), Georgia, serif"
              fontSize="26"
              fill="#F7F5EF"
            >
              95%
            </text>
            <text
              x="70"
              y="87"
              textAnchor="middle"
              fontFamily="var(--font-archivo), sans-serif"
              fontSize="7.5"
              letterSpacing="1.5"
              fill="rgba(247,245,239,0.55)"
            >
              TARGET
            </text>
          </svg>
        </div>

        {/* Live activity feed */}
        <div className="bg-navy p-5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-kicker text-paper/50">
            Activity Feed
          </p>
          <ul className="mt-4 space-y-2.5">
            {FEED.map((item) => (
              <li key={item.time} className="flex gap-3 text-[0.72rem] leading-snug">
                <span className="shrink-0 font-mono text-paper/40">
                  {item.time}
                </span>
                <span className="text-paper/80">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alerts */}
        <div className="bg-navy p-5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-kicker text-paper/50">
            Alerts
          </p>
          <ul className="mt-4 space-y-2.5 text-[0.72rem] leading-snug">
            <li className="flex items-start gap-2 text-paper/80">
              <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-soft" />
              2 districts pending monthly audit schedule
            </li>
            <li className="flex items-start gap-2 text-paper/80">
              <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-soft" />
              Nursery stock review due — Zone 4
            </li>
          </ul>
        </div>
      </div>

      <p className="border-t border-white/10 px-5 py-3 text-[0.65rem] italic text-paper/50">
        Interface concept shown for illustration.
      </p>
    </div>
  );
}

export default function DigitalPlatform() {
  return (
    <section id="platform" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            The Digital Platform
          </p>
        </Reveal>

        <div className="mt-8 grid items-start gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Reveal>
              <p className="text-lg leading-relaxed text-ink">
                A programme of this scale is only as strong as its ability to
                see itself. A single, purpose-built software platform manages
                every stage of Poshane — from nursery to sapling to survival.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-base leading-relaxed text-ink-soft">
                Updates flow in from every corner of the State. They rise into{" "}
                <strong className="text-ink">district-level dashboards</strong>
                , consolidate into a{" "}
                <strong className="text-ink">
                  state-level management dashboard
                </strong>
                , and converge in a{" "}
                <strong className="text-ink">
                  live Command &amp; Control Center
                </strong>{" "}
                — giving the programme&rsquo;s leadership a single, real-time
                view of five crore commitments taking root across Karnataka.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <Link
                href="/command-center"
                className="inline-flex items-center gap-2 rounded-sm border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-paper"
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-gold"
                />
                Enter the Command Center
              </Link>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-7" delay={140}>
            <CommandCenterPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
