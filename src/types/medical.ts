export interface VitalSigns {
  fc: number;        // Frequência Cardíaca (bpm)
  pas: number;       // Pressão Arterial Sistólica
  pad: number;       // Pressão Arterial Diastólica
  satO2: number;     // Saturação O2 (%)
  fr: number;        // Frequência Respiratória
  temp: number;      // Temperatura (°C)
}

export type PatientStatus = 'stable' | 'warning' | 'critical';

export interface ClinicalCase {
  id: string;
  title: string;
  description: string;
  specialty: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialScenario: string;
  vitalSignsStart: VitalSigns;
  completed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface SimulationState {
  caseData: ClinicalCase;
  vitalSigns: VitalSigns;
  patientStatus: PatientStatus;
  messages: ChatMessage[];
  isActive: boolean;
  score?: number;
}
