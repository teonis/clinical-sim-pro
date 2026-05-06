/**
 * Protocol Checklists – Evidence-based action checklists for clinical cases.
 *
 * Each protocol defines mandatory actions with time targets and references.
 * The engine evaluates the player's timeline against these checklists
 * to produce a structured, educational debriefing.
 */

import { ActionTimelineEntry } from "./physiologyEngine";

// ── Types ────────────────────────────────────────────────────────────────

export interface ProtocolItem {
  /** Unique key for this checklist item */
  id: string;
  /** Human-readable action description */
  label: string;
  /** Keywords to match against the action timeline (normalized, accent-free) */
  matchKeywords: string[];
  /** Target time in game-minutes (null = no time constraint, just must be done) */
  targetMinutes: number | null;
  /** Scoring weight 0-1 (higher = more important) */
  weight: number;
  /** Bibliographic reference for this recommendation */
  reference: string;
  /** Clinical rationale for why this action is important */
  rationale: string;
}

export interface ProtocolDefinition {
  /** Protocol name */
  name: string;
  /** Keywords to detect this protocol from the narrative */
  detectionKeywords: string[];
  /** Ordered list of mandatory actions */
  items: ProtocolItem[];
}

export interface ChecklistResult {
  itemId: string;
  label: string;
  status: "done" | "late" | "missed";
  /** Game-minutes when performed, or null if missed */
  performedAt: number | null;
  /** Target in minutes */
  targetMinutes: number | null;
  reference: string;
  weight: number;
}

export interface ProtocolEvaluation {
  protocolName: string;
  results: ChecklistResult[];
  /** Adherence score 0-10 based on weighted checklist completion */
  adherenceScore: number;
}

// ── Protocol Definitions ─────────────────────────────────────────────────

