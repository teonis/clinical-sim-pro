/**
 * PhysiologyEngine – Deterministic vital-signs state machine.
 *
 * Responsibilities:
 *  1. Hold the authoritative numerical vitals (HR, SBP, DBP, SpO2, RR, Temp).
 *  2. Apply a "tick" that degrades vitals based on PatientStatus + elapsed time.
 *  3. Apply deterministic intervention effects from a hardcoded dictionary.
 *  4. Track action timeline for debriefing.
 *  5. Apply condition-specific degradation rules (e.g. IAM without reperfusion).
 *  6. Expose a snapshot that can be forwarded to the LLM.
 */

import { PatientState } from "@/types/simulation";

// ── Types ────────────────────────────────────────────────────────────────

export interface EngineVitals {
  hr: number;
  sbp: number;
  dbp: number;
  spo2: number;
  rr: number;
  temp: number;
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

/** A logged action with its timestamp for the debriefing timeline. */
export interface ActionTimelineEntry {
  actionText: string;
  gameTimeMinutes: number;
  isCritical: boolean;
}

// ── Action Time Costs (minutes) ──────────────────────────────────────────

const ACTION_TIME_COSTS: Record<string, number> = {
  // Exams
  ecg:               5,
  eletrocardiograma: 5,
  troponina:         40,
  hemograma:         30,
  gasometria:        15,
  lactato:           20,
  hemocultura:       10,
  rx_torax:          15,
  raio_x:            15,
  radiografia:       15,
  tc:                60,
  tomografia:        60,
  ressonancia:       90,
  ultrassom:         20,
  ecocardiograma:    30,
  // Medications (IV)
  epinefrina:        2,
  adrenalina:        2,
  atropina:          2,
  amiodarona:        3,
  noradrenalina:     3,
  dobutamina:        3,
  nitroprussiato:    5,
  furosemida:        2,
  dipirona:          2,
  paracetamol:       2,
  midazolam:         2,
  fentanil:          2,
  morfina:           2,
  salbutamol:        3,
  hidrocortisona:    3,
  antibiotico:       5,
  ceftriaxona:       5,
  piperacilina:      5,
  meropenem:         5,
  vancomicina:       5,
  // Procedures
  o2_suplementar:    1,
  oxigenio:          1,
  intubacao:         10,
  ventilacao_mecanica: 10,
  acesso_venoso:     5,
  desfibrilacao:     1,
  cardioversao:      5,
  drenagem_torax:    15,
  rcp:               1,
  massagem_cardiaca: 1,
  reposicao_volemica: 5,
  cristaloide:       5,
  hemoderivado:      15,
  cateterismo:       60,
  angioplastia:      60,
  reperfusao:        60,
  trombolise:        30,
  exame_fisico:      3,
};

/** Critical actions we track for debriefing timeline. */
const CRITICAL_ACTIONS = new Set([
  "antibiotico", "ceftriaxona", "piperacilina", "meropenem", "vancomicina",
  "epinefrina", "adrenalina", "desfibrilacao", "rcp", "massagem_cardiaca",
  "intubacao", "cateterismo", "angioplastia", "reperfusao", "trombolise",
  "noradrenalina", "reposicao_volemica", "hemoderivado", "drenagem_torax",
]);

// ── Intervention Dictionary ──────────────────────────────────────────────

const INTERVENTIONS: Record<string, InterventionEffect> = {
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

// ── Condition-specific degradation rules ─────────────────────────────────

interface ConditionRule {
  /** Keywords to detect this condition from the LLM narrative */
  keywords: string[];
  /** Interval in game-minutes between penalty ticks */
  intervalMinutes: number;
  /** Vitals penalty applied per interval without the required intervention */
  penalty: Partial<EngineVitals>;
  /** If any of these interventions were applied, suspend the penalty */
  mitigatedBy: string[];
}

const CONDITION_RULES: ConditionRule[] = [
  {
    keywords: ["iam", "infarto", "stemi", "supra de st", "supradesnivelamento"],
    intervalMinutes: 10,
    penalty: { sbp: -5, hr: +3 },
    mitigatedBy: ["cateterismo", "angioplastia", "reperfusao", "trombolise"],
  },
  {
    keywords: ["sepse", "sepsis", "choque septico", "choque séptico"],
    intervalMinutes: 15,
    penalty: { hr: +10, sbp: -8 },
    mitigatedBy: ["antibiotico", "ceftriaxona", "piperacilina", "meropenem", "vancomicina"],
  },
  {
    keywords: ["pneumotorax", "pneumotórax"],
    intervalMinutes: 10,
    penalty: { spo2: -4, rr: +3 },
    mitigatedBy: ["drenagem_torax"],
  },
  {
    keywords: ["choque hemorragico", "choque hemorrágico", "hemorragia"],
    intervalMinutes: 10,
    penalty: { sbp: -10, hr: +8 },
    mitigatedBy: ["hemoderivado", "reposicao_volemica", "cristaloide"],
  },
];

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

/** Normalize text for matching against dictionaries. */
function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_");
}

// ── Engine class ─────────────────────────────────────────────────────────

export class PhysiologyEngine {
  private vitals: EngineVitals;
  private gameTimeMinutes: number = 0;
  private actionTimeline: ActionTimelineEntry[] = [];
  private appliedInterventions: Set<string> = new Set();
  private activeConditions: string[] = [];

  constructor(initial?: Partial<EngineVitals>) {
    this.vitals = clampVitals({
      hr: 80, sbp: 120, dbp: 80, spo2: 97, rr: 16, temp: 36.5,
      ...initial,
    });
  }

