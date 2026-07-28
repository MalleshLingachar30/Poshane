import CanopyDivider from "./CanopyDivider";
import PublicLiveStats from "./PublicLiveStats";
import Reveal from "./Reveal";

/**
 * Hero — full-bleed, dignified opening statement.
 *
 * Copy is verbatim from the programme brief. Public live figures use the same
 * programme snapshot as the Command Center.
 */
export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-line bg-gradient-to-b from-paper via-paper to-paper-2"
    >
      {/* Quiet canopy field — native SVG texture, no external assets. */}
      <CanopyDivider />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green md:text-[0.78rem]">
            <span className="font-kannada normal-case tracking-normal text-green">
              ಪೋಷಣೆ
            </span>{" "}
            Poshane — The KSLSA Five Crore Green Commitment for Karnataka
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Five Crore Saplings. Five Years. One Accountable Karnataka.
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            Poshane — a social commitment of the Karnataka State Legal Services
            Authority to restore and strengthen the State&rsquo;s living
            environment: planted with rigour, protected by guardianship, and
            verified on the ground.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#vision"
              className="rounded-sm bg-green px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-green-2"
            >
              Explore the Programme
            </a>
            <a
              href="#districts"
              className="rounded-sm border border-green px-6 py-3 text-sm font-semibold text-green transition-colors hover:bg-green-tint"
            >
              View District Snapshot
            </a>
          </div>
        </Reveal>

        {/* Public live snapshot */}
        <Reveal delay={400}>
          <div className="mt-14 border-t border-line pt-8">
            <PublicLiveStats />
            <p className="mt-5 text-xs italic text-bark">
              Prototype live figures — synchronised with the Command Center
              demonstration feed.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