const PROTOCOLS: ProtocolDefinition[] = [
  {
    name: "IAM com Supra de ST (STEMI)",
    detectionKeywords: ["iam", "infarto", "stemi", "supra de st", "supradesnivelamento", "infarto agudo"],
    items: [
      {
        id: "iam_ecg",
        label: "ECG em até 10 minutos",
        matchKeywords: ["ecg", "eletrocardiograma"],
        targetMinutes: 10,
        weight: 0.15,
        reference: "AHA/ACC 2023 STEMI Guidelines — ECG within 10 min of first medical contact",
      },
      {
        id: "iam_aas",
        label: "AAS 150-300mg VO",
        matchKeywords: ["aas", "aspirina", "acido acetilsalicilico"],
        targetMinutes: 15,
        weight: 0.15,
        reference: "ESC 2023 ACS Guidelines — Aspirin loading dose as soon as possible",
      },
      {
        id: "iam_clopidogrel",
        label: "Clopidogrel / Inibidor P2Y12",
        matchKeywords: ["clopidogrel", "ticagrelor", "prasugrel", "p2y12"],
        targetMinutes: 30,
        weight: 0.12,
        reference: "ESC 2023 — Dual antiplatelet therapy (DAPT) recommended",
      },
      {
        id: "iam_heparina",
        label: "Anticoagulação (Heparina)",
        matchKeywords: ["heparina", "enoxaparina", "anticoagul"],
        targetMinutes: 30,
        weight: 0.12,
        reference: "AHA/ACC 2023 — Anticoagulation during PCI or fibrinolysis",
      },
      {
        id: "iam_morfina",
        label: "Analgesia (Morfina se dor intensa)",
        matchKeywords: ["morfina", "fentanil", "analgesia"],
        targetMinutes: null,
        weight: 0.06,
        reference: "AHA 2023 — Morphine for refractory chest pain (use with caution)",
      },
      {
        id: "iam_reperfusao",
        label: "Reperfusão (Cateterismo/Trombólise) em <90min",
        matchKeywords: ["cateterismo", "angioplastia", "reperfusao", "trombolise", "trombolitico", "fibrinolitico"],
        targetMinutes: 90,
        weight: 0.25,
        reference: "AHA/ACC 2023 — Door-to-Balloon <90 min, Door-to-Needle <30 min",
      },
      {
        id: "iam_monitor",
        label: "Monitorização contínua",
        matchKeywords: ["monitoriz", "monitor", "oximetria", "o2_suplementar", "oxigenio"],
        targetMinutes: 5,
        weight: 0.08,
        reference: "AHA ACLS 2020 — Continuous cardiac monitoring in ACS",
      },
      {
        id: "iam_acesso",
        label: "Acesso venoso periférico",
        matchKeywords: ["acesso_venoso", "acesso venoso", "veia", "jelco"],
        targetMinutes: 10,
        weight: 0.07,
        reference: "ACLS 2020 — IV access for medication administration",
      },
    ],
  },
  {
    name: "Sepse / Choque Séptico",
    detectionKeywords: ["sepse", "sepsis", "choque septico", "choque séptico", "infeccao grave"],
    items: [
      {
        id: "sepse_lactato",
        label: "Dosagem de Lactato",
        matchKeywords: ["lactato"],
        targetMinutes: 15,
        weight: 0.12,
        reference: "Surviving Sepsis Campaign 2021 — Measure lactate within 1 hour",
      },
      {
        id: "sepse_hemocultura",
        label: "Hemoculturas antes do ATB",
        matchKeywords: ["hemocultura", "cultura"],
        targetMinutes: 30,
        weight: 0.12,
        reference: "SSC 2021 — Obtain blood cultures before antimicrobials when possible",
      },
      {
        id: "sepse_atb",
        label: "Antibiótico de amplo espectro em <60min",
        matchKeywords: ["antibiotico", "ceftriaxona", "piperacilina", "meropenem", "vancomicina", "tazobactam"],
        targetMinutes: 60,
        weight: 0.25,
        reference: "SSC 2021 — Administer antimicrobials within 1 hour of sepsis recognition",
      },
      {
        id: "sepse_volume",
        label: "Cristaloide 30ml/kg em <3h",
        matchKeywords: ["cristaloide", "ringer", "soro fisiologico", "reposicao_volemica", "volume"],
        targetMinutes: 180,
        weight: 0.20,
        reference: "SSC 2021 — 30 mL/kg IV crystalloid for hypotension or lactate ≥4",
      },
      {
        id: "sepse_vasopressor",
        label: "Vasopressor se PAM <65 após volume",
        matchKeywords: ["noradrenalina", "vasopressor", "norepinefrina"],
        targetMinutes: null,
        weight: 0.12,
        reference: "SSC 2021 — Norepinephrine first-line vasopressor, target MAP ≥65 mmHg",
      },
      {
        id: "sepse_acesso",
        label: "Acesso venoso",
        matchKeywords: ["acesso_venoso", "acesso venoso", "veia"],
        targetMinutes: 10,
        weight: 0.07,
        reference: "SSC 2021 — IV access for fluid resuscitation",
      },
      {
        id: "sepse_monitor",
        label: "Monitorização + reavaliação",
        matchKeywords: ["monitoriz", "monitor", "reavaliar", "reavaliacao"],
        targetMinutes: null,
        weight: 0.06,
        reference: "SSC 2021 — Reassess volume status and tissue perfusion",
      },
      {
        id: "sepse_gasometria",
        label: "Gasometria arterial",
        matchKeywords: ["gasometria"],
        targetMinutes: 30,
        weight: 0.06,
        reference: "SSC 2021 — Assess acid-base status early",
      },
    ],
  },
  {
    name: "PCR / Parada Cardiorrespiratória",
    detectionKeywords: ["pcr", "parada cardior", "parada cardiaca", "assistolia", "fibrilacao ventricular", "aesp"],
    items: [
      {
        id: "pcr_rcp",
        label: "Iniciar RCP imediatamente",
        matchKeywords: ["rcp", "massagem_cardiaca", "compressoes", "massagem cardiaca"],
        targetMinutes: 1,
        weight: 0.30,
        reference: "AHA ACLS 2020 — Begin high-quality CPR immediately",
      },
      {
        id: "pcr_defib",
        label: "Desfibrilação (se ritmo chocável)",
        matchKeywords: ["desfibrilacao", "desfibrilador", "choque"],
        targetMinutes: 3,
        weight: 0.25,
        reference: "AHA ACLS 2020 — Defibrillation within 3 min for VF/pVT",
      },
      {
        id: "pcr_epinefrina",
        label: "Epinefrina 1mg IV",
        matchKeywords: ["epinefrina", "adrenalina"],
        targetMinutes: 5,
        weight: 0.15,
        reference: "AHA ACLS 2020 — Epinephrine q3-5 min during cardiac arrest",
      },
      {
        id: "pcr_via_aerea",
        label: "Garantir via aérea avançada",
        matchKeywords: ["intubacao", "via aerea", "tubo"],
        targetMinutes: 10,
        weight: 0.15,
        reference: "AHA ACLS 2020 — Advanced airway when feasible without interrupting CPR",
      },
      {
        id: "pcr_acesso",
        label: "Acesso venoso/intraósseo",
        matchKeywords: ["acesso_venoso", "acesso venoso", "intraosseo"],
        targetMinutes: 5,
        weight: 0.08,
        reference: "AHA ACLS 2020 — IV/IO access for drug delivery",
      },
      {
        id: "pcr_amiodarona",
        label: "Amiodarona (se FV/TV refratária)",
        matchKeywords: ["amiodarona"],
        targetMinutes: null,
        weight: 0.07,
        reference: "AHA ACLS 2020 — Amiodarone 300mg for refractory VF/pVT",
      },
    ],
  },
  {
    name: "Insuficiência Respiratória Aguda",
    detectionKeywords: ["insuficiencia respiratoria", "irpa", "dispneia aguda", "edema pulmonar", "asma grave"],
    items: [
      {
        id: "irpa_o2",
        label: "Oxigênio suplementar imediato",
        matchKeywords: ["o2_suplementar", "oxigenio", "mascara", "cateter nasal"],
        targetMinutes: 2,
        weight: 0.20,
        reference: "BTS 2017 — Oxygen therapy to maintain SpO2 94-98%",
      },
      {
        id: "irpa_monitor",
        label: "Monitorização (SpO2, FR)",
        matchKeywords: ["monitoriz", "monitor", "oximetria"],
        targetMinutes: 5,
        weight: 0.10,
        reference: "BTS 2017 — Continuous pulse oximetry monitoring",
      },
      {
        id: "irpa_gasometria",
        label: "Gasometria arterial",
        matchKeywords: ["gasometria"],
        targetMinutes: 15,
        weight: 0.12,
        reference: "BTS 2017 — ABG to assess ventilation and acid-base",
      },
      {
        id: "irpa_rx",
        label: "RX de Tórax",
        matchKeywords: ["rx_torax", "raio_x", "radiografia", "rx torax", "raio x"],
        targetMinutes: 30,
        weight: 0.10,
        reference: "ATS/ERS 2017 — Chest X-ray for acute respiratory failure evaluation",
      },
      {
        id: "irpa_broncodilatador",
        label: "Broncodilatador (se broncoespasmo)",
        matchKeywords: ["salbutamol", "broncodilatador", "nebulizacao", "fenoterol"],
        targetMinutes: 10,
        weight: 0.12,
        reference: "GINA 2023 — Short-acting beta-agonist for acute bronchospasm",
      },
      {
        id: "irpa_corticoide",
        label: "Corticóide (se indicado)",
        matchKeywords: ["hidrocortisona", "corticoide", "metilprednisolona", "dexametasona", "prednisona"],
        targetMinutes: 30,
        weight: 0.10,
        reference: "GINA 2023 — Systemic corticosteroids in severe exacerbations",
      },
      {
        id: "irpa_intubacao",
        label: "Intubação (se falha de VNI/deterioração)",
        matchKeywords: ["intubacao", "ventilacao_mecanica"],
        targetMinutes: null,
        weight: 0.15,
        reference: "ATS/ERS 2017 — Invasive ventilation for refractory respiratory failure",
      },
      {
        id: "irpa_acesso",
        label: "Acesso venoso",
        matchKeywords: ["acesso_venoso", "acesso venoso"],
        targetMinutes: 10,
        weight: 0.06,
        reference: "General — IV access for medication administration",
      },
    ],
  },
  {
    name: "Trauma / Choque Hemorrágico",
    detectionKeywords: ["trauma", "choque hemorragico", "choque hemorrágico", "hemorragia", "politrauma"],
    items: [
      {
        id: "trauma_abcde",
        label: "Avaliação ABCDE primária",
        matchKeywords: ["exame_fisico", "exame fisico", "abcde", "avaliacao primaria"],
        targetMinutes: 5,
        weight: 0.15,
        reference: "ATLS 10th Ed — Primary survey ABCDE approach",
      },
      {
        id: "trauma_acesso",
        label: "Dois acessos venosos calibrosos",
        matchKeywords: ["acesso_venoso", "acesso venoso", "dois acessos"],
        targetMinutes: 5,
        weight: 0.10,
        reference: "ATLS 10th Ed — Two large-bore IV lines",
      },
      {
        id: "trauma_volume",
        label: "Reposição volêmica agressiva",
        matchKeywords: ["cristaloide", "ringer", "reposicao_volemica", "volume"],
        targetMinutes: 15,
        weight: 0.18,
        reference: "ATLS 10th Ed — Isotonic crystalloid for hemorrhagic shock",
      },
      {
        id: "trauma_hemoderivado",
        label: "Hemoderivados (se classe III/IV)",
        matchKeywords: ["hemoderivado", "concentrado de hemacias", "sangue", "transfusao"],
        targetMinutes: 30,
        weight: 0.15,
        reference: "ATLS 10th Ed — Blood transfusion for class III/IV hemorrhage",
      },
      {
        id: "trauma_imagem",
        label: "Exame de imagem (FAST/TC)",
        matchKeywords: ["fast", "ultrassom", "tc", "tomografia"],
        targetMinutes: 30,
        weight: 0.12,
        reference: "ATLS 10th Ed — FAST exam in trauma assessment",
      },
      {
        id: "trauma_o2",
        label: "Oxigênio suplementar",
        matchKeywords: ["o2_suplementar", "oxigenio"],
        targetMinutes: 5,
        weight: 0.08,
        reference: "ATLS 10th Ed — High-flow O2 for trauma patients",
      },
      {
        id: "trauma_drenagem",
        label: "Drenagem torácica (se pneumo/hemotórax)",
        matchKeywords: ["drenagem_torax", "drenagem toracica"],
        targetMinutes: null,
        weight: 0.12,
        reference: "ATLS 10th Ed — Tube thoracostomy for hemopneumothorax",
      },
    ],
  },
];

