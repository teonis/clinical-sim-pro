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
      const actionPayload = type === ActionType.LIVRE ? customActionText : undefined;
      const enrichedAction = diagnosticHypothesis.trim() 
        ? `[IMPRESSÃO CLÍNICA DO ALUNO: ${diagnosticHypothesis}]\n${actionPayload || actionLabel}`
        : actionPayload;

      const newState = await sendAction(id, enrichedAction);
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
    <div className="flex flex-col h-[100dvh] bg-[#050505] text-foreground overflow-hidden transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
      />

      {/* Critical Timer Bar */}
      {timeLeft !== null && maxTime !== null && !isGameOver && (
        <div className="shrink-0 z-50">
          <div className="bg-destructive text-destructive-foreground px-6 py-2.5 flex justify-between items-center animate-pulse shadow-lg">
            <span className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" /> Decisão Crítica em Curso
            </span>
            <span className="font-black text-2xl tabular-nums">{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / maxTime) * 100} className="h-1.5 rounded-none bg-destructive/20 [&>div]:bg-destructive transition-all duration-1000" />
        </div>
      )}

      {/* ── Enhanced Header ──────────────────────────────────────────────── */}
      <header className="shrink-0 bg-black/40 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-4 z-30 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-6">
          {/* Left: Patient Info */}
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-black text-white truncate leading-none tracking-tight">
                  {gameState.interface_usuario.manchete}
                </h1>
                <Badge variant="outline" className={cn("border-2 font-black text-[10px] px-2 py-0 uppercase tracking-widest", 
                  patientState === "CRITICO" ? "border-destructive text-destructive animate-pulse" : 
                  patientState === "INSTAVEL" ? "border-warning text-warning" : "border-primary text-primary"
                )}>
                  {patientState}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {generatedCase && (
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    {generatedCase.patient.sex === "M" ? "Masculino" : "Feminino"} • {generatedCase.patient.age} anos
                  </span>
                )}
                <div className="flex items-center gap-1.5 ml-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Telemetry: Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls & Stats */}
          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
            {/* ABCD Status - Immersion */}
            <div className="hidden xl:flex items-center gap-2">
              {['A', 'B', 'C', 'D'].map((letter) => (
                <TooltipProvider key={letter}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all cursor-help",
                        patientState === "CRITICO" || patientState === "OBITO" ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse" :
                        patientState === "INSTAVEL" ? "bg-warning/10 text-warning border-warning/30" :
                        "bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                      )}>
                        {letter}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px] font-black uppercase tracking-widest p-2 bg-black border-white/10">
                      {letter === 'A' ? 'Via Aérea' : letter === 'B' ? 'Respiração' : letter === 'C' ? 'Circulação' : 'Neurológico'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Simulation Time */}
              <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-black text-white tabular-nums tracking-widest">
                  {engine.getFormattedTime()}
                </span>
              </div>

              {/* Score - Premium Look */}
              <div className="relative group">
                <div className="flex items-center gap-3 bg-primary/10 px-5 py-2.5 rounded-xl border-2 border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hidden md:block">Score</span>
                  <span className={cn("text-xl font-black tabular-nums tracking-tighter", 
                    gameState.status_simulacao.current_score >= 7 ? "text-primary" :
                    gameState.status_simulacao.current_score >= 5 ? "text-warning" : "text-destructive"
                  )}>
                    {gameState.status_simulacao.current_score.toFixed(1)}
                  </span>
                </div>
                <AnimatePresence>
                  {scoreDiff !== null && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, y: 0 }}
                      animate={{ opacity: 1, scale: 1, y: -40 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className={cn(
                        "absolute top-0 right-0 font-black text-sm drop-shadow-lg",
                        scoreDiff > 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {scoreDiff > 0 ? "+" : ""}{scoreDiff.toFixed(1)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="h-10 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl" onClick={onRestart} title="Reiniciar">
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={onExit} title="Sair">
                <LogOut className="h-5 w-5" />
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


      <div className="flex-1 overflow-hidden flex flex-col">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 border-b border-border bg-card/50">
              <TabsList className="h-12 w-full max-w-md mx-auto bg-transparent gap-4">
                <TabsTrigger value="narrative" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold text-xs uppercase tracking-widest gap-2">
                  <MessageSquare className="h-3.5 w-3.5" /> Prontuário
                </TabsTrigger>
                <TabsTrigger value="exam" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold text-xs uppercase tracking-widest gap-2">
                  <Stethoscope className="h-3.5 w-3.5" /> Exame Físico
                </TabsTrigger>
                <TabsTrigger value="labs" className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-bold text-xs uppercase tracking-widest gap-2">
                  <Activity className="h-3.5 w-3.5" /> Exames
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="narrative" className="flex-1 overflow-hidden m-0 p-0">
              <ScrollArea className="h-full">
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
                  {/* Preceptor Hint */}
                  <AnimatePresence>
                    {gameState.interface_usuario.dicas_preceptor && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex gap-3 items-start shadow-sm"
                      >
                        <GraduationCap className="h-5 w-5 text-warning shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-warning uppercase tracking-widest mb-1">Dica do Preceptor</p>
                          <p className="text-sm text-foreground/80 leading-relaxed italic">{gameState.interface_usuario.dicas_preceptor}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                  <div ref={eventLogEndRef} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="exam" className="flex-1 overflow-hidden m-0 p-0">
              <ScrollArea className="h-full">
                <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Exame Físico</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Achados Clínicos Detalhados</p>
                    </div>
                  </div>
                  
                  <Card className="border-border shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                      {gameState.interface_usuario.exame_fisico_detalhado ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                            {gameState.interface_usuario.exame_fisico_detalhado}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-3">
                          <Stethoscope className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                          <p className="text-sm text-muted-foreground italic">Realize uma inspeção para ver detalhes.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="labs" className="flex-1 overflow-hidden m-0 p-0">
              <ScrollArea className="h-full">
                <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Microscope className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Laboratório & Imagem</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Resultados de Exames Solicitados</p>
                    </div>
                  </div>
                  
                  <Card className="border-border shadow-sm">
                    <CardContent className="p-6">
                      {gameState.interface_usuario.achados_exames_detalhados ? (
                        <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs leading-relaxed border border-border">
                          <p className="whitespace-pre-line">{gameState.interface_usuario.achados_exames_detalhados}</p>
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-3">
                          <Microscope className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                          <p className="text-sm text-muted-foreground italic">Solicite exames para visualizar os resultados aqui.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
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

            {/* Diagnostic Hypothesis Input */}
            <div className="relative group mb-3">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none transition-opacity group-focus-within:opacity-50">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Impressão Clínica:</span>
              </div>
              <Input 
                value={diagnosticHypothesis}
                onChange={(e) => setDiagnosticHypothesis(e.target.value)}
                className="bg-muted/30 border-dashed border-border/50 h-9 pl-32 text-xs font-medium focus:bg-background focus:border-primary/30 rounded-lg"
                placeholder="Sua principal suspeita..."
              />
            </div>

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
                      <div className="bg-muted/30 rounded-xl p-3 border border-border/50 space-y-2">
                        <div className="flex items-start gap-2">
                          <Zap className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                            <span className="font-bold">Racional:</span> {r.rationale}
                          </p>
                        </div>
                        <div className="flex items-start gap-2 pt-1 border-t border-border/30">
                          <BookOpen className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-[10px] text-muted-foreground italic leading-relaxed">{r.reference}</p>
                        </div>
                      </div>
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
            {debriefing.pearls && (
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 shadow-sm">
                <h4 className="text-[10px] font-bold text-primary uppercase mb-3 flex items-center gap-2 tracking-widest">
                  <GraduationCap className="h-4 w-4" /> Pérolas Clínicas
                </h4>
                <div className="space-y-3">
                  {debriefing.pearls.split("\n").filter(p => p.trim()).map((pearl, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-sm text-foreground/80 leading-relaxed italic">{pearl.replace(/^[•\-\d.]+\s*/, "")}</p>
                    </div>
                  ))}
                </div>
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
