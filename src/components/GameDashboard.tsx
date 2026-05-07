import React, { useState, useEffect, useRef } from "react";
import { SimulationState, ActionType, StartParams } from "@/types/simulation";
import { sendAction, getConversationHistory } from "@/services/simulationService";
import { saveGameResult } from "@/services/gameService";
import { createGameSession, updateGameSession } from "@/services/sessionService";
import { getEngine } from "@/services/physiologyEngine";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import GameHeader from "./game/GameHeader";
import GameEventLog from "./game/GameEventLog";
import GameActionInput from "./game/GameActionInput";
import GameVitalsPanel from "./game/GameVitalsPanel";

interface GameDashboardProps {
  initialState: SimulationState;
  onRestart: () => void;
  onExit: () => void;
  gameParams: StartParams;
}

interface EventLogEntry {
  id: number;
  type: "narrative" | "action" | "system" | "mentor";
  text: string;
  timestamp: string;
}

const GameDashboard: React.FC<GameDashboardProps> = ({
  initialState, onRestart, onExit, gameParams,
}) => {
  const [gameState, setGameState] = useState<SimulationState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [customActionText, setCustomActionText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [diagnosticHypothesis, setDiagnosticHypothesis] = useState("");
  const eventLogEndRef = useRef<HTMLDivElement>(null);
  const eventIdRef = useRef(0);

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

  const pushEvent = (type: EventLogEntry["type"], text: string) => {
    const engine = getEngine();
    const entry: EventLogEntry = {
      id: ++eventIdRef.current,
      type,
      text,
      timestamp: engine.getFormattedTime(),
    };
    setEventLog((prev) => [...prev, entry]);
  };

  useEffect(() => {
    setTimeout(() => eventLogEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [eventLog.length]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const isGameOver = gameState.status_simulacao.estado_paciente === "OBITO" || gameState.status_simulacao.estado_paciente === "CURADO";
  const engine = getEngine();
  const vitals = engine.getVitals();
  const patientState = gameState.status_simulacao.estado_paciente;
  const vitalStatus: 'stable' | 'warning' | 'critical' = 
    patientState === 'CRITICO' || patientState === 'OBITO' ? 'critical' :
    patientState === 'INSTAVEL' ? 'warning' : 'stable';

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <GameHeader 
        caseTitle={gameState.interface_usuario.manchete}
        formattedTime={engine.getFormattedTime()}
        onRestart={onRestart}
        onExit={onExit}
      />

      {/* Main Simulation Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Narrative & Input */}
        <div className="w-full lg:w-[65%] flex flex-col border-r border-border bg-muted/20">
          <ScrollArea className="flex-1">
            <GameEventLog eventLog={eventLog} eventLogEndRef={eventLogEndRef} />
          </ScrollArea>

          {/* Action Input */}
          {!isGameOver && (
            <GameActionInput 
              diagnosticHypothesis={diagnosticHypothesis}
              setDiagnosticHypothesis={setDiagnosticHypothesis}
              customActionText={customActionText}
              setCustomActionText={setCustomActionText}
              isLoading={isLoading}
              onSendAction={() => handleAction("LIVRE", ActionType.LIVRE)}
            />
          )}
        </div>

        {/* Right Panel: Vitals & Summary */}
        <GameVitalsPanel 
          vitals={vitals}
          vitalStatus={vitalStatus}
          gameState={gameState}
          isGameOver={isGameOver}
          onAction={handleAction}
          onRestart={onRestart}
          onExit={onExit}
          formattedTime={engine.getFormattedTime()}
        />
      </div>
    </div>
  );
};

export default GameDashboard;