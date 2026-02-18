import { supabase } from "@/integrations/supabase/client";
import { SimulationState, StartParams, ChatMessageAI } from "@/types/simulation";
import { getEngine, resetEngine, EngineVitals } from "./physiologyEngine";
import { detectProtocol, evaluateProtocol, evaluationToPromptBlock, ProtocolEvaluation } from "./protocolChecklists";

let lastProtocolEvaluation: ProtocolEvaluation | null = null;

export const getLastProtocolEvaluation = (): ProtocolEvaluation | null => lastProtocolEvaluation;

// Conversation history for multi-turn simulation
let conversationHistory: ChatMessageAI[] = [];

export const getConversationHistory = (): ChatMessageAI[] => [...conversationHistory];

/** Map the LLM's sinais_vitais string into initial engine vitals (best-effort). */
function parseVitalsFromResponse(state: SimulationState): Partial<EngineVitals> {
  const raw = state.dados_medicos?.sinais_vitais ?? "";
  const nums = (pattern: RegExp): number | undefined => {
    const m = raw.match(pattern);
    return m ? parseFloat(m[1]) : undefined;
  };
  return {
    hr: nums(/FC[:\s]*(\d+)/i),
    sbp: nums(/PA[:\s]*(\d+)/i),
    dbp: nums(/\/(\d+)\s*mmHg/i),
    spo2: nums(/SpO2[:\s]*(\d+)/i) ?? nums(/Sat[:\s]*(\d+)/i),
    rr: nums(/FR[:\s]*(\d+)/i),
    temp: nums(/Temp[:\s]*([\d.]+)/i),
  };
}

export const startSimulation = async (params: StartParams): Promise<SimulationState> => {
  conversationHistory = [];
  resetEngine(); // fresh engine

  const startCommand = `START_GAME { "especialidade": "${params.especialidade}", "dificuldade": "${params.dificuldade}", "caso_especifico": "${params.caso_especifico || ""}" }`;

  conversationHistory.push({ role: "user", content: startCommand });

  const { data, error } = await supabase.functions.invoke("simulate", {
    body: { messages: conversationHistory },
  });

  if (error) throw new Error(error.message || "Falha ao iniciar simulação");
  if (data?.error) throw new Error(data.error);

  // Seed engine with the initial vitals the LLM described
  const initialVitals = parseVitalsFromResponse(data as SimulationState);
  const engine = resetEngine(initialVitals);

  // Detect conditions from initial narrative
  const state = data as SimulationState;
  const narrative = `${state.interface_usuario.manchete} ${state.interface_usuario.narrativa_principal}`;
  engine.setConditionsFromNarrative(narrative);

  conversationHistory.push({ role: "assistant", content: JSON.stringify(data) });
  return state;
};

export const sendAction = async (
  actionId: string,
  customText?: string
): Promise<SimulationState> => {
  const engine = getEngine();

  let message = "";
  if (actionId === "LIVRE") {
    message = `AÇÃO LIVRE: ${customText}`;
  } else if (actionId === "SYSTEM_TIMEOUT") {
    message = `SYSTEM EVENT: O tempo do usuário acabou. O paciente deve deteriorar IMEDIATAMENTE. Aplique penalidade grave.`;
  } else {
    message = `OPÇÃO ESCOLHIDA: ${actionId}`;
  }

  // 1. Apply deterministic intervention effects
  const actionText = customText || actionId;
  engine.applyIntervention(actionText);

  // 2. Calculate time cost for this action
  const timeCost = actionId === "SYSTEM_TIMEOUT" ? 3 : engine.getTimeCostForAction(actionText);

  // 3. Tick game time forward → degrade vitals based on last known patient state
  const lastAssistant = [...conversationHistory].reverse().find(m => m.role === "assistant");
  let currentPatientState = "ESTAVEL";
  if (lastAssistant) {
    try {
      const parsed = JSON.parse(lastAssistant.content);
      currentPatientState = parsed.status_simulacao?.estado_paciente ?? "ESTAVEL";

      // Update conditions from latest narrative
      const narr = `${parsed.interface_usuario?.manchete ?? ""} ${parsed.interface_usuario?.narrativa_principal ?? ""}`;
      engine.setConditionsFromNarrative(narr);
    } catch { /* keep default */ }
  }
  engine.tick(timeCost, currentPatientState);

  // 4. Log action to timeline
  engine.logAction(actionText);

  // 5. Inject calculated vitals + time into the user message
  const vitalsBlock = engine.toPromptBlock();

  // 6. If game is ending, evaluate protocol checklist and inject into prompt
  let checklistBlock = "";
  const fullNarrative = conversationHistory
    .filter(m => m.role === "assistant")
    .map(m => {
      try { const p = JSON.parse(m.content); return `${p.interface_usuario?.manchete ?? ""} ${p.interface_usuario?.narrativa_principal ?? ""}`; }
      catch { return ""; }
    }).join(" ");
  const protocol = detectProtocol(fullNarrative);
  if (protocol) {
    const evaluation = evaluateProtocol(protocol, engine.getActionTimeline(), engine.getAppliedInterventions());
    lastProtocolEvaluation = evaluation;
    checklistBlock = `\n\n${evaluationToPromptBlock(evaluation)}`;
  }

  const enrichedMessage = `${message}\n\n${vitalsBlock}\n\nTempo gasto nesta ação: ${timeCost} min${checklistBlock}`;

  conversationHistory.push({ role: "user", content: enrichedMessage });

  const { data, error } = await supabase.functions.invoke("simulate", {
    body: { messages: conversationHistory },
  });

  if (error) throw new Error(error.message || "Falha ao processar ação");
  if (data?.error) throw new Error(data.error);

  conversationHistory.push({ role: "assistant", content: JSON.stringify(data) });
  return data as SimulationState;
};

export const resetConversation = () => {
  conversationHistory = [];
  lastProtocolEvaluation = null;
  resetEngine();
};
