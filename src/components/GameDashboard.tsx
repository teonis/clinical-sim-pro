import React, { useState, useEffect, useRef } from "react";
import { SimulationState, ActionType, StartParams } from "@/types/simulation";
import { sendAction, getConversationHistory, getLastProtocolEvaluation } from "@/services/simulationService";
import { saveGameResult } from "@/services/gameService";
import { createGameSession, updateGameSession } from "@/services/sessionService";
import { getEngine } from "@/services/physiologyEngine";
import { renderWithTooltips } from "@/components/MedicalTooltip";
import VitalMonitor from "@/components/VitalMonitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Send, RotateCcw, LogOut, Clock, Microscope, Pill, Syringe,
  Stethoscope, GraduationCap, AlertTriangle, ChevronRight, Loader2,
  Activity, Zap, ShieldAlert, FileText, CheckCircle, Skull
} from "lucide-react";

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
    } catch (error) {
      console.error("Error processing action:", error);
      pushEvent("system", "Erro na transmissão de dados.");
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
      {/* Minimal Header */}
      <header className="h-16 shrink-0 bg-card border-b border-border px-8 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-sm font-bold tracking-tight uppercase">{gameState.interface_usuario.manchete}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
            <Clock className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold tabular-nums tracking-widest">{engine.getFormattedTime()}</span>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={onRestart} className="h-8 w-8 rounded-lg hover:bg-muted"><RotateCcw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onExit} className="h-8 w-8 rounded-lg hover:bg-destructive/5 hover:text-destructive"><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>

      {/* Main Simulation Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Narrative & Input */}
        <div className="w-full lg:w-[65%] flex flex-col border-r border-border bg-muted/20">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-6 max-w-4xl mx-auto">
              <AnimatePresence mode="popLayout">
                {eventLog.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4",
                      entry.type === "action" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                      entry.type === "narrative" ? "bg-card border-border text-primary" :
                      entry.type === "action" ? "bg-primary border-primary text-primary-foreground" :
                      entry.type === "mentor" ? "bg-primary/10 border-primary/20 text-primary" :
                      "bg-destructive/10 border-destructive/20 text-destructive"
                    )}>
                      {entry.type === "narrative" ? <Stethoscope className="h-4 w-4" /> :
                       entry.type === "action" ? <ChevronRight className="h-4 w-4" /> :
                       entry.type === "mentor" ? <GraduationCap className="h-4 w-4" /> :
                       <ShieldAlert className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "flex-1 space-y-1",
                      entry.type === "action" && "text-right"
                    )}>
                      <div className={cn(
                        "inline-block px-5 py-3 rounded-2xl text-sm leading-relaxed",
                        entry.type === "narrative" ? "bg-card border border-border shadow-sm text-foreground" :
                        entry.type === "action" ? "bg-primary text-primary-foreground font-bold" :
                        entry.type === "mentor" ? "bg-primary/5 border border-primary/10 text-primary italic" :
                        "bg-destructive/5 border border-destructive/10 text-destructive"
                      )}>
                        {renderWithTooltips(entry.text)}
                      </div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                        {entry.timestamp}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={eventLogEndRef} />
            </div>
          </ScrollArea>

          {/* Action Input */}
          {!isGameOver && (
            <div className="p-6 bg-card border-t border-border space-y-4 shadow-xl">
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  value={diagnosticHypothesis}
                  onChange={(e) => setDiagnosticHypothesis(e.target.value)}
                  placeholder="HIPÓTESE DIAGNÓSTICA..."
                  className="h-10 bg-muted border-none rounded-xl pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="relative">
                <Input 
                  value={customActionText}
                  onChange={(e) => setCustomActionText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAction("LIVRE", ActionType.LIVRE)}
                  placeholder="DIGITE SUA CONDUTA..."
                  className="h-14 bg-muted border-none rounded-xl px-6 text-sm font-bold text-foreground placeholder:text-muted-foreground/30 transition-all"
                />
                <Button 
                  onClick={() => handleAction("LIVRE", ActionType.LIVRE)}
                  disabled={isLoading || !customActionText.trim()}
                  className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-primary text-primary-foreground hover:scale-105 transition-all"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Vitals & Summary */}
        <div className="hidden lg:flex flex-col w-[35%] bg-card">
          <div className="p-8 space-y-8 flex-1 overflow-y-auto">
            <VitalMonitor 
              fc={vitals.hr} 
              pas={vitals.sbp} 
              pad={vitals.dbp} 
              satO2={vitals.spo2} 
              fr={vitals.rr} 
              status={vitalStatus} 
            />

            {!isGameOver && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Ações Sugeridas
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {gameState.opcoes_interacao.filter(opt => opt.tipo !== "LIVRE").slice(0, 5).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAction(opt.id, opt.tipo, opt.texto)}
                      className="group bg-muted border border-transparent p-4 rounded-xl flex items-center justify-between hover:border-primary/20 transition-all hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          opt.tipo === "EXAME" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                        )}>
                          {opt.tipo === "EXAME" ? <Microscope className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{opt.tipo}</p>
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{opt.texto}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isGameOver && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className={cn(
                  "p-8 rounded-[2rem] border flex flex-col items-center text-center space-y-4 shadow-sm",
                  patientState === "CURADO" ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"
                )}>
                  {patientState === "CURADO" ? <CheckCircle className="h-16 w-16 text-primary" /> : <Skull className="h-16 w-16 text-destructive" />}
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">{patientState === "CURADO" ? "Sucesso" : "Óbito"}</h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Sessão de simulação concluída.</p>
                  </div>
                  <div className="flex items-center gap-8 pt-4">
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Score</p>
                      <p className="text-3xl font-black text-primary tabular-nums">{gameState.status_simulacao.current_score.toFixed(1)}</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tempo</p>
                      <p className="text-3xl font-black text-foreground tabular-nums">{engine.getFormattedTime()}</p>
                    </div>
                  </div>
                </div>
                
                <Button onClick={onRestart} className="w-full h-14 rounded-xl text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20">Novo Caso</Button>
                <Button variant="outline" onClick={onExit} className="w-full h-14 rounded-xl text-xs font-bold uppercase tracking-widest border border-border">Sair</Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;