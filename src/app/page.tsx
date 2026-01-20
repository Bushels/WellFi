import {
  HeroSection,
  BenefitsSection,
  TechnologySection,
  ProductExplorerSection,
  PremiumToolShowcase,
  InstallationSection,
  IntegrationSection,
  ResultsSection,
  SpecificationsSection,
  CTASection,
} from '@/components/sections';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <BenefitsSection />
      <TechnologySection />
      <ProductExplorerSection />
      {/* PremiumToolShowcase removed as requested */}
      <InstallationSection />
      <IntegrationSection />
      {/* SEC-007 DeltaPressure Intelligence - Interactive section (Phase 3) */}
      <ResultsSection />
      <SpecificationsSection />
      <CTASection />
    </main>
  );
}
