import { supabase } from "@/integrations/supabase/client";
import { SimulationState, ChatMessageAI } from "@/types/simulation";

export interface GameSession {
  id: string;
  user_id: string;
  specialty: string;
  difficulty: string;
  case_title: string;
  status: string;
  current_score: number;
  conversation_history: ChatMessageAI[];
  last_state: SimulationState | null;
  started_at: string;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export const createGameSession = async (
  specialty: string,
  difficulty: string,
  caseTitle: string,
  initialState: SimulationState,
  conversationHistory: ChatMessageAI[]
): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      user_id: user.id,
      specialty,
      difficulty,
      case_title: caseTitle,
      status: "EM_ANDAMENTO",
      current_score: initialState.status_simulacao.current_score,
      conversation_history: conversationHistory as any,
      last_state: initialState as any,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return null;
  }
  return data?.id || null;
};

export const updateGameSession = async (
  sessionId: string,
  state: SimulationState,
  conversationHistory: ChatMessageAI[]
) => {
  const status = state.status_simulacao.estado_paciente;
  const isFinished = status === "OBITO" || status === "CURADO";

  const updateData: any = {
    current_score: state.status_simulacao.current_score,
    conversation_history: conversationHistory as any,
    last_state: state as any,
    case_title: state.interface_usuario.manchete || "Caso Clínico",
  };

  if (isFinished) {
    updateData.status = status;
    updateData.finished_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("game_sessions")
    .update(updateData)
    .eq("id", sessionId);

  if (error) console.error("Error updating session:", error);
};

export const getUserSessions = async (): Promise<GameSession[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return [];
  return (data || []) as unknown as GameSession[];
};

export const getSessionById = async (sessionId: string): Promise<GameSession | null> => {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) return null;
  return data as unknown as GameSession;
};
