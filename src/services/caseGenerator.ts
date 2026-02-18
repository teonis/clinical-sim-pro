/**
 * Dynamic Case Generator – Randomized clinical case templates.
 *
 * Each template defines a base scenario with randomizable variables
 * (age, comorbidities, severity). The generator produces a unique
 * patient profile and adjusts initial vitals via the PhysiologyEngine.
 */

import { EngineVitals } from "./physiologyEngine";

// ── Types ────────────────────────────────────────────────────────────────

export type Comorbidity = "DM2" | "HAS" | "DPOC" | "ICC" | "IRC" | "Obesidade" | "Tabagismo" | "Hígido";
export type Severity = "leve" | "moderada" | "grave";

export interface PatientProfile {
  age: number;
  sex: "M" | "F";
  comorbidities: Comorbidity[];
  severity: Severity;
}

export interface GeneratedCase {
  templateId: string;
  templateName: string;
  specialty: string;
  patient: PatientProfile;
  initialVitals: Partial<EngineVitals>;
  /** Full scenario text to inject as caso_especifico */
  scenarioPrompt: string;
}

export interface CaseTemplate {
  id: string;
  name: string;
  specialty: string;
  /** Specialties that can trigger this template */
  matchSpecialties: string[];
  /** Base vitals before patient profile adjustments */
  baseVitals: Partial<EngineVitals>;
  /** Function that builds the scenario text from the patient profile */
  buildScenario: (patient: PatientProfile) => string;
}

// ── Random Utilities ─────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ── Patient Profile Generator ────────────────────────────────────────────

const ALL_COMORBIDITIES: Comorbidity[] = ["DM2", "HAS", "DPOC", "ICC", "IRC", "Obesidade", "Tabagismo"];

function generatePatientProfile(): PatientProfile {
  const age = randInt(20, 90);
  const sex = pick<"M" | "F">(["M", "F"]);
  const severity = pick<Severity>(["leve", "moderada", "grave"]);

  // Younger patients more likely to be healthy
  let comorbidities: Comorbidity[];
  if (age < 35 && Math.random() < 0.5) {
    comorbidities = ["Hígido"];
  } else if (age < 50) {
    comorbidities = Math.random() < 0.3 ? ["Hígido"] : pickN(ALL_COMORBIDITIES, randInt(1, 2));
  } else {
    comorbidities = pickN(ALL_COMORBIDITIES, randInt(1, 3));
  }

  return { age, sex, comorbidities, severity };
}

// ── Vitals Adjustment Based on Profile ───────────────────────────────────

function adjustVitalsForProfile(
  base: Partial<EngineVitals>,
  patient: PatientProfile
): Partial<EngineVitals> {
  const v: EngineVitals = {
    hr: base.hr ?? 80,
    sbp: base.sbp ?? 120,
    dbp: base.dbp ?? 80,
    spo2: base.spo2 ?? 97,
    rr: base.rr ?? 16,
    temp: base.temp ?? 36.5,
  };

  // Age adjustments
  if (patient.age > 70) {
    v.hr += randInt(-5, 5);
    v.sbp += randInt(10, 25); // elderly tend to higher SBP
    v.spo2 -= randInt(1, 3);
  } else if (patient.age < 30) {
    v.hr -= randInt(5, 10); // younger = lower resting HR
    v.spo2 = Math.min(99, v.spo2 + 1);
  }

  // Comorbidity adjustments
  for (const c of patient.comorbidities) {
    switch (c) {
      case "DPOC":
        v.spo2 -= randInt(3, 6);
        v.rr += randInt(2, 4);
        break;
      case "HAS":
        v.sbp += randInt(15, 30);
        v.dbp += randInt(10, 15);
        break;
      case "DM2":
        v.hr += randInt(0, 5);
        break;
      case "ICC":
        v.hr += randInt(5, 15);
        v.spo2 -= randInt(2, 4);
        v.rr += randInt(2, 4);
        break;
      case "IRC":
        v.sbp += randInt(5, 15);
        break;
      case "Obesidade":
        v.spo2 -= randInt(1, 3);
        v.rr += randInt(1, 2);
        break;
      case "Tabagismo":
        v.spo2 -= randInt(1, 2);
        break;
      case "Hígido":
        // no adjustments
        break;
    }
  }

  // Severity adjustments
  switch (patient.severity) {
    case "leve":
      // minimal deviation
      break;
    case "moderada":
      v.hr += randInt(5, 15);
      v.sbp -= randInt(5, 10);
      v.spo2 -= randInt(1, 3);
      v.rr += randInt(2, 4);
      break;
    case "grave":
      v.hr += randInt(15, 35);
      v.sbp -= randInt(15, 30);
      v.spo2 -= randInt(4, 8);
      v.rr += randInt(4, 8);
      break;
  }

  // Clamp to safe display ranges (engine will re-clamp too)
  v.spo2 = Math.max(60, Math.min(99, v.spo2));
  v.hr = Math.max(40, Math.min(180, v.hr));
  v.sbp = Math.max(60, Math.min(220, v.sbp));
  v.dbp = Math.max(30, Math.min(140, v.dbp));
  v.rr = Math.max(10, Math.min(40, v.rr));

  return v;
}

// ── Helper: Format comorbidities for prompt ──────────────────────────────

