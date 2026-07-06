# Poshane (ಪೋಷಣೆ) — The KSLSA Five Crore Sapling Plantation Programme

Production-grade landing site built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

## Production build

```bash
npm run build
npm start
```

## Deployment

Targeted at **Vercel** — import the repository and deploy with default Next.js settings. No production domain is hardcoded anywhere; the site uses `next/link` and relative routing throughout, so the domain can be attached later with zero code changes.

## Notes

- **Fonts** (Fraunces, Archivo, Noto Sans Kannada) are self-hosted via `next/font/google` — downloaded once at build time and bundled with the app. There are no runtime calls to Google Fonts, and the Kannada wordmark renders reliably offline. *(The build machine needs internet access the first time fonts are fetched; Vercel builds handle this automatically.)*
- **Rendering:** the landing page is a Server Component. Only the interactive pieces are Client Components: `SiteHeader` (mobile nav), `CountUp`, `Reveal` (scroll-reveal), `SurvivalStandard` (gauge animation) and `Timeline` (fill animation).
- **Design tokens** live in `tailwind.config.ts` and are mirrored as CSS variables in `app/globals.css`.
- **All visuals are native SVG** — no external map tiles, logos or third-party imagery at runtime.
- **Illustrative data** is explicitly labelled as illustrative wherever it appears.
- **`/command-center`** is a clean placeholder route where the authenticated Command Center repository will later attach as additional routes in this same app.
- `prefers-reduced-motion` is respected globally — all animations resolve instantly for users who request reduced motion.