// ── Normalize helper ─────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_");
}

// ── Evaluation Functions ─────────────────────────────────────────────────

/** Detect which protocol applies based on the simulation narrative. */
export function detectProtocol(narrative: string): ProtocolDefinition | null {
  const norm = normalize(narrative);
  for (const protocol of PROTOCOLS) {
    for (const kw of protocol.detectionKeywords) {
      if (norm.includes(normalize(kw))) {
        return protocol;
      }
    }
  }
  return null;
}

/** Evaluate a player's action timeline against a protocol checklist. */
export function evaluateProtocol(
  protocol: ProtocolDefinition,
  timeline: ActionTimelineEntry[],
  appliedInterventions: Set<string>
): ProtocolEvaluation {
  const results: ChecklistResult[] = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const item of protocol.items) {
    totalWeight += item.weight;

    // Search timeline for matching action
    let matchedEntry: ActionTimelineEntry | null = null;
    
    // Primary search: direct keyword match in timeline text
    for (const entry of timeline) {
      const normAction = normalize(entry.actionText);
      for (const kw of item.matchKeywords) {
        if (normAction.includes(normalize(kw))) {
          matchedEntry = entry;
          break;
        }
      }
      if (matchedEntry) break;
    }

    // Secondary search: if not found in text, check appliedInterventions 
    // BUT we must find the actual timeline entry that triggered it to get the correct time
    if (!matchedEntry) {
      for (const kw of item.matchKeywords) {
        if (appliedInterventions.has(kw)) {
          // Find the earliest timeline entry that contains this keyword or a close variation
          const found = timeline.find(entry => {
             const normText = normalize(entry.actionText);
             return normText.includes(normalize(kw)) || normalize(kw).includes(normText);
          });
          matchedEntry = found || (timeline.length > 0 ? timeline[0] : null);
          break;
        }
      }
    }


    if (matchedEntry) {
      const isLate = item.targetMinutes !== null && matchedEntry.gameTimeMinutes > item.targetMinutes;
      results.push({
        itemId: item.id,
        label: item.label,
        status: isLate ? "late" : "done",
        performedAt: matchedEntry.gameTimeMinutes,
        targetMinutes: item.targetMinutes,
        reference: item.reference,
        weight: item.weight,
      });
      // Full credit for done, partial for late
      earnedWeight += isLate ? item.weight * 0.5 : item.weight;
    } else {
      results.push({
        itemId: item.id,
        label: item.label,
        status: "missed",
        performedAt: null,
        targetMinutes: item.targetMinutes,
        reference: item.reference,
        weight: item.weight,
      });
    }
  }

  const adherenceScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 10 : 10;

  return {
    protocolName: protocol.name,
    results,
    adherenceScore: Math.round(adherenceScore * 10) / 10,
  };
}