function formatComorbidities(c: Comorbidity[]): string {
  const map: Record<Comorbidity, string> = {
    DM2: "Diabetes Mellitus tipo 2",
    HAS: "Hipertensão Arterial Sistêmica",
    DPOC: "Doença Pulmonar Obstrutiva Crônica",
    ICC: "Insuficiência Cardíaca Congestiva",
    IRC: "Insuficiência Renal Crônica",
    Obesidade: "Obesidade (IMC > 30)",
    Tabagismo: "Tabagismo ativo (20 maços-ano)",
    Hígido: "Sem comorbidades conhecidas",
  };
  return c.map(x => map[x]).join(", ");
}

// ── Case Templates ───────────────────────────────────────────────────────

const TEMPLATES: CaseTemplate[] = [
  {
    id: "iam_stemi",
    name: "Infarto Agudo do Miocárdio (STEMI)",
    specialty: "Cardiologia",
    matchSpecialties: ["Cardiologia", "Trauma / Emergência"],
    baseVitals: { hr: 95, sbp: 135, dbp: 85, spo2: 95, rr: 20, temp: 36.8 },
    buildScenario: (p) => {
      const painDesc = p.severity === "grave"
        ? "dor torácica intensa, opressiva, irradiando para membro superior esquerdo e mandíbula, sudorese profusa, náuseas e sensação de morte iminente"
        : p.severity === "moderada"
        ? "dor torácica em aperto há 2 horas, irradiando para ombro esquerdo, com náuseas leves"
        : "desconforto torácico retroesternal há 4 horas, em aperto, sem irradiação clara";
      const duration = p.severity === "grave" ? "há 1 hora" : p.severity === "moderada" ? "há 3 horas" : "há 6 horas";
      return `Paciente ${p.sex === "M" ? "masculino" : "feminino"}, ${p.age} anos, dá entrada na emergência com ${painDesc}, iniciada ${duration}. Antecedentes: ${formatComorbidities(p.comorbidities)}. Gravidade do quadro: ${p.severity}. Gere um caso de IAM com Supra de ST adequado a este perfil.`;
    },
  },
  {
    id: "pneumonia_cap",
    name: "Pneumonia Adquirida na Comunidade",
    specialty: "Pneumologia",
    matchSpecialties: ["Pneumologia", "Infectologia", "Trauma / Emergência"],
    baseVitals: { hr: 100, sbp: 115, dbp: 70, spo2: 91, rr: 24, temp: 38.5 },
    buildScenario: (p) => {
      const onset = p.severity === "grave"
        ? "dispneia intensa, tosse produtiva com escarro purulento, febre alta (39.5°C) há 2 dias, confusão mental"
        : p.severity === "moderada"
        ? "tosse produtiva há 5 dias, febre de 38.5°C, dispneia aos esforços moderados"
        : "tosse com expectoração amarelada há 7 dias, febre baixa intermitente, sem dispneia em repouso";
      return `Paciente ${p.sex === "M" ? "masculino" : "feminino"}, ${p.age} anos, chega à emergência com ${onset}. Antecedentes: ${formatComorbidities(p.comorbidities)}. Gravidade do quadro: ${p.severity}. Gere um caso de Pneumonia Adquirida na Comunidade adequado a este perfil.`;
    },
  },
  {
    id: "sepse",
    name: "Sepse / Choque Séptico",
    specialty: "Infectologia",
    matchSpecialties: ["Infectologia", "Trauma / Emergência", "Pneumologia"],
    baseVitals: { hr: 110, sbp: 95, dbp: 55, spo2: 92, rr: 26, temp: 38.8 },
    buildScenario: (p) => {
      const focus = pick(["urinário", "pulmonar", "abdominal", "cutâneo"]);
      const desc = p.severity === "grave"
        ? `quadro de choque séptico com hipotensão refratária, alteração do nível de consciência, lactato elevado, foco ${focus}`
        : p.severity === "moderada"
        ? `sepse com taquicardia, febre alta, hipotensão leve, foco provável ${focus}`
        : `sinais de SIRS com foco infeccioso ${focus}, sem disfunção orgânica evidente`;
      return `Paciente ${p.sex === "M" ? "masculino" : "feminino"}, ${p.age} anos, trazido à emergência com ${desc}. Antecedentes: ${formatComorbidities(p.comorbidities)}. Gravidade do quadro: ${p.severity}. Gere um caso de Sepse adequado a este perfil.`;
    },
  },
];

// ── Generator Function ───────────────────────────────────────────────────

/**
 * Generate a dynamic case for a given specialty.
 * If no template matches, returns null (caller should use default LLM flow).
 */
export function generateCase(specialty: string): GeneratedCase | null {
  // Find matching templates
  const candidates = TEMPLATES.filter(t =>
    t.matchSpecialties.some(s => specialty.toLowerCase().includes(s.toLowerCase()))
  );

  if (candidates.length === 0) return null;

  const template = pick(candidates);
  const patient = generatePatientProfile();
  const initialVitals = adjustVitalsForProfile(template.baseVitals, patient);
  const scenarioPrompt = template.buildScenario(patient);

  return {
    templateId: template.id,
    templateName: template.name,
    specialty: template.specialty,
    patient,
    initialVitals,
    scenarioPrompt,
  };
}

/** Get all available template names for display. */
export function getAvailableTemplates(): { id: string; name: string; specialty: string }[] {
  return TEMPLATES.map(t => ({ id: t.id, name: t.name, specialty: t.specialty }));
}