  /** Reset with new initial vitals (e.g. new case). */
  reset(initial?: Partial<EngineVitals>) {
    this.gameTimeMinutes = 0;
    this.actionTimeline = [];
    this.appliedInterventions = new Set();
    this.activeConditions = [];
    this.vitals = clampVitals({
      hr: 80, sbp: 120, dbp: 80, spo2: 97, rr: 16, temp: 36.5,
      ...initial,
    });
  }

  /** Detect active conditions from narrative text. */
  setConditionsFromNarrative(narrative: string) {
    const norm = normalizeKey(narrative);
    this.activeConditions = [];
    for (const rule of CONDITION_RULES) {
      for (const kw of rule.keywords) {
        if (norm.includes(normalizeKey(kw))) {
          this.activeConditions.push(kw);
          break;
        }
      }
    }
  }

  /** Get the time cost for an action (in game-minutes). */
  getTimeCostForAction(actionText: string): number {
    const norm = normalizeKey(actionText);
    for (const [key, cost] of Object.entries(ACTION_TIME_COSTS)) {
      if (norm.includes(key.replace(/[^a-z0-9]/g, "_"))) {
        return cost;
      }
    }
    return 5; // default
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

    // Apply condition-specific penalties
    this.applyConditionPenalties(minutes);
  }

  /** Apply condition-specific degradation if not mitigated. */
  private applyConditionPenalties(elapsedMinutes: number) {
    for (const rule of CONDITION_RULES) {
      const isActive = rule.keywords.some(kw => this.activeConditions.includes(kw));
      if (!isActive) continue;

      const isMitigated = rule.mitigatedBy.some(m => this.appliedInterventions.has(m));
      if (isMitigated) continue;

      // How many penalty intervals fit in elapsed time
      const ticks = Math.floor(elapsedMinutes / rule.intervalMinutes);
      if (ticks > 0) {
        this.vitals = clampVitals({
          hr:   this.vitals.hr   + (rule.penalty.hr   ?? 0) * ticks,
          sbp:  this.vitals.sbp  + (rule.penalty.sbp  ?? 0) * ticks,
          dbp:  this.vitals.dbp  + (rule.penalty.dbp  ?? 0) * ticks,
          spo2: this.vitals.spo2 + (rule.penalty.spo2 ?? 0) * ticks,
          rr:   this.vitals.rr   + (rule.penalty.rr   ?? 0) * ticks,
          temp: this.vitals.temp + (rule.penalty.temp ?? 0) * ticks,
        });
      }
    }
  }

  /** Apply a deterministic intervention effect. Returns true if matched. */
  applyIntervention(actionText: string): boolean {
    const normalised = normalizeKey(actionText);

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
        this.appliedInterventions.add(key);
        return true;
      }
    }

    // Track for critical action matching even if no vitals effect
    for (const critKey of CRITICAL_ACTIONS) {
      if (normalised.includes(critKey)) {
        this.appliedInterventions.add(critKey);
      }
    }

    return false;
  }

  /** Log an action to the timeline. */
  logAction(actionText: string, isCritical?: boolean) {
    const norm = normalizeKey(actionText);
    const critical = isCritical ?? [...CRITICAL_ACTIONS].some(k => norm.includes(k));
    this.actionTimeline.push({
      actionText,
      gameTimeMinutes: this.gameTimeMinutes,
      isCritical: critical,
    });
  }

  /** Current snapshot for forwarding to LLM. */
  getVitals(): EngineVitals {
    return { ...this.vitals };
  }

  getGameTimeMinutes(): number {
    return this.gameTimeMinutes;
  }

  getActionTimeline(): ActionTimelineEntry[] {
    return [...this.actionTimeline];
  }

  getAppliedInterventions(): Set<string> {
    return new Set(this.appliedInterventions);
  }

  /** Format game time as HH:MM */
  getFormattedTime(): string {
    const h = Math.floor(this.gameTimeMinutes / 60);
    const m = this.gameTimeMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(Math.round(m)).padStart(2, "0")}`;
  }

  /** Formatted string to inject into the LLM prompt context. */
  toPromptBlock(): string {
    const v = this.vitals;
    return (
      `[VITAIS CALCULADOS PELO MOTOR FISIOLÓGICO – USE ESTES VALORES EXATOS]\n` +
      `FC: ${v.hr} bpm | PA: ${v.sbp}/${v.dbp} mmHg | SpO2: ${v.spo2}% | FR: ${v.rr} rpm | Temp: ${v.temp}°C\n` +
      `Tempo de jogo: ${this.gameTimeMinutes} min (${this.getFormattedTime()})`
    );
  }

  /** Generate debriefing timeline text. */
  toDebriefingTimeline(): string {
    if (this.actionTimeline.length === 0) return "";

    const lines = [`⏱ TIMELINE DA SIMULAÇÃO (Tempo total: ${this.getFormattedTime()} — ${this.gameTimeMinutes} min)`];
    for (const entry of this.actionTimeline) {
      const marker = entry.isCritical ? "🔴" : "⚪";
      const h = Math.floor(entry.gameTimeMinutes / 60);
      const m = entry.gameTimeMinutes % 60;
      const ts = `${String(h).padStart(2, "0")}:${String(Math.round(m)).padStart(2, "0")}`;
      lines.push(`${marker} ${ts} — ${entry.actionText}`);
    }
    return lines.join("\n");
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
