import Reveal from "./Reveal";

/**
 * Guardianship — the land-guardianship model and the independent audit layer.
 * Copy is verbatim. The accountability chain and audit-verification loop are
 * rendered as one native SVG diagram.
 */

function AuditLoopDiagram() {
  return (
    <svg
      viewBox="0 0 640 300"
      role="img"
      aria-label="Accountability chain and audit loop: a planting site is assigned to a named guardian who makes a survival commitment; surprise ground audits verify the site's true condition, and verified data feeds the programme dashboards"
      className="w-full"
    >
      <defs>
        <marker
          id="arrow-green"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10z" fill="var(--green)" />
        </marker>
        <marker
          id="arrow-bark"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10z" fill="var(--bark)" />
        </marker>
      </defs>

      {/* Accountability chain: site → guardian → commitment → verification */}
      {[
        { x: 20, label1: "Planting", label2: "Site" },
        { x: 180, label1: "Named", label2: "Guardian" },
        { x: 340, label1: "Survival", label2: "Commitment" },
        { x: 500, label1: "Ground", label2: "Verification" },
      ].map((node, i) => (
        <g key={node.label2}>
          <rect
            x={node.x}
            y="60"
            width="120"
            height="64"
            rx="3"
            fill="var(--green-tint)"
            stroke="var(--green)"
            strokeWidth="1.5"
          />
          <text
            x={node.x + 60}
            y="87"
            textAnchor="middle"
            fontFamily="var(--font-archivo), sans-serif"
            fontSize="13"
            fontWeight="600"
            fill="var(--green)"
          >
            {node.label1}
          </text>
          <text
            x={node.x + 60}
            y="105"
            textAnchor="middle"
            fontFamily="var(--font-archivo), sans-serif"
            fontSize="13"
            fontWeight="600"
            fill="var(--green)"
          >
            {node.label2}
          </text>
          {i < 3 && (
            <line
              x1={node.x + 122}
              y1="92"
              x2={node.x + 158}
              y2="92"
              stroke="var(--green)"
              strokeWidth="1.5"
              markerEnd="url(#arrow-green)"
            />
          )}
        </g>
      ))}

      {/* Audit loop — surprise visits feeding back into verification */}
      <rect
        x="180"
        y="200"
        width="280"
        height="56"
        rx="3"
        fill="var(--paper)"
        stroke="var(--bark)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      <text
        x="320"
        y="223"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="13"
        fontWeight="600"
        fill="var(--bark)"
      >
        Independent Audit Teams
      </text>
      <text
        x="320"
        y="241"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="11"
        fill="var(--ink-soft)"
      >
        surprise, unannounced site visits
      </text>

      {/* Loop arrows: audit → site (ground truth) and audit → verification */}
      <path
        d="M180 228 L80 228 L80 128"
        fill="none"
        stroke="var(--bark)"
        strokeWidth="1.5"
        markerEnd="url(#arrow-bark)"
      />
      <path
        d="M460 228 L560 228 L560 128"
        fill="none"
        stroke="var(--bark)"
        strokeWidth="1.5"
        markerEnd="url(#arrow-bark)"
      />
      <text
        x="126"
        y="248"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="10.5"
        fontStyle="italic"
        fill="var(--bark)"
      >
        ground truth
      </text>
      <text
        x="516"
        y="248"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="10.5"
        fontStyle="italic"
        fill="var(--bark)"
      >
        verified data
      </text>

      {/* Dashboard destination */}
      <text
        x="320"
        y="30"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="11"
        letterSpacing="1.5"
        fill="var(--ink-soft)"
      >
        VERIFIED REALITY → PROGRAMME DASHBOARDS
      </text>
    </svg>
  );
}

export default function Guardianship() {
  return (
    <section id="guardianship" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-kicker text-green">
            Land Guardianship &amp; Audit
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-8 max-w-3xl font-serif text-3xl leading-snug text-ink md:text-4xl">
            Every planting site in Poshane has a name attached to it.
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Reveal>
            <p className="max-w-measure text-base leading-relaxed text-ink-soft">
              For each site, a designated{" "}
              <strong className="text-ink">land guardian</strong> — an
              individual, an institution or a community body — formally accepts
              responsibility to protect and nurture what is planted there. This
              is not a transfer of property; it is a transfer of duty. The
              guardian&rsquo;s obligation is not planting, but survival.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p className="max-w-measure text-base leading-relaxed text-ink-soft">
              That commitment is held to account by an independent audit layer.{" "}
              <strong className="text-ink">
                Audit teams make surprise, unannounced visits
              </strong>{" "}
              to capture the true condition of each site on the ground. What
              appears on the programme&rsquo;s dashboards is therefore not
              self-reported optimism — it is verified reality. This is what
              makes a 95% survival target defensible rather than aspirational.
            </p>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <figure className="mt-14 overflow-x-auto rounded-sm border border-line bg-paper-2 p-6 md:p-10">
            <div className="min-w-[560px]">
              <AuditLoopDiagram />
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
