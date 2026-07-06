import Reveal from "./Reveal";
import KarnatakaMap from "./KarnatakaMap";

/**
 * ScaleReach — the programme's footprint.
 *
 * Contains three native SVG visuals (no external tiles or imagery):
 *  1. A simplified schematic of Karnataka distinguishing the Bengaluru
 *     region (2 crore) from the rest of the State (3 crore).
 *  2. A 2cr/3cr allocation donut.
 *  3. A phased timeline strip across the eight-year arc.
 *
 * All copy is verbatim from the programme brief.
 */

/* Donut geometry: 2/5 (40%) Bengaluru, 3/5 (60%) rest of Karnataka. */
const DONUT_R = 64;
const DONUT_C = 2 * Math.PI * DONUT_R;

const PHASES = [
  {
    title: "Phase 0 (2026–2027): Foundation.",
    body: "Nurseries built, systems and protocols established, guardianship networks formed — survival engineered before the first sapling reaches the ground.",
  },
  {
    title: "Phases 1–5 (2027–2032): Planting.",
    body: "Five years of field planting, each cycle beginning with the June–July monsoon that gives young saplings their strongest start.",
  },
  {
    title: "Phases 6–7 (2032–2034): Survival Assurance.",
    body: "Two years of sustained monitoring, guardianship and audit — because the measure of success is what survives, not what was planted.",
  },
];

function AllocationDonut() {
  const bengaluruShare = 2 / 5;
  const bengaluruArc = DONUT_C * bengaluruShare;

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Allocation donut chart: two crore saplings for the Bengaluru region, three crore for the rest of Karnataka"
      className="w-full max-w-[220px]"
    >
      {/* Rest of Karnataka — 3 crore (60%) */}
      <circle
        cx="100"
        cy="100"
        r={DONUT_R}
        fill="none"
        stroke="var(--green-2)"
        strokeWidth="26"
      />
      {/* Bengaluru — 2 crore (40%) */}
      <circle
        cx="100"
        cy="100"
        r={DONUT_R}
        fill="none"
        stroke="var(--green)"
        strokeWidth="26"
        strokeDasharray={`${bengaluruArc} ${DONUT_C - bengaluruArc}`}
        strokeDashoffset={DONUT_C / 4}
        strokeLinecap="butt"
      />
      <text
        x="100"
        y="94"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontSize="30"
        fill="var(--ink)"
      >
        5cr
      </text>
      <text
        x="100"
        y="114"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="10"
        letterSpacing="1.5"
        fill="var(--ink-soft)"
      >
        SAPLINGS
      </text>
    </svg>
  );
}

export default function ScaleReach() {
  return (
    <section id="scale" className="border-b border-line bg-paper-2">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            Scale &amp; Reach
          </p>
        </Reveal>

        <Reveal delay={80}>
          <p className="mt-8 max-w-3xl font-serif text-2xl leading-snug text-ink md:text-[1.75rem]">
            Five crore saplings. Two crore in and around Bengaluru, restoring
            green cover where the State&rsquo;s population and infrastructure
            press hardest on the environment. Three crore across the rest of
            Karnataka — its farmlands, forest fringes, degraded commons and
            institutional lands — knitting a wider canopy of resilience.
          </p>
        </Reveal>

        {/* Schematic + donut */}
        <div className="mt-14 grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <figure className="flex justify-center md:justify-start">
              <KarnatakaMap />
            </figure>
          </Reveal>

          <Reveal delay={120}>
            <figure className="flex flex-col items-center gap-6">
              <AllocationDonut />
              <figcaption className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-ink-soft">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-sm bg-green"
                  />
                  Bengaluru region — 2 crore
                </span>
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-sm bg-green-2"
                  />
                  Rest of Karnataka — 3 crore
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Phased timeline strip */}
        <div className="mt-20">
          <Reveal>
            <p className="max-w-3xl text-lg leading-relaxed text-ink">
              <strong className="font-semibold">
                A programme designed around survival — not just planting.
              </strong>{" "}
              One year to prepare. Five years to plant. Two years to ensure
              what is planted endures.
            </p>
          </Reveal>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
            {PHASES.map((phase, i) => (
              <Reveal as="li" key={phase.title} delay={i * 120} className="bg-paper p-7">
                <div
                  aria-hidden="true"
                  className="mb-5 h-1 w-10 bg-green"
                  style={{ opacity: 0.5 + i * 0.25 }}
                />
                <h3 className="font-serif text-lg leading-snug text-ink">
                  {phase.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {phase.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
