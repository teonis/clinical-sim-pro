import React from "react";
import LandingHero from "@/components/LandingHero";
import LandingFeatures from "@/components/LandingFeatures";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingScenarios from "@/components/landing/LandingScenarios";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import { getAvailableTemplates } from "@/services/caseGenerator";
import { ClinicalCase } from "@/types/medical";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const templates = getAvailableTemplates();
  
  // Convert templates to ClinicalCase format for CaseCard
  const mockCases: ClinicalCase[] = templates.map(t => ({
    id: t.id,
    title: t.name,
    description: `Simulação avançada em ${t.specialty}. Treine protocolos e condutas para casos reais.`,
    specialty: t.specialty,
    difficulty: t.id === "iam_stemi" ? "hard" : "medium",
    initialScenario: "",
    vitalSignsStart: { fc: 0, pas: 0, pad: 0, satO2: 0, fr: 0, temp: 0 }
  }));

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <LandingHeader onStart={onStart} />

      <main>
        <LandingHero onStart={onStart} />
        <LandingFeatures />
        <LandingScenarios mockCases={mockCases} onStart={onStart} />
        <LandingCTA onStart={onStart} />
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;