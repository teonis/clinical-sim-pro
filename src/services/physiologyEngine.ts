/**
 * PhysiologyEngine – Deterministic vital-signs state machine.
 *
 * Responsibilities:
 *  1. Hold the authoritative numerical vitals (HR, SBP, DBP, SpO2, RR, Temp).
 *  2. Apply a "tick" that degrades vitals based on PatientStatus + elapsed time.
 *  3. Apply deterministic intervention effects from a hardcoded dictionary.
 *  4. Expose a snapshot that can be forwarded to the LLM so it narrates
 *     based on real numbers instead of hallucinating them.
 */

import { PatientState } from "@/types/simulation";

// ── Types ────────────────────────────────────────────────────────────────

export interface EngineVitals {
  hr: number;   // Heart Rate (bpm)
  sbp: number;  // Systolic Blood Pressure (mmHg)
  dbp: number;  // Diastolic Blood Pressure (mmHg)
  spo2: number; // Oxygen Saturation (%)
  rr: number;   // Respiratory Rate (rpm)
  temp: number; // Temperature (°C)
}

export interface InterventionEffect {
  hr?: number;
  sbp?: number;
  dbp?: number;
  spo2?: number;
  rr?: number;
  temp?: number;
}

interface DegradationProfile {
  hr: number;
  sbp: number;
  dbp: number;
  spo2: number;
  rr: number;
  temp: number;
}

// ── Intervention Dictionary ──────────────────────────────────────────────

const INTERVENTIONS: Record<string, InterventionEffect> = {
  // Medications
  epinefrina:       { hr: +20, sbp: +15, dbp: +10 },
  adrenalina:       { hr: +20, sbp: +15, dbp: +10 },
  atropina:         { hr: +15 },
  amiodarona:       { hr: -15 },
  noradrenalina:    { sbp: +20, dbp: +12, hr: +5 },
  dobutamina:       { hr: +10, sbp: +10 },
  nitroprussiato:   { sbp: -25, dbp: -15 },
  furosemida:       { sbp: -10, dbp: -5 },
  dipirona:         { temp: -1.0 },
  paracetamol:      { temp: -0.8 },
  midazolam:        { rr: -3, hr: -5 },
  fentanil:         { rr: -4, hr: -5, sbp: -10 },
  morfina:          { rr: -3, hr: -5, sbp: -8 },
  salbutamol:       { rr: -4, spo2: +3, hr: +10 },
  hidrocortisona:   { spo2: +2 },

  // Interventions / Procedures
  "o2_suplementar":       { spo2: +5 },
  "oxigenio":             { spo2: +5 },
  "ventilacao_mecanica":  { spo2: +8, rr: -6 },
  "intubacao":            { spo2: +10, rr: -4 },
  "acesso_venoso":        {},
  "desfibrilacao":        { hr: +40, sbp: +10 },
  "cardioversao":         { hr: -30, sbp: +5 },
  "drenagem_torax":       { spo2: +6, rr: -3 },
  "reposicao_volemica":   { sbp: +15, dbp: +10, hr: -5 },
  "cristaloide":          { sbp: +12, dbp: +8, hr: -5 },
  "hemoderivado":         { sbp: +18, dbp: +12, hr: -8 },
  "rcp":                  { hr: +30, sbp: +20 },
  "massagem_cardiaca":    { hr: +30, sbp: +20 },
};

// ── Degradation per status (per minute of game time) ─────────────────────

const DEGRADATION: Record<string, DegradationProfile> = {
  [PatientState.ESTAVEL]:  { hr: 0,    sbp: 0,    dbp: 0,    spo2: 0,     rr: 0,    temp: 0 },
  [PatientState.INSTAVEL]: { hr: +2,   sbp: -2,   dbp: -1,   spo2: -0.5,  rr: +1,   temp: +0.05 },
  [PatientState.CRITICO]:  { hr: +5,   sbp: -5,   dbp: -3,   spo2: -1.5,  rr: +2,   temp: +0.1 },
  [PatientState.OBITO]:    { hr: 0,    sbp: 0,    dbp: 0,    spo2: 0,     rr: 0,    temp: -0.2 },
  [PatientState.CURADO]:   { hr: 0,    sbp: 0,    dbp: 0,    spo2: 0,     rr: 0,    temp: 0 },
};

// ── Physiological clamps ─────────────────────────────────────────────────

const CLAMP = {
  hr:   { min: 0,   max: 250 },
  sbp:  { min: 0,   max: 250 },
  dbp:  { min: 0,   max: 180 },
  spo2: { min: 0,   max: 99 },
  rr:   { min: 0,   max: 60 },
  temp: { min: 30,  max: 42 },
};

