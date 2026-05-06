import React, { useState, useEffect, useRef } from "react";
import { SimulationState, ActionType, StartParams } from "@/types/simulation";
import { sendAction, getConversationHistory, getLastProtocolEvaluation, getLastGeneratedCase } from "@/services/simulationService";
import { saveGameResult } from "@/services/gameService";
import { createGameSession, updateGameSession } from "@/services/sessionService";
import { getEngine } from "@/services/physiologyEngine";
import type { ProtocolEvaluation } from "@/services/protocolChecklists";
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
  Stethoscope, GraduationCap, AlertTriangle, ClipboardList,
  Skull, CheckCircle, User, MessageSquare, ChevronRight, Loader2,
  Activity, Zap, ShieldAlert, FileText, Heart, Wind
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      pushEvent("system", "Erro de conexão com o terminal médico.");
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
    <div className="flex flex-col h-screen bg-[#030303] text-foreground overflow-hidden">
      {/* Dynamic Header */}
      <header className="h-20 shrink-0 bg-black/40 backdrop-blur-2xl border-b border-white/5 px-8 flex items-center justify-between z-40">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <Zap className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none uppercase">{gameState.interface_usuario.manchete}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {gameParams.especialidade}
              </span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">{gameParams.dificuldade}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs font-black text-white tabular-nums tracking-widest">{engine.getFormattedTime()}</span>
          </div>
          <div className="h-10 w-px bg-white/5" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={onRestart} className="h-10 w-10 rounded-xl hover:bg-white/5 text-muted-foreground"><RotateCcw className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={onExit} className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      {/* Main Simulation Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Console: Clinical Narrative & Logs */}
        <div className="w-full lg:w-[60%] flex flex-col border-r border-white/5 bg-black/20">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-8 max-w-4xl mx-auto">
              <AnimatePresence mode="popLayout">
                {eventLog.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex gap-6",
                      entry.type === "action" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xl border",
                      entry.type === "narrative" ? "bg-white/5 border-white/5 text-primary" :
                      entry.type === "action" ? "bg-primary border-primary text-black" :
                      entry.type === "mentor" ? "bg-primary/10 border-primary/20 text-primary" :
                      "bg-destructive/10 border-destructive/20 text-destructive"
                    )}>
                      {entry.type === "narrative" ? <Stethoscope className="h-5 w-5" /> :
                       entry.type === "action" ? <ChevronRight className="h-5 w-5" /> :
                       entry.type === "mentor" ? <GraduationCap className="h-5 w-5" /> :
                       <ShieldAlert className="h-5 w-5" />}
                    </div>
                    <div className={cn(
                      "flex-1 space-y-2",
                      entry.type === "action" && "text-right"
                    )}>
                      <div className={cn(
                        "inline-block px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-xl",
                        entry.type === "narrative" ? "bg-white/[0.03] border border-white/5 text-white/90" :
                        entry.type === "action" ? "bg-primary text-black font-black" :
                        entry.type === "mentor" ? "bg-primary/5 border border-primary/20 text-primary italic" :
                        "bg-destructive/5 border border-destructive/20 text-destructive"
                      )}>
                        {renderWithTooltips(entry.text)}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-2 opacity-50">
                        <span>{entry.timestamp}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{entry.type}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={eventLogEndRef} />
            </div>
          </ScrollArea>

          {/* Inline Action Bar */}
          {!isGameOver && (
            <div className="p-8 bg-black/40 border-t border-white/5 space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={diagnosticHypothesis}
                    onChange={(e) => setDiagnosticHypothesis(e.target.value)}
                    placeholder="DIGITE SUA HIPÓTESE DIAGNÓSTICA..."
                    className="h-14 bg-white/5 border-white/5 rounded-xl pl-12 pr-4 text-[10px] font-black uppercase tracking-[0.2em] focus:border-primary/30"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input 
                    value={customActionText}
                    onChange={(e) => setCustomActionText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAction("LIVRE", ActionType.LIVRE)}
                    placeholder="PRESCREVER CONDUTA OU SOLICITAR EXAME..."
                    className="h-16 bg-primary/5 border-primary/20 rounded-2xl px-6 text-sm font-bold text-white placeholder:text-primary/30 focus:border-primary transition-all"
                  />
                  <Button 
                    onClick={() => handleAction("LIVRE", ActionType.LIVRE)}
                    disabled={isLoading || !customActionText.trim()}
                    className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-primary text-black hover:scale-105 transition-all"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Vitals & Command Center */}
        <div className="hidden lg:flex flex-col w-[40%] bg-black/40 backdrop-blur-xl">
          <div className="p-8 space-y-8 flex-1 overflow-y-auto">
            {/* Vital Monitor */}
            <VitalMonitor 
              fc={vitals.hr} 
              pas={vitals.sbp} 
              pad={vitals.dbp} 
              satO2={vitals.spo2} 
              fr={vitals.rr} 
              status={vitalStatus} 
            />

            {/* Quick Actions Console */}
            {!isGameOver && (
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
                  <Activity className="h-4 w-4 text-primary" /> Console de Interação Rápida
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {gameState.opcoes_interacao.filter(opt => opt.tipo !== "LIVRE").slice(0, 6).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAction(opt.id, opt.tipo, opt.texto)}
                      className="group bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:border-primary/50 transition-all hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                          opt.tipo === "EXAME" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                        )}>
                          {opt.tipo === "EXAME" ? <Microscope className="h-5 w-5" /> : <Pill className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{opt.tipo}</p>
                          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{opt.texto}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Debriefing Panel when Game Over */}
            {isGameOver && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className={cn(
                  "p-10 rounded-[3rem] border-4 flex flex-col items-center text-center space-y-6 shadow-2xl",
                  patientState === "CURADO" ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"
                )}>
                  {patientState === "CURADO" ? <CheckCircle className="h-20 w-20 text-primary" /> : <Skull className="h-20 w-20 text-destructive" />}
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{patientState === "CURADO" ? "Paciente Estabilizado" : "Óbito Confirmado"}</h2>
                    <p className="text-muted-foreground mt-2 font-medium tracking-tight">Relatório de desempenho médico gerado com sucesso.</p>
                  </div>
                  <div className="flex items-center gap-10 pt-4">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Score Final</p>
                      <p className="text-5xl font-black text-primary tabular-nums tracking-tighter">{gameState.status_simulacao.current_score.toFixed(1)}</p>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Tempo de Resposta</p>
                      <p className="text-5xl font-black text-white tabular-nums tracking-tighter">{engine.getFormattedTime()}</p>
                    </div>
                  </div>
                </div>
                
                <Button onClick={onRestart} className="w-full h-20 rounded-3xl text-xl font-black uppercase tracking-widest bg-primary text-black hover:scale-[1.02] transition-all">Novo Caso Clínico</Button>
                <Button variant="outline" onClick={onExit} className="w-full h-20 rounded-3xl text-xl font-black uppercase tracking-widest border-2 border-white/5 hover:bg-white/5 transition-all">Voltar ao Console</Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;