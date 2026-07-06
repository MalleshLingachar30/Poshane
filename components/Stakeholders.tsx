import Reveal from "./Reveal";

/**
 * Stakeholders — government agencies, qualified NGOs and trained volunteer
 * networks as three coordinated pillars, with a row of placeholder partner
 * logo slots beneath.
 */

const PILLARS = [
  {
    name: "Government Agencies",
    body: "Departments and public bodies whose mandates, land and field machinery anchor the programme across every district of the State.",
  },
  {
    name: "Qualified NGOs",
    body: "Vetted civil-society organisations bringing community trust, local knowledge and sustained on-ground presence to each planting site.",
  },
  {
    name: "Trained Volunteer Networks",
    body: "Citizens trained to plant, nurture and report — the widest layer of hands and eyes, working in close coordination with agencies and NGOs.",
  },
];

const LOGO_SLOTS = 6;

export default function Stakeholders() {
  return (
    <section id="partners" className="border-b border-line bg-paper-2">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            Stakeholders &amp; Partners
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-8 max-w-3xl font-serif text-3xl leading-snug text-ink md:text-4xl">
            Three coordinated pillars, one programme.
          </h2>
        </Reveal>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal as="li" key={pillar.name} delay={i * 110}>
              <article className="flex h-full flex-col rounded-sm border border-line bg-paper p-7">
                <div aria-hidden="true" className="h-1 w-10 bg-green" />
                <h3 className="mt-5 font-serif text-xl text-ink">
                  {pillar.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {pillar.body}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>

        {/* Partner logo slots */}
        <Reveal delay={160}>
          <div className="mt-14">
            <p className="text-[0.68rem] font-semibold uppercase tracking-kicker text-ink-soft">
              Programme Partners
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: LOGO_SLOTS }).map((_, i) => (
                <li
                  key={i}
                  className="flex h-20 items-center justify-center rounded-sm border border-dashed border-line bg-paper text-[0.65rem] font-medium uppercase tracking-kicker text-bark/70"
                >
                  Partner logo
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
