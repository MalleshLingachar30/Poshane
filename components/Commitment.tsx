import Reveal from "./Reveal";

/**
 * Commitment — the programme's founding statement. Copy is verbatim.
 * Anchored as #vision for the header navigation and the hero's primary action.
 */
export default function Commitment() {
  return (
    <section id="vision" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            The Commitment
          </p>
        </Reveal>

        <div className="mt-8 grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <blockquote className="border-l-2 border-green pl-6 font-serif text-2xl leading-snug text-ink md:text-3xl">
              Justice is not confined to the courtroom. It extends to the air a
              community breathes, the water it draws, and the land it leaves to
              those who follow.
            </blockquote>
          </Reveal>

          <Reveal className="md:col-span-5" delay={120}>
            <div className="space-y-5 text-base leading-relaxed text-ink-soft">
              <p>
                The Karnataka State Legal Services Authority has undertaken
                Poshane as a social commitment — a recognition that a healthy
                environment is a shared public duty and, ultimately, a matter
                of justice for present and future generations. Over five years
                of planting, five crore saplings will be raised across
                Karnataka, not as a symbolic gesture but as a sustained,
                accountable act of ecological stewardship.
              </p>
              <p className="font-medium text-ink">
                This is a commitment measured not by how many saplings are
                planted, but by how many take root, survive, and grow.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
