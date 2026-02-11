import React from "react";
import { MEDICAL_TERMS } from "@/types/simulation";

const MedicalTooltip: React.FC<{ term: string; def: string }> = ({ term, def }) => (
  <span className="relative inline-block group cursor-help border-b border-dotted border-primary/40 text-primary font-medium mx-0.5">
    {term}
    <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-foreground text-background text-xs rounded-lg p-2 shadow-xl z-50 pointer-events-none text-center leading-tight">
      {def}
      <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-foreground"></span>
    </span>
  </span>
);

export const renderWithTooltips = (text: string) => {
  if (!text) return null;
  const escapedTerms = Object.keys(MEDICAL_TERMS).map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`\\b(${escapedTerms.join("|")})\\b`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const matchedKey = Object.keys(MEDICAL_TERMS).find(
      (k) => k.toLowerCase() === part.toLowerCase()
    );
    if (matchedKey) {
      return <MedicalTooltip key={i} term={part} def={MEDICAL_TERMS[matchedKey]} />;
    }
    return <span key={i}>{part}</span>;
  });
};

export default MedicalTooltip;