/** Generate a text block for injecting into the LLM debriefing prompt. */
export function evaluationToPromptBlock(evaluation: ProtocolEvaluation): string {
  const lines = [
    `[CHECKLIST DE PROTOCOLO: ${evaluation.protocolName}]`,
    `Nota de Aderência ao Protocolo: ${evaluation.adherenceScore.toFixed(1)}/10.0`,
    "",
  ];

  for (const r of evaluation.results) {
    const icon = r.status === "done" ? "✅" : r.status === "late" ? "⏱️" : "❌";
    let detail = "";
    if (r.status === "done" && r.targetMinutes !== null) {
      detail = ` (realizado em ${r.performedAt}min — meta: <${r.targetMinutes}min)`;
    } else if (r.status === "late") {
      detail = ` (realizado em ${r.performedAt}min — meta: <${r.targetMinutes}min — ATRASADO)`;
    } else if (r.status === "missed") {
      detail = r.targetMinutes !== null ? ` (meta: <${r.targetMinutes}min — NÃO REALIZADO)` : " (NÃO REALIZADO)";
    }
    lines.push(`${icon} ${r.label}${detail}`);
    if (r.status !== "done") {
      lines.push(`   📚 ${r.reference}`);
    }
  }

  return lines.join("\n");
}

/** Get all available protocols (for external use). */
export function getAllProtocols(): ProtocolDefinition[] {
  return [...PROTOCOLS];
}