import { supabase } from "@/integrations/supabase/client";
import { SimulationState, StartParams, ChatMessageAI } from "@/types/simulation";

// Conversation history for multi-turn simulation
let conversationHistory: ChatMessageAI[] = [];

export const getConversationHistory = (): ChatMessageAI[] => [...conversationHistory];

export const startSimulation = async (params: StartParams): Promise<SimulationState> => {
  conversationHistory = [];

  const startCommand = `START_GAME { "especialidade": "${params.especialidade}", "dificuldade": "${params.dificuldade}", "caso_especifico": "${params.caso_especifico || ""}" }`;

  conversationHistory.push({ role: "user", content: startCommand });

  const { data, error } = await supabase.functions.invoke("simulate", {
    body: { messages: conversationHistory },
  });

  if (error) throw new Error(error.message || "Falha ao iniciar simulação");
  if (data?.error) throw new Error(data.error);

  conversationHistory.push({ role: "assistant", content: JSON.stringify(data) });
  return data as SimulationState;
};

export const sendAction = async (
  actionId: string,
  customText?: string
): Promise<SimulationState> => {
  let message = "";
  if (actionId === "LIVRE") {
    message = `AÇÃO LIVRE: ${customText}`;
  } else if (actionId === "SYSTEM_TIMEOUT") {
    message = `SYSTEM EVENT: O tempo do usuário acabou. O paciente deve deteriorar IMEDIATAMENTE. Aplique penalidade grave.`;
  } else {
    message = `OPÇÃO ESCOLHIDA: ${actionId}`;
  }

  conversationHistory.push({ role: "user", content: message });

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
};
