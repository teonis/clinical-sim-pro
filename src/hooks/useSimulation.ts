import { useState, useEffect, useRef, useCallback } from "react";
import { SimulationState, ActionType, StartParams } from "@/types/simulation";
import { sendAction, getConversationHistory } from "@/services/simulationService";
import { saveGameResult } from "@/services/gameService";
import { createGameSession, updateGameSession } from "@/services/sessionService";
import { getEngine } from "@/services/physiologyEngine";
import { toast } from "sonner";

export interface EventLogEntry {
  id: number;
  type: "narrative" | "action" | "system" | "mentor";
  text: string;
  timestamp: string;
}

export const useSimulation = (initialState: SimulationState, gameParams: StartParams) => {
  const [gameState, setGameState] = useState<SimulationState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [customActionText, setCustomActionText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [diagnosticHypothesis, setDiagnosticHypothesis] = useState("");
  const eventIdRef = useRef(0);

  const pushEvent = useCallback((type: EventLogEntry["type"], text: string) => {
    const engine = getEngine();
    const entry: EventLogEntry = {
      id: ++eventIdRef.current,
      type,
      text,
      timestamp: engine.getFormattedTime(),
    };
    setEventLog((prev) => [...prev, entry]);
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const caseTitle = initialState.interface_usuario.manchete || `Caso de ${gameParams.especialidade}`;
      const id = await createGameSession(
        gameParams.especialidade,
        gameParams.dificuldade,
        caseTitle,
        initialState,
        getConversationHistory()
      );
      if (id) setSessionId(id);
    };
    initSession();
    pushEvent("narrative", initialState.interface_usuario.narrativa_principal);
  }, []);

  const handleAction = async (id: string, type: string, text?: string) => {
    if (isLoading) return;
    if (type === ActionType.LIVRE && !customActionText.trim()) return;
    setIsLoading(true);

    const actionLabel = type === ActionType.LIVRE ? customActionText : (text || id);
    pushEvent("action", actionLabel);

    try {
      const actionPayload = type === ActionType.LIVRE ? customActionText : undefined;
      const enrichedAction = diagnosticHypothesis.trim() 
        ? `[IMPRESSÃO CLÍNICA: ${diagnosticHypothesis}]\n${actionPayload || actionLabel}`
        : actionPayload;

      const newState = await sendAction(id, enrichedAction);
      setGameState(newState);
      setCustomActionText("");

      pushEvent("narrative", newState.interface_usuario.narrativa_principal);
      if (newState.interface_usuario.score_feedback) {
        pushEvent("mentor", newState.interface_usuario.score_feedback);
      }

      if (sessionId) {
        updateGameSession(sessionId, newState, getConversationHistory());
      }
      
      if (newState.status_simulacao.estado_paciente === "OBITO" || newState.status_simulacao.estado_paciente === "CURADO") {
        await saveGameResult(
          newState.status_simulacao.current_score,
          newState.status_simulacao.estado_paciente,
          gameParams.dificuldade,
          gameParams.especialidade,
          newState.interface_usuario.manchete
        );
      }
    } catch (error: any) {
      console.error("Error processing action:", error);
      pushEvent("system", "Erro na transmissão de dados.");
      toast.error(error.message || "Erro ao processar ação.");
      pushEvent("mentor", `Sistema: Tivemos um problema na transmissão dos seus comandos. Vamos tentar novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    gameState,
    isLoading,
    customActionText,
    setCustomActionText,
    eventLog,
    diagnosticHypothesis,
    setDiagnosticHypothesis,
    handleAction
  };
};
