import { supabase } from "@/integrations/supabase/client";
import { SimulationState, StartParams, ChatMessageAI } from "@/types/simulation";
import { getEngine, resetEngine, EngineVitals } from "./physiologyEngine";

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

/** How many game-minutes each action type advances. */
function tickMinutesForAction(actionId: string): number {
  if (actionId === "SYSTEM_TIMEOUT") return 3;
  if (actionId === "LIVRE") return 5;
  return 5; // default per action
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
  resetEngine(initialVitals);

  conversationHistory.push({ role: "assistant", content: JSON.stringify(data) });
  return data as SimulationState;
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

  // 2. Tick game time forward → degrade vitals based on last known patient state
  const lastAssistant = [...conversationHistory].reverse().find(m => m.role === "assistant");
  let currentPatientState = "ESTAVEL";
  if (lastAssistant) {
    try {
      const parsed = JSON.parse(lastAssistant.content);
      currentPatientState = parsed.status_simulacao?.estado_paciente ?? "ESTAVEL";
    } catch { /* keep default */ }
  }
  engine.tick(tickMinutesForAction(actionId), currentPatientState);

  // 3. Inject calculated vitals into the user message so LLM uses real numbers
  const vitalsBlock = engine.toPromptBlock();
  const enrichedMessage = `${message}\n\n${vitalsBlock}`;

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
  resetEngine();
};
