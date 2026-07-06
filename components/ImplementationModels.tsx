import Reveal from "./Reveal";

/**
 * ImplementationModels — fit-for-context planting models, one per terrain.
 * Copy is verbatim from the programme brief.
 *
 * Each card carries a small native-SVG glyph suggesting its terrain — quiet,
 * schematic marks rather than illustration.
 */

const MODELS: {
  title: string;
  body: string;
  glyph: React.ReactNode;
}[] = [
  {
    title: "Urban & peri-urban (Bengaluru)",
    body: "high-density greening within a built environment.",
    glyph: (
      // Buildings with canopy between
      <g>
        <rect x="4" y="14" width="7" height="18" fill="var(--green)" opacity="0.25" />
        <rect x="25" y="8" width="7" height="24" fill="var(--green)" opacity="0.25" />
        <circle cx="18" cy="22" r="6" fill="var(--green)" />
        <rect x="17" y="26" width="2" height="6" fill="var(--bark)" />
      </g>
    ),
  },
  {
    title: "Rural farmland",
    body: "agroforestry models integrated with farmer livelihoods.",
    glyph: (
      // Furrow lines with a tree
      <g>
        <path d="M2 30h32M2 25h32M2 20h32" stroke="var(--green)" strokeWidth="1.4" opacity="0.35" />
        <circle cx="27" cy="12" r="5.5" fill="var(--green)" />
        <rect x="26" y="16" width="2" height="8" fill="var(--bark)" />
      </g>
    ),
  },
  {
    title: "Forest-fringe",
    body: "restoration that buffers and extends existing forest.",
    glyph: (
      // Dense canopy meeting open ground
      <g>
        <circle cx="8" cy="16" r="6" fill="var(--green)" />
        <circle cx="16" cy="12" r="6" fill="var(--green)" opacity="0.8" />
        <circle cx="24" cy="17" r="5" fill="var(--green)" opacity="0.55" />
        <circle cx="31" cy="21" r="4" fill="var(--green)" opacity="0.3" />
        <path d="M2 30h32" stroke="var(--bark)" strokeWidth="1.4" />
      </g>
    ),
  },
  {
    title: "Degraded & common land",
    body: "rehabilitation of stressed and neglected ground.",
    glyph: (
      // Broken ground with a new sapling
      <g>
        <path d="M2 28h9M14 28h8M25 28h9" stroke="var(--bark)" strokeWidth="1.6" />
        <path d="M18 28v-8M18 20c0-3 3-4 5-4M18 23c0-2-2-3-4-3" stroke="var(--green)" strokeWidth="1.6" fill="none" />
      </g>
    ),
  },
  {
    title: "Institutional campuses",
    body: "structured planting on public and institutional lands.",
    glyph: (
      // Formal building with flanking trees
      <g>
        <rect x="12" y="14" width="12" height="16" fill="none" stroke="var(--green)" strokeWidth="1.5" />
        <path d="M10 14l8-6 8 6" fill="none" stroke="var(--green)" strokeWidth="1.5" />
        <circle cx="6" cy="22" r="4" fill="var(--green)" opacity="0.6" />
        <circle cx="30" cy="22" r="4" fill="var(--green)" opacity="0.6" />
      </g>
    ),
  },
];

export default function ImplementationModels() {
  return (
    <section id="models" className="border-b border-line bg-paper-2">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            Implementation Models
          </p>
        </Reveal>

        <Reveal delay={80}>
          <p className="mt-8 max-w-3xl font-serif text-2xl leading-snug text-ink md:text-[1.75rem]">
            Karnataka is not one landscape, and Poshane does not treat it as
            one. Each site is planted using a model matched to its context:
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {MODELS.map((model, i) => (
            <Reveal as="li" key={model.title} delay={i * 90}>
              <article className="flex h-full flex-col rounded-sm border border-line bg-paper p-6">
                <svg
                  viewBox="0 0 36 36"
                  aria-hidden="true"
                  className="h-10 w-10"
                >
                  {model.glyph}
                </svg>
                <h3 className="mt-5 text-sm font-semibold leading-snug text-ink">
                  {model.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {model.body}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={150}>
          <p className="mt-10 max-w-measure text-base font-medium leading-relaxed text-ink">
            One programme, many methods — each grounded in the science of what
            will actually survive where it is planted.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
