import Reveal from "./Reveal";

/**
 * Governance — IAFT's role as Program Management & Principal Scientific
 * Advisor, and the chain of responsibility from owning authority to field.
 * All copy is verbatim from the programme brief.
 */

const CHAIN = [
  {
    name: "KSLSA",
    role: "the owning authority and social conscience of the programme.",
  },
  {
    name: "IAFT",
    role: "Program Management & Principal Scientific Advisor.",
  },
  {
    name: "Government agencies, qualified NGOs and trained volunteer networks",
    role: "the coordinated hands that carry it out.",
  },
];

export default function Governance() {
  return (
    <section id="governance" className="border-b border-line bg-paper-2">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            Governance &amp; Scientific Advisory
          </p>
        </Reveal>

        <div className="mt-8 grid gap-12 md:grid-cols-12">
          <div className="space-y-6 md:col-span-7">
            <Reveal>
              <p className="text-base leading-relaxed text-ink-soft">
                Poshane is managed and scientifically guided by{" "}
                <strong className="text-ink">
                  IAFT — the Institute of Agroforestry, Farmers and
                  Technologists
                </strong>
                , in its role as Program Management &amp; Principal Scientific
                Advisor. IAFT is Karnataka&rsquo;s premier institution in
                agroforestry, biodiversity and ecology. Founded by retired
                senior forest officers, it brings a rare multidisciplinary
                bench: forestry, agriculture and horticulture experts, seed
                technology specialists, international scientists and academia —
                the collective knowledge base on which the 95% survival
                standard rests.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-base leading-relaxed text-ink-soft">
                IAFT&rsquo;s scientific advisory reaches down to the level of
                the individual site. It issues site-specific planting
                recommendations and enforces validated nursery development
                protocols, ensuring that the saplings leaving each nursery are
                the right species, healthy and hardened for the ground that
                awaits them. Survival, in Poshane, begins long before a sapling
                reaches the field.
              </p>
            </Reveal>
          </div>

          {/* Chain of responsibility */}
          <Reveal className="md:col-span-5" delay={140}>
            <figure
              role="img"
              aria-label="Chain of responsibility: KSLSA, the owning authority and social conscience of the programme; IAFT, Program Management and Principal Scientific Advisor; government agencies, qualified NGOs and trained volunteer networks, the coordinated hands that carry it out"
              className="rounded-sm border border-line bg-paper p-7"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-kicker text-ink-soft">
                Chain of Responsibility
              </p>
              <ol className="mt-5">
                {CHAIN.map((tier, i) => (
                  <li key={tier.name} className="relative">
                    <div className="rounded-sm border border-green/25 bg-green-tint px-4 py-3.5">
                      <p className="text-sm font-semibold leading-snug text-green">
                        {tier.name}
                      </p>
                      <p className="mt-1 text-sm leading-snug text-ink-soft">
                        {tier.role}
                      </p>
                    </div>
                    {i < CHAIN.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="flex justify-center py-1.5 text-green"
                      >
                        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                          <path
                            d="M6 0v13M1 9l5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