function clampVitals(v: EngineVitals): EngineVitals {
  return {
    hr:   Math.round(Math.min(CLAMP.hr.max,   Math.max(CLAMP.hr.min,   v.hr))),
    sbp:  Math.round(Math.min(CLAMP.sbp.max,  Math.max(CLAMP.sbp.min,  v.sbp))),
    dbp:  Math.round(Math.min(CLAMP.dbp.max,  Math.max(CLAMP.dbp.min,  v.dbp))),
    spo2: Math.round(Math.min(CLAMP.spo2.max, Math.max(CLAMP.spo2.min, v.spo2))),
    rr:   Math.round(Math.min(CLAMP.rr.max,   Math.max(CLAMP.rr.min,   v.rr))),
    temp: +Math.min(CLAMP.temp.max, Math.max(CLAMP.temp.min, v.temp)).toFixed(1),
  };
}

// ── Engine class ─────────────────────────────────────────────────────────

export class PhysiologyEngine {
  private vitals: EngineVitals;
  private gameTimeMinutes: number = 0;

  constructor(initial?: Partial<EngineVitals>) {
    this.vitals = clampVitals({
      hr: 80, sbp: 120, dbp: 80, spo2: 97, rr: 16, temp: 36.5,
      ...initial,
    });
  }

  /** Reset with new initial vitals (e.g. new case). */
  reset(initial?: Partial<EngineVitals>) {
    this.gameTimeMinutes = 0;
    this.vitals = clampVitals({
      hr: 80, sbp: 120, dbp: 80, spo2: 97, rr: 16, temp: 36.5,
      ...initial,
    });
  }

  /** Advance game clock and degrade vitals deterministically. */
  tick(minutes: number, patientState: string) {
    const profile = DEGRADATION[patientState] ?? DEGRADATION[PatientState.ESTAVEL];
    this.vitals = clampVitals({
      hr:   this.vitals.hr   + profile.hr   * minutes,
      sbp:  this.vitals.sbp  + profile.sbp  * minutes,
      dbp:  this.vitals.dbp  + profile.dbp  * minutes,
      spo2: this.vitals.spo2 + profile.spo2 * minutes,
      rr:   this.vitals.rr   + profile.rr   * minutes,
      temp: this.vitals.temp + profile.temp * minutes,
    });
    this.gameTimeMinutes += minutes;
  }

  /** Apply a deterministic intervention effect. Returns true if matched. */
  applyIntervention(actionText: string): boolean {
    const normalised = actionText
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_");

    for (const [key, effect] of Object.entries(INTERVENTIONS)) {
      if (normalised.includes(key.replace(/[^a-z0-9]/g, "_"))) {
        this.vitals = clampVitals({
          hr:   this.vitals.hr   + (effect.hr   ?? 0),
          sbp:  this.vitals.sbp  + (effect.sbp  ?? 0),
          dbp:  this.vitals.dbp  + (effect.dbp  ?? 0),
          spo2: this.vitals.spo2 + (effect.spo2 ?? 0),
          rr:   this.vitals.rr   + (effect.rr   ?? 0),
          temp: this.vitals.temp + (effect.temp ?? 0),
        });
        return true;
      }
    }
    return false;
  }

  /** Current snapshot for forwarding to LLM. */
  getVitals(): EngineVitals {
    return { ...this.vitals };
  }

  getGameTimeMinutes(): number {
    return this.gameTimeMinutes;
  }

  /** Formatted string to inject into the LLM prompt context. */
  toPromptBlock(): string {
    const v = this.vitals;
    return (
      `[VITAIS CALCULADOS PELO MOTOR FISIOLÓGICO – USE ESTES VALORES EXATOS]\n` +
      `FC: ${v.hr} bpm | PA: ${v.sbp}/${v.dbp} mmHg | SpO2: ${v.spo2}% | FR: ${v.rr} rpm | Temp: ${v.temp}°C\n` +
      `Tempo de jogo: ${this.gameTimeMinutes} min`
    );
  }
}

// Singleton instance shared across a game session
let engineInstance: PhysiologyEngine | null = null;

export const getEngine = (): PhysiologyEngine => {
  if (!engineInstance) {
    engineInstance = new PhysiologyEngine();
  }
  return engineInstance;
};

export const resetEngine = (initial?: Partial<EngineVitals>) => {
  engineInstance = new PhysiologyEngine(initial);
  return engineInstance;
};
