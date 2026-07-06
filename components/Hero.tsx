import CountUp from "./CountUp";
import Reveal from "./Reveal";

/**
 * Hero — full-bleed, dignified opening statement.
 *
 * Copy is verbatim from the programme brief. The counter tiles are
 * illustrative and explicitly labelled as such; live figures arrive via the
 * Command Center.
 */
export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-line bg-gradient-to-b from-paper via-paper to-paper-2"
    >
      {/* Quiet canopy field — native SVG texture, no external assets. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full opacity-[0.07]"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0 200 L0 140 Q60 90 120 140 Q180 80 240 130 Q300 70 360 125 Q420 85 480 135 Q540 75 600 128 Q660 88 720 138 Q780 72 840 126 Q900 84 960 134 Q1020 78 1080 130 Q1140 92 1200 140 L1200 200 Z"
          fill="var(--green)"
        />
      </svg>

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
              href="#platform"
              className="rounded-sm border border-green px-6 py-3 text-sm font-semibold text-green transition-colors hover:bg-green-tint"
            >
              View Live Dashboard
            </a>
          </div>
        </Reveal>

        {/* Live-counter tiles — illustrative */}
        <Reveal delay={400}>
          <div className="mt-14 border-t border-line pt-8">
            <dl className="grid gap-6 sm:grid-cols-3">
              <div className="border-l-2 border-gold pl-5">
                <dd className="font-serif text-3xl text-ink md:text-4xl">
                  <CountUp value={1247580} />
                </dd>
                <dt className="mt-1 text-[0.72rem] font-semibold uppercase tracking-kicker text-ink-soft">
                  Saplings Planted
                </dt>
              </div>
              <div className="border-l-2 border-gold pl-5">
                <dd className="font-serif text-3xl text-ink md:text-4xl">
                  <CountUp value={31} />
                </dd>
                <dt className="mt-1 text-[0.72rem] font-semibold uppercase tracking-kicker text-ink-soft">
                  Districts Active
                </dt>
              </div>
              <div className="border-l-2 border-gold pl-5">
                <dd className="font-serif text-3xl text-ink md:text-4xl">
                  <CountUp value={95} suffix="%" />
                </dd>
                <dt className="mt-1 text-[0.72rem] font-semibold uppercase tracking-kicker text-ink-soft">
                  Survival Rate
                </dt>
              </div>
            </dl>
            <p className="mt-5 text-xs italic text-bark">
              Illustrative figures — live data via the Command Center.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
