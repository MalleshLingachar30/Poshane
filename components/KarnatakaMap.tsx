/**
 * Karnataka state boundary sourced from GADM 4.1 ADM1 (IND.16_1 / IN-KA):
 * https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_IND_1.json.zip
 *
 * The source polygon was filtered to Karnataka and topology-preserving
 * simplified to 1.5% with mapshaper's `keep-shapes` option. Coordinates are
 * projected into this component's local 360 × 420 SVG viewBox; no geographic
 * data or external mapping service is loaded at runtime.
 */
const KARNATAKA_BOUNDARY_PATH =
  "M148.8 380.1 L149.8 380.1 L165.9 396.1 L166.4 397.2 L167.1 397.5 L173.8 400.1 L174.9 400.5 L175.6 400.6 L176.7 400.8 L177.6 400.6 L183.3 400.6 L191.8 390.3 L200.9 393.4 L209.6 389.2 L219.5 391 L222.3 381.8 L231.6 380.6 L234.9 368.2 L221.3 366.2 L228.5 357.5 L228.8 356.4 L228.2 342.2 L236.1 338.4 L238.7 330.7 L260.6 334.6 L261.6 329.1 L278.7 311.4 L278.6 304.7 L267.6 299.9 L268.9 286.9 L257.2 283.1 L251.2 269.4 L240.1 270.9 L224.5 279.7 L219.2 272.7 L205.7 277 L195.4 273.8 L204 263 L217 262.4 L217.3 253.4 L207.3 244.8 L206 243.9 L204.4 243.5 L203.9 243.9 L193.8 249.1 L190 235.6 L184.6 228.6 L190.6 203.7 L202.8 203.7 L205.6 195.7 L205.3 194.2 L199 184.7 L198.5 169.2 L201.1 153.1 L202.5 152.2 L223.6 152.4 L221.2 114.3 L223 90 L216.9 77.7 L223.6 65.8 L232.7 62.5 L232.9 61.7 L219.9 56.9 L220.5 50.6 L231.1 34.6 L225.7 16.1 L217.9 10 L207.8 16.9 L194.6 30.7 L181 49.8 L172.3 46.7 L162.3 56.2 L164.9 72.4 L151.3 69.3 L141.4 71.7 L126.1 62.9 L124.5 72.9 L127.8 91.6 L108 93 L104.9 99.5 L93.2 93.5 L88.6 102.7 L58.2 116 L59.1 124.6 L59.9 124.7 L60.1 125.4 L67.4 135.1 L59.2 161.5 L47.5 168 L58.7 188.5 L54.6 205.9 L55.2 206.8 L55 207.3 L46.8 210.5 L46 211.4 L55.6 223.9 L70.6 265.9 L75.4 282.7 L83.7 328.9 L86.1 334.5 L86.6 334.7 L87 334.8 L92.4 332.4 L93 332.8 L95.5 339.9 L103.5 341.9 L123 369.2 L134.4 373.6 L143.8 382.2 L144.9 382.3 L147.5 381.1 L148.8 380.1 Z";

export default function KarnatakaMap() {
  return (
    <svg
      viewBox="0 0 360 420"
      role="img"
      aria-label="Simplified schematic map of Karnataka showing two crore saplings allocated to the Bengaluru region and three crore across the rest of the State"
      className="w-full max-w-sm"
    >
      <path
        className="map-region"
        d={KARNATAKA_BOUNDARY_PATH}
        fill="var(--green-tint)"
        stroke="var(--green)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Bengaluru region — south-eastern zone, emphasised. */}
      <circle
        className="map-region"
        cx="228"
        cy="322"
        r="40"
        fill="var(--green)"
        opacity="0.92"
      />
      <circle
        cx="228"
        cy="322"
        r="52"
        fill="none"
        stroke="var(--green)"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        opacity="0.6"
      />

      {/* Labels */}
      <text
        x="128"
        y="170"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="13"
        fontWeight="600"
        fill="var(--green)"
      >
        Rest of Karnataka
      </text>
      <text
        x="128"
        y="190"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fill="var(--ink-soft)"
      >
        3 crore saplings
      </text>

      <text
        x="228"
        y="318"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="var(--paper)"
      >
        Bengaluru
      </text>
      <text
        x="228"
        y="334"
        textAnchor="middle"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="11"
        fill="var(--paper)"
      >
        2 crore
      </text>

      <text
        x="10"
        y="414"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="10"
        fontStyle="italic"
        fill="var(--bark)"
      >
        Schematic representation — not to survey scale.
      </text>
    </svg>
  );
}
