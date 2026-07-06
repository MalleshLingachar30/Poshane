import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Commitment from "@/components/Commitment";
import ScaleReach from "@/components/ScaleReach";
import SurvivalStandard from "@/components/SurvivalStandard";
import Governance from "@/components/Governance";
import Guardianship from "@/components/Guardianship";
import ImplementationModels from "@/components/ImplementationModels";
import DigitalPlatform from "@/components/DigitalPlatform";
import Stakeholders from "@/components/Stakeholders";
import Timeline from "@/components/Timeline";
import SiteFooter from "@/components/SiteFooter";

/**
 * Poshane (ಪೋಷಣೆ) — The KSLSA Five Crore Sapling Plantation Programme.
 *
 * The landing page is a Server Component; interactive pieces (nav toggle,
 * count-up, scroll-reveal, gauge and timeline animation) are isolated in
 * Client Components. Sections are composed in the order defined by the
 * programme brief.
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Commitment />
        <ScaleReach />
        <SurvivalStandard />
        <Governance />
        <Guardianship />
        <ImplementationModels />
        <DigitalPlatform />
        <Stakeholders />
        <Timeline />
      </main>
      <SiteFooter />
    </>
  );
}
