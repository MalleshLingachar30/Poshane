import type { Metadata } from "next";
import { Fraunces, Archivo, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";

/**
 * Fonts are self-hosted via next/font — downloaded once at build time and
 * bundled with the app. There are no runtime calls to Google Fonts, and the
 * Kannada wordmark (ಪೋಷಣೆ) renders reliably offline.
 *
 * Fallbacks: Georgia/serif for headlines, Helvetica/sans for body & UI.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  fallback: ["Georgia", "serif"],
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-noto-kannada",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title:
    "Poshane (ಪೋಷಣೆ) — The KSLSA Five Crore Sapling Plantation Programme",
  description:
    "Poshane — a social commitment of the Karnataka State Legal Services Authority: five crore saplings across Karnataka over five years of planting, engineered for a 95% survival standard through guardianship, science and ground-truth audit.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable} ${notoSansKannada.variable}`}
    >
      <body className="font-sans bg-paper text-ink">{children}</body>
    </html>
  );
}
