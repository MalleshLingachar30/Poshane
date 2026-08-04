# Poshane (ಪೋಷಣೆ) — The KSLSA Five Crore Sapling Plantation Programme

Production-grade landing site and authenticated Command Center built with
**Next.js 16 (App Router) + TypeScript + Tailwind CSS**.

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

Targeted at **Vercel** — import the repository and deploy with default Next.js
settings. The app metadata currently uses `https://poshane.vercel.app` as its
canonical production base URL.

The production environment must define:

- `COMMAND_CENTER_ADMIN_EMAIL`
- `COMMAND_CENTER_ADMIN_NAME`
- `COMMAND_CENTER_ADMIN_PASSWORD_SALT`
- `COMMAND_CENTER_ADMIN_PASSWORD_HASH`
- `COMMAND_CENTER_ADMIN_PASSWORD_ITERATIONS`
- `COMMAND_CENTER_SESSION_SECRET`
- `OPENAI_API_KEY` for Mitra voice sessions

## Notes

- **Fonts** (Fraunces, Archivo, Noto Sans Kannada) are self-hosted via `next/font/google` — downloaded once at build time and bundled with the app. There are no runtime calls to Google Fonts, and the Kannada wordmark renders reliably offline. *(The build machine needs internet access the first time fonts are fetched; Vercel builds handle this automatically.)*
- **Rendering:** the landing page is a Server Component. Only the interactive pieces are Client Components: `SiteHeader` (mobile nav), `CountUp`, `Reveal` (scroll-reveal), `SurvivalStandard` (gauge animation) and `Timeline` (fill animation).
- **Design tokens** live in `tailwind.config.ts` and are mirrored as CSS variables in `app/globals.css`.
- **All visuals are native SVG** — no external map tiles, logos or third-party imagery at runtime.
- **Illustrative data** is explicitly labelled as illustrative wherever it appears.
- **`/command-center`** is an authenticated programme operations console with
  illustrative state, district, land registry, stakeholder, silvi-zone, nursery,
  monitoring, audit and restricted financial views.
- **Mitra** is the read-only voice assistant embedded in the Command Center. It
  creates ephemeral OpenAI Realtime client secrets server-side and requires an
  authenticated Command Center session.
- `prefers-reduced-motion` is respected globally — all animations resolve instantly for users who request reduced motion.
