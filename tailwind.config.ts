import type { Config } from "tailwindcss";

/**
 * Poshane (ಪೋಷಣೆ) — design tokens.
 *
 * The palette below is the single source of truth for colour on the site.
 * The same values are mirrored as CSS variables in app/globals.css so they
 * remain usable outside Tailwind (inline SVG, style attributes) if needed.
 *
 * Gold is reserved strictly for KPI accents.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5EF",
        "paper-2": "#EFEBE0",
        ink: "#1D2721",
        "ink-soft": "#44503F",
        navy: "#16242E",
        "navy-2": "#0F1A22",
        green: "#1C4A35",
        "green-2": "#2E6247",
        "green-tint": "#E4EBE2",
        bark: "#6F5E47",
        gold: "#B9892E",
        "gold-soft": "#D8B368",
        line: "#DCD5C5",
      },
      fontFamily: {
        // Populated at runtime by next/font CSS variables (see app/layout.tsx)
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-archivo)", "Helvetica", "Arial", "sans-serif"],
        kannada: [
          "var(--font-noto-kannada)",
          "var(--font-archivo)",
          "sans-serif",
        ],
      },
      maxWidth: {
        measure: "68ch",
      },
      letterSpacing: {
        kicker: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;
