import React, { useRef, useEffect } from "react";
import { SimulationState, StartParams, ActionType } from "@/types/simulation";
import { getEngine } from "@/services/physiologyEngine";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSimulation } from "@/hooks/useSimulation";

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

const GameDashboard: React.FC<GameDashboardProps> = ({
  initialState, onRestart, onExit, gameParams,
}) => {
  const {
    gameState,
    isLoading,
    customActionText,
    setCustomActionText,
    eventLog,
    diagnosticHypothesis,
    setDiagnosticHypothesis,
    handleAction
  } = useSimulation(initialState, gameParams);

  const eventLogEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => eventLogEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [eventLog.length]);

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

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full lg:w-[65%] flex flex-col border-r border-border bg-muted/20">
          <ScrollArea className="flex-1">
            <GameEventLog eventLog={eventLog} eventLogEndRef={eventLogEndRef} />
          </ScrollArea>

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
