export type CaseLevel = "Básico" | "Intermediário" | "Avançado";

export interface LibraryCase {
  id: string;
  title: string;
  specialty: string;
  tags?: string[];
  level: CaseLevel;
  duration: string;
  description: string;
  competencies: string[];
  
  // Nova estrutura clínica
  learningObjectives: string[];
  patientProfile: {
    age: number;
    sex: string;
    context: string;
    medicalHistory?: string[];
  };
  initialPresentation: string;
  initialVitals: {
    sbp: number;
    dbp: number;
    hr: number;
    rr: number;
    spo2: number;
    temp: number;
    capillaryGlucose?: number;
  };
  initialPhysicalExam: string;
  initialAvailableInformation: string[];
  expectedKeyActions: string[];
  criticalMistakes: string[];
  idealDiagnosticDirection: string;
  idealManagementDirection: string;
  progressionGuidance: {
    goodOutcome: string;
    delayedOutcome: string;
    inadequateOutcome: string;
  };
  debriefingFocus: string[];

  // Mantido para compatibilidade com o simulador
  simulationBriefing: string;
  engineSpecialty: string;
  engineDifficulty: "ESTUDANTE" | "RESIDENTE" | "ESPECIALISTA";
}
