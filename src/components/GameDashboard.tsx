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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Send,
  RotateCcw,
  LogOut,
  Clock,
  Microscope,
  Pill,
  Syringe,
  Stethoscope,
  GraduationCap,
  ThumbsUp,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Skull,
  CheckCircle,
  Pause,
  User,
  MessageSquare,
  ChevronRight,
  Loader2,
  FileText,
  Activity,
  Heart,
  Thermometer,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";



// ── Types ────────────────────────────────────────────────────────────────

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
  gameMinutes: number;
}

// ── Component ────────────────────────────────────────────────────────────


const GameDashboard: React.FC<GameDashboardProps> = ({
  initialState,
  onRestart,
  onExit,
  gameParams,
}) => {
  const [gameState, setGameState] = useState<SimulationState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [customActionText, setCustomActionText] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [prevScore, setPrevScore] = useState(10.0);
  const [scoreDiff, setScoreDiff] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [diagnosticHypothesis, setDiagnosticHypothesis] = useState("");
  const [activeTab, setActiveTab] = useState("narrative");
  const eventLogEndRef = useRef<HTMLDivElement>(null);
  const eventIdRef = useRef(0);
  const scoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // ── Session init ───────────────────────────────────────────────────────
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
    // Seed initial event
    pushEvent("narrative", initialState.interface_usuario.narrativa_principal);
  }, []);

  // ── Event log helpers ──────────────────────────────────────────────────
  const pushEvent = (type: EventLogEntry["type"], text: string) => {
    const engine = getEngine();
    const entry: EventLogEntry = {
      id: ++eventIdRef.current,
      type,
      text,
      timestamp: engine.getFormattedTime(),
      gameMinutes: engine.getGameTimeMinutes(),
    };
    setEventLog((prev) => [...prev, entry]);
  };

  // ── Scroll to bottom on new events ─────────────────────────────────────
  useEffect(() => {
    setTimeout(() => eventLogEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [eventLog.length]);

  // ── State change effects ───────────────────────────────────────────────
  useEffect(() => {
    const currentScore = gameState.status_simulacao.current_score;
    if (currentScore !== prevScore) {
      if (scoreTimeoutRef.current) clearTimeout(scoreTimeoutRef.current);
      
      setScoreDiff(currentScore - prevScore);
      scoreTimeoutRef.current = setTimeout(() => {
        setScoreDiff(null);
        scoreTimeoutRef.current = null;
      }, 3000);
      
      setPrevScore(currentScore);
    }


    const status = gameState.status_simulacao.estado_paciente;
    if ((status === "OBITO" || status === "CURADO") && !hasSaved) {
      saveResult(currentScore);
      setTimeLeft(null);
    } else {
      const timerSeconds = gameState.status_simulacao.timer_seconds;
      if (timerSeconds && timerSeconds > 0) {
        setTimeLeft(timerSeconds);
        setMaxTime(timerSeconds);
      } else {
        setTimeLeft(null);
        setMaxTime(null);
      }
    }
  }, [gameState.interface_usuario.narrativa_principal]);

  // ── Countdown timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isLoading) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleAction("SYSTEM_TIMEOUT", "TIMEOUT", "TEMPO ESGOTADO");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isLoading]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const saveResult = async (finalScore: number) => {
    setHasSaved(true);
    const caseTitle = gameState.interface_usuario.manchete || `Caso de ${gameParams.especialidade}`;
    await saveGameResult(
      finalScore,
      gameState.status_simulacao.estado_paciente,
      gameParams.dificuldade,
      gameParams.especialidade,
      caseTitle
    );
  };

  const handleAction = async (id: string, type: string, text?: string) => {
    if (isLoading) return;
    if (type === ActionType.LIVRE && !customActionText.trim()) return;
    setIsLoading(true);
    setShowActions(false);
    setTimeLeft(null);

    const actionLabel = type === ActionType.LIVRE ? customActionText : (text || id);
    pushEvent("action", actionLabel);


    try {
      const newState = await sendAction(id, type === ActionType.LIVRE ? customActionText : undefined);
      setGameState(newState);
      setCustomActionText("");

      // Push new narrative
      pushEvent("narrative", newState.interface_usuario.narrativa_principal);
      if (newState.interface_usuario.score_feedback) {
        pushEvent("mentor", newState.interface_usuario.score_feedback);
      }

      if (sessionId) {
        updateGameSession(sessionId, newState, getConversationHistory());
      }
    } catch (error) {
      console.error("Error processing action:", error);
      pushEvent("system", "Erro ao processar ação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseDebriefing = (text: string) => {
    const sections = { resumo: "", fortes: "", melhoria: "", gold: "", pearls: "" };
    const r = text.match(/\[RESUMO\]([\s\S]*?)(\[|$)/);
    const f = text.match(/\[PONTOS FORTES\]([\s\S]*?)(\[|$)/);
    const m = text.match(/\[PONTOS DE MELHORIA\]([\s\S]*?)(\[|$)/);
    const g = text.match(/\[GOLD STANDARD\]([\s\S]*?)(\[|$)/);
    const p = text.match(/\[CLINICAL PEARLS\]([\s\S]*?)(\[|$)/);
    
    if (r) sections.resumo = r[1].trim();
    if (f) sections.fortes = f[1].trim();
    if (m) sections.melhoria = m[1].trim();
    if (g) sections.gold = g[1].trim();
    if (p) sections.pearls = p[1].trim();
    
    if (!sections.resumo && !sections.fortes) sections.resumo = text;
    return sections;
  };

  const getActionIcon = (tipo: string) => {
    switch (tipo) {
      case "EXAME": return <Microscope className="h-4 w-4" />;
      case "MEDICAMENTO": return <Pill className="h-4 w-4" />;
      default: return <Syringe className="h-4 w-4" />;
    }
  };

  const getEventIcon = (type: EventLogEntry["type"]) => {
    switch (type) {
      case "narrative": return <Stethoscope className="h-3 w-3" />;
      case "action": return <ChevronRight className="h-3 w-3" />;
      case "mentor": return <GraduationCap className="h-3 w-3" />;
      case "system": return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getEventColor = (type: EventLogEntry["type"]) => {
    switch (type) {
      case "narrative": return "text-foreground";
      case "action": return "text-primary";
      case "mentor": return "text-warning";
      case "system": return "text-destructive";
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────
  const isGameOver =
    gameState.status_simulacao.estado_paciente === "OBITO" ||
    gameState.status_simulacao.estado_paciente === "CURADO";
  const debriefing = isGameOver ? parseDebriefing(gameState.interface_usuario.feedback_mentor) : null;
  const protocolEval = isGameOver ? getLastProtocolEvaluation() : null;
  const generatedCase = getLastGeneratedCase();
  const engine = getEngine();
  const vitals = engine.getVitals();

  const patientState = gameState.status_simulacao.estado_paciente;
  const vitalStatus: "stable" | "warning" | "critical" =
    patientState === "CRITICO" || patientState === "OBITO" ? "critical" :
    patientState === "INSTAVEL" ? "warning" : "stable";

  const statusColor =
    patientState === "ESTAVEL" || patientState === "CURADO" ? "text-primary" :
    patientState === "INSTAVEL" ? "text-warning" : "text-destructive";

  const predefinedActions = gameState.opcoes_interacao.filter((opt) => opt.tipo !== "LIVRE");

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Critical Timer Bar */}
      {timeLeft !== null && maxTime !== null && !isGameOver && (
        <div className="shrink-0 z-50">
          <div className="bg-accent text-accent-foreground px-4 py-2 flex justify-between items-center animate-pulse">
            <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4" /> Decisão Crítica
            </span>
            <span className="font-bold text-lg">{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / maxTime) * 100} className="h-1 rounded-none bg-accent/20 [&>div]:bg-accent" />
        </div>
      )}

      {/* ── Fixed Header ──────────────────────────────────────────────── */}
      <header className="shrink-0 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Patient Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate leading-tight">
                {gameState.interface_usuario.manchete}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", statusColor)}>
                  {patientState}
                </span>
                {generatedCase && (
                  <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                    {generatedCase.patient.sex === "M" ? "Masculino" : "Feminino"}, {generatedCase.patient.age} anos
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls & Stats */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Simulation Time */}
            <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground tabular-nums">
                {engine.getFormattedTime()}
              </span>
            </div>

            {/* Score */}
            <div className="relative flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
              <span className="text-[10px] font-bold text-primary uppercase tracking-tight hidden xs:block">Score</span>
              <span className={cn("text-sm font-bold tabular-nums", 
                gameState.status_simulacao.current_score >= 7 ? "text-primary" :
                gameState.status_simulacao.current_score >= 5 ? "text-warning" : "text-destructive"
              )}>
                {gameState.status_simulacao.current_score.toFixed(1)}
              </span>
              <AnimatePresence>
                {scoreDiff !== null && (
                  <motion.span 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: -15 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "absolute top-0 right-0 text-[10px] font-bold whitespace-nowrap",
                      scoreDiff > 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {scoreDiff > 0 ? "+" : ""}{scoreDiff.toFixed(1)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={onRestart} title="Reiniciar">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={onExit} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* ── Vital Monitor ─────────────────────────────────────────────── */}
      {!isGameOver && (
        <div className="shrink-0 px-4 py-4 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <VitalMonitor
              fc={vitals.hr}
              pas={vitals.sbp}
              pad={vitals.dbp}
              satO2={vitals.spo2}
              fr={vitals.rr}
              status={vitalStatus}
            />
          </div>
        </div>
      )}


      {/* ── Main Content: Event Log or Debriefing ─────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {isGameOver ? (
          <GameOverScreen
            gameState={gameState}
            debriefing={debriefing}
            protocolEval={protocolEval}
            engine={engine}
            onRestart={onRestart}
            onExit={onExit}
          />
        ) : (
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
              <AnimatePresence initial={false}>
                {eventLog.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      entry.type === "action" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {entry.type !== "action" ? (
                      /* AI / System messages */
                      <div className="flex gap-3 max-w-[85%] sm:max-w-[75%]">
                        <div className={cn(
                          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 shadow-sm",
                          entry.type === "narrative" ? "bg-primary text-primary-foreground" :
                          entry.type === "mentor" ? "bg-secondary text-secondary-foreground" :
                          "bg-destructive text-destructive-foreground"
                        )}>
                          {getEventIcon(entry.type)}
                        </div>
                        <div className="space-y-1">
                          <div className={cn(
                            "rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed shadow-sm",
                            entry.type === "narrative" ? "bg-card border border-border text-foreground" :
                            entry.type === "mentor" ? "bg-secondary/10 border border-secondary/20 text-foreground italic" :
                            "bg-destructive/5 border border-destructive/20 text-destructive"
                          )}>
                            <div className="whitespace-pre-line">{renderWithTooltips(entry.text)}</div>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium ml-1">
                            {entry.timestamp}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* User actions */
                      <div className="flex flex-col items-end max-w-[80%]">
                        <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold shadow-md">
                          {entry.text}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium mt-1 mr-1">
                          {entry.timestamp}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>


              {isLoading && (
                <div className="flex gap-2">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="h-3 w-3 text-primary animate-pulse" />
                  </div>
                  <div className="bg-card border border-border rounded-lg rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={eventLogEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* ── Fixed Bottom Input ────────────────────────────────────────── */}
      {!isGameOver && (
        <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-md p-4 z-30 pb-safe">
          <div className="max-w-4xl mx-auto">
            {/* Expandable actions panel */}
            <AnimatePresence>
              {showActions && predefinedActions.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 space-y-2 max-h-56 overflow-y-auto pr-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {predefinedActions.map((opt) => (
                      <motion.button
                        key={opt.id}
                        disabled={isLoading}
                        onClick={() => handleAction(opt.id, opt.tipo, opt.texto)}
                        className={cn(
                          "p-3 rounded-xl text-left transition-all border flex items-center gap-3 group",
                          isLoading
                            ? "opacity-50 cursor-not-allowed bg-muted"
                            : "bg-card border-border hover:border-primary/50 hover:shadow-sm active:scale-[0.98]"
                        )}
                        aria-label={`Ação: ${opt.texto}`}
                      >

                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          opt.tipo === "EXAME" ? "bg-accent/10 text-accent" :
                          opt.tipo === "MEDICAMENTO" ? "bg-primary/10 text-primary" :
                          "bg-secondary/10 text-secondary"
                        )}>
                          {getActionIcon(opt.tipo)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{opt.tipo}</span>
                          <span className="font-bold text-sm text-foreground leading-tight block truncate">{opt.texto}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              {/* Toggle actions button */}
              {predefinedActions.length > 0 && (
                <Button
                  variant={showActions ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "h-12 w-12 shrink-0 rounded-xl transition-all", 
                    showActions && "shadow-lg shadow-primary/20"
                  )}
                  onClick={() => setShowActions(!showActions)}
                  aria-expanded={showActions}
                  aria-label="Ver ações recomendadas"
                >
                  <ClipboardList className="h-5 w-5" />
                </Button>
              )}

              <div className="relative flex-1">
                <Input
                  value={customActionText}
                  onChange={(e) => setCustomActionText(e.target.value)}
                  placeholder="Descreva sua conduta clínica..."
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-muted/50 border-border focus:ring-primary/20 pr-12 text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleAction("LIVRE", ActionType.LIVRE)}
                  aria-label="Entrada de conduta livre"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-10 w-10 text-primary hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  onClick={() => handleAction("LIVRE", ActionType.LIVRE)}
                  disabled={isLoading || !customActionText.trim()}
                  aria-label="Enviar conduta"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

// ── Game Over Screen ─────────────────────────────────────────────────────

interface GameOverScreenProps {
  gameState: SimulationState;
  debriefing: { resumo: string; fortes: string; melhoria: string; gold: string; pearls: string } | null;
  protocolEval: ProtocolEvaluation | null;
  engine: ReturnType<typeof getEngine>;
  onRestart: () => void;
  onExit: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  gameState, debriefing, protocolEval, engine, onRestart, onExit,
}) => {
  const isCured = gameState.status_simulacao.estado_paciente === "CURADO";

  return (
    <ScrollArea className="h-full bg-muted/20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 py-12 space-y-8 max-w-2xl mx-auto"
      >
        {/* Outcome header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-sm border",
              isCured ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
            )}
          >
            {isCured ? <CheckCircle className="h-10 w-10" /> : <Skull className="h-10 w-10" />}
          </motion.div>
          
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {isCured ? "Alta Médica" : "Óbito Confirmado"}
            </h2>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Simulação Finalizada em {engine.getFormattedTime()}
            </p>
          </div>
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-8 py-6 px-8 bg-card border border-border rounded-2xl shadow-sm w-fit mx-auto"
          >
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Score Final</span>
              <span className={cn("text-3xl font-bold tabular-nums",
                gameState.status_simulacao.current_score >= 7 ? "text-primary" :
                gameState.status_simulacao.current_score >= 5 ? "text-warning" : "text-destructive"
              )}>
                {gameState.status_simulacao.current_score.toFixed(1)}
              </span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Tempo Total</span>
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {engine.getGameTimeMinutes()} <span className="text-xs font-medium text-muted-foreground">min</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Action Timeline */}
        {engine.getActionTimeline().length > 0 && (
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-6 flex items-center gap-2 tracking-widest">
              <Clock className="h-4 w-4" /> Cronologia do Caso
            </h4>
            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {engine.getActionTimeline().map((entry, i) => {
                const h = Math.floor(entry.gameTimeMinutes / 60);
                const m = entry.gameTimeMinutes % 60;
                const ts = `${String(h).padStart(2, "0")}:${String(Math.round(m)).padStart(2, "0")}`;
                return (
                  <div key={i} className="flex items-start gap-4 relative">
                    <span className={cn(
                      "w-6 h-6 rounded-full shrink-0 flex items-center justify-center z-10 border-4 border-card", 
                      entry.isCritical ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.3)]" : "bg-border"
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-card" />
                    </span>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums opacity-70">{ts}</span>
                        {entry.isCritical && <span className="text-[9px] font-bold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded uppercase">Crítico</span>}
                      </div>
                      <p className={cn("text-sm font-medium", entry.isCritical ? "text-destructive" : "text-foreground/80")}>
                        {entry.actionText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Protocol Checklist */}
        {protocolEval && (
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
                <ClipboardList className="h-4 w-4 text-primary" /> {protocolEval.protocolName}
              </h4>
              <div className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-lg border",
                protocolEval.adherenceScore >= 8 ? "bg-success/5 text-success border-success/20" :
                protocolEval.adherenceScore >= 5 ? "bg-warning/5 text-warning border-warning/20" :
                "bg-destructive/5 text-destructive border-destructive/20"
              )}>
                Aderência: {protocolEval.adherenceScore.toFixed(1)}/10
              </div>
            </div>
            <div className="space-y-6">
              {protocolEval.results.map((r) => (
                <div key={r.itemId} className="group">
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 text-xl leading-none pt-0.5">
                      {r.status === "done" ? "✅" : r.status === "late" ? "⏱️" : "❌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={cn(
                          "font-bold text-sm",
                          r.status === "done" ? "text-foreground" :
                          r.status === "late" ? "text-warning" : "text-destructive"
                        )}>
                          {r.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                          {r.performedAt !== null && <span>Realizado: {r.performedAt}'</span>}
                          {r.targetMinutes !== null && (
                            <span className={cn(
                              "px-1.5 py-0.5 rounded bg-muted",
                              r.status === "late" || r.status === "missed" ? "text-destructive" : "text-success"
                            )}>
                              Meta: &lt;{r.targetMinutes}'
                            </span>
                          )}
                        </div>
                      </div>
                      {r.status !== "done" && (
                        <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground italic leading-relaxed">{r.reference}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debriefing sections */}
        {debriefing && (
          <div className="space-y-4">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
              <h4 className="text-[10px] font-bold text-primary uppercase mb-3 flex items-center gap-2 tracking-widest">
                <MessageSquare className="h-4 w-4" /> Feedback Acadêmico
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">{debriefing.resumo}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debriefing.fortes && (
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                  <h4 className="text-[10px] font-bold text-success uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <ThumbsUp className="h-3.5 w-3.5" /> Pontos Fortes
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{debriefing.fortes}</p>
                </div>
              )}
              {debriefing.melhoria && (
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                  <h4 className="text-[10px] font-bold text-warning uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <AlertTriangle className="h-3.5 w-3.5" /> Oportunidades
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{debriefing.melhoria}</p>
                </div>
              )}
            </div>

            {debriefing.gold && (
              <div className="bg-secondary/5 p-5 rounded-2xl border border-secondary/10 shadow-sm">
                <h4 className="text-[10px] font-bold text-secondary uppercase mb-3 flex items-center gap-2 tracking-widest">
                  <BookOpen className="h-3.5 w-3.5" /> Conduta Padrão-Ouro
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed italic">{debriefing.gold}</p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 pb-12">
          <Button onClick={onRestart} size="lg" className="flex-1 h-14 rounded-xl font-bold shadow-lg shadow-primary/10 transition-transform hover:translate-y-[-2px]">
            <RotateCcw className="mr-2 h-4 w-4" /> Nova Simulação
          </Button>
          <Button variant="outline" onClick={onExit} size="lg" className="flex-1 h-14 rounded-xl font-bold border-border hover:bg-muted transition-transform hover:translate-y-[-2px]">
            <LogOut className="mr-2 h-4 w-4" /> Finalizar Caso
          </Button>
        </div>
      </motion.div>
    </ScrollArea>
  );
};

export default GameDashboard;
