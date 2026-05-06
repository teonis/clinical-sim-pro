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
} from "lucide-react";


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
  const eventLogEndRef = useRef<HTMLDivElement>(null);
  const eventIdRef = useRef(0);

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
      setScoreDiff(currentScore - prevScore);
      setTimeout(() => setScoreDiff(null), 3000);
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
          handleAction("SYSTEM_TIMEOUT", "TIMEOUT");
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

  const handleAction = async (id: string, type: string) => {
    if (isLoading) return;
    if (type === ActionType.LIVRE && !customActionText.trim()) return;
    setIsLoading(true);
    setShowActions(false);
    setTimeLeft(null);

    const actionLabel = type === ActionType.LIVRE ? customActionText : id;
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
    const sections = { resumo: "", fortes: "", melhoria: "", gold: "" };
    const r = text.match(/\[RESUMO\]([\s\S]*?)(\[|$)/);
    const f = text.match(/\[PONTOS FORTES\]([\s\S]*?)(\[|$)/);
    const m = text.match(/\[PONTOS DE MELHORIA\]([\s\S]*?)(\[|$)/);
    const g = text.match(/\[GOLD STANDARD\]([\s\S]*?)(\[|$)/);
    if (r) sections.resumo = r[1].trim();
    if (f) sections.fortes = f[1].trim();
    if (m) sections.melhoria = m[1].trim();
    if (g) sections.gold = g[1].trim();
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
            <div className="px-3 py-2 space-y-3 pb-4">
              <AnimatePresence initial={false}>
                {eventLog.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "flex gap-2 text-sm",
                      entry.type === "action" && "flex-row-reverse"
                    )}
                  >
                    {entry.type !== "action" ? (
                      /* AI / System messages: left-aligned bubble */
                      <div className="flex gap-2 max-w-[90%]">
                        <div className={cn(
                          "shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1",
                          entry.type === "narrative" ? "bg-primary/10 text-primary border border-primary/20" :
                          entry.type === "mentor" ? "bg-warning/10 text-warning border border-warning/20" :
                          "bg-destructive/10 text-destructive border border-destructive/20"
                        )}>
                          {getEventIcon(entry.type)}
                        </div>
                        <div>
                          <div className={cn(
                            "rounded-2xl rounded-tl-none px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm shadow-sm",
                            entry.type === "narrative" ? "bg-card/80 border border-border/50 text-foreground" :
                            entry.type === "mentor" ? "bg-warning/5 border border-warning/20 text-foreground italic" :
                            "bg-destructive/5 border border-destructive/20 text-destructive"
                          )}>
                            <div className="whitespace-pre-line">{renderWithTooltips(entry.text)}</div>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono-vital mt-1 ml-1 block opacity-70">
                            {entry.timestamp} ({entry.gameMinutes}min)
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* User actions: right-aligned bubble */
                      <div className="flex flex-col items-end max-w-[80%] ml-auto">
                        <div className="rounded-2xl rounded-tr-none px-4 py-2 bg-primary/20 border border-primary/30 text-primary text-sm font-semibold shadow-sm backdrop-blur-sm">
                          {entry.text}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono-vital mt-1 mr-1 block opacity-70">
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
        <div className="shrink-0 border-t border-border bg-card/50 backdrop-blur-md p-3 z-30 safe-area-pb">
          {/* Expandable actions panel */}
          <AnimatePresence>
            {showActions && predefinedActions.length > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 space-y-1.5 max-h-48 overflow-y-auto overflow-x-hidden scrollbar-none"
              >
                {predefinedActions.map((opt) => (
                  <motion.button
                    key={opt.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    disabled={isLoading}
                    onClick={() => handleAction(opt.id, opt.tipo)}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all border group",
                      isLoading
                        ? "opacity-50 cursor-not-allowed bg-muted"
                        : "hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98] bg-secondary border-border/50"
                    )}
                    aria-label={`Ação: ${opt.texto}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner",
                        opt.tipo === "EXAME" ? "bg-accent/20 text-accent-foreground" :
                        opt.tipo === "MEDICAMENTO" ? "bg-primary/10 text-primary" :
                        "bg-warning/10 text-warning"
                      )}>
                        {getActionIcon(opt.tipo)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight block">{opt.tipo}</span>
                        <span className="font-semibold text-sm text-foreground leading-tight block truncate">{opt.texto}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            {/* Toggle actions button */}
            {predefinedActions.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-11 w-11 shrink-0 rounded-xl transition-all border-border/50", 
                  showActions && "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,255,148,0.2)]"
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
                placeholder="O que você quer fazer agora?..."
                disabled={isLoading}
                className="h-11 rounded-xl bg-secondary border-border/50 pr-10 focus-visible:ring-primary/30"
                onKeyDown={(e) => e.key === "Enter" && handleAction("LIVRE", ActionType.LIVRE)}
                aria-label="Entrada de conduta livre"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1 h-9 w-9 text-primary hover:bg-primary/10 hover:text-primary rounded-lg"
                onClick={() => handleAction("LIVRE", ActionType.LIVRE)}
                disabled={isLoading || !customActionText.trim()}
                aria-label="Enviar conduta"
              >
                <Send className="h-4 w-4" />
              </Button>
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
  debriefing: { resumo: string; fortes: string; melhoria: string; gold: string } | null;
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
    <ScrollArea className="h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-8 space-y-6 max-w-lg mx-auto"
      >
        {/* Outcome header */}
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg",
              isCured ? "bg-primary/20 text-primary border border-primary/30" : "bg-destructive/20 text-destructive border border-destructive/30"
            )}
          >
            {isCured ? <CheckCircle className="h-10 w-10" /> : <Skull className="h-10 w-10" />}
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-display font-black text-foreground tracking-tight"
          >
            {isCured ? "ALTA MÉDICA" : "ÓBITO CONFIRMADO"}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground font-mono-vital mt-1 uppercase tracking-widest"
          >
            Simulação Finalizada em {engine.getFormattedTime()}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-4 px-6 py-2.5 bg-card border border-border/50 rounded-2xl mt-5 shadow-sm"
          >
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Desempenho</span>
              <span className="font-mono-vital text-3xl font-black text-primary lcd-glow leading-none">
                {gameState.status_simulacao.current_score.toFixed(1)}
              </span>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Tempo Total</span>
              <span className="font-mono-vital text-lg font-bold text-foreground leading-none">
                {engine.getGameTimeMinutes()} min
              </span>
            </div>
          </motion.div>
        </div>

        {/* Action Timeline */}
        {engine.getActionTimeline().length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-secondary/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50"
          >
            <h4 className="text-[10px] font-black text-muted-foreground uppercase mb-3 flex items-center gap-2 tracking-widest">
              <Clock className="h-3 w-3" /> Cronologia de Eventos
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
              {engine.getActionTimeline().map((entry, i) => {
                const h = Math.floor(entry.gameTimeMinutes / 60);
                const m = entry.gameTimeMinutes % 60;
                const ts = `${String(h).padStart(2, "0")}:${String(Math.round(m)).padStart(2, "0")}`;
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-3 text-xs font-mono-vital group",
                    entry.isCritical ? "text-destructive" : "text-muted-foreground"
                  )}>
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0 shadow-sm", 
                      entry.isCritical ? "bg-destructive animate-pulse" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50 transition-colors"
                    )} />
                    <span className="font-bold w-12 shrink-0 opacity-80">{ts}</span>
                    <span className="truncate group-hover:text-foreground transition-colors">{entry.actionText}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Protocol Checklist */}
        {protocolEval && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card p-4 rounded-2xl border border-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
                <ClipboardList className="h-3 w-3 text-primary" /> {protocolEval.protocolName}
              </h4>
              <div className={cn(
                "text-xs font-mono-vital font-black px-3 py-1 rounded-lg shadow-inner",
                protocolEval.adherenceScore >= 8 ? "bg-primary/10 text-primary" :
                protocolEval.adherenceScore >= 5 ? "bg-warning/10 text-warning" :
                "bg-destructive/10 text-destructive"
              )}>
                {protocolEval.adherenceScore.toFixed(1)}/10
              </div>
            </div>
            <div className="space-y-3">
              {protocolEval.results.map((r) => (
                <div key={r.itemId} className="text-xs group">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 text-base leading-none">
                      {r.status === "done" ? "✅" : r.status === "late" ? "⏱️" : "❌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "font-bold text-sm",
                          r.status === "done" ? "text-primary" :
                          r.status === "late" ? "text-warning" : "text-destructive"
                        )}>
                          {r.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono-vital text-[10px] text-muted-foreground">
                        {r.performedAt !== null && (
                          <span>Realizado: {r.performedAt}min</span>
                        )}
                        {r.targetMinutes !== null && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-md",
                            r.status === "late" || r.status === "missed" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                          )}>
                            Meta: &lt;{r.targetMinutes}min
                          </span>
                        )}
                      </div>
                      {r.status !== "done" && (
                        <div className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-border/50 pl-2 py-0.5">
                          <div className="flex items-start gap-1.5">
                            <BookOpen className="h-3 w-3 shrink-0 mt-0.5 opacity-50" />
                            <span>{r.reference}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Debriefing sections */}
        {debriefing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div className="bg-secondary/40 p-4 rounded-2xl border border-border/50">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase mb-2 flex items-center gap-2 tracking-widest">
                <MessageSquare className="h-3 w-3" /> Feedback do Mentor
              </h4>
              <p className="text-sm text-foreground leading-relaxed font-medium">{debriefing.resumo}</p>
            </div>
            
            {(debriefing.fortes || debriefing.melhoria) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {debriefing.fortes && (
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 shadow-sm">
                    <h4 className="text-[10px] font-black text-primary uppercase mb-2 flex items-center gap-2 tracking-widest">
                      <ThumbsUp className="h-3 w-3" /> Pontos Fortes
                    </h4>
                    <p className="text-xs text-foreground/90 leading-relaxed">{debriefing.fortes}</p>
                  </div>
                )}
                {debriefing.melhoria && (
                  <div className="bg-warning/5 p-4 rounded-2xl border border-warning/20 shadow-sm">
                    <h4 className="text-[10px] font-black text-warning uppercase mb-2 flex items-center gap-2 tracking-widest">
                      <AlertTriangle className="h-3 w-3" /> Para Melhorar
                    </h4>
                    <p className="text-xs text-foreground/90 leading-relaxed">{debriefing.melhoria}</p>
                  </div>
                )}
              </div>
            )}

            {debriefing.gold && (
              <div className="bg-accent/10 p-4 rounded-2xl border border-border shadow-sm">
                <h4 className="text-[10px] font-black text-accent-foreground uppercase mb-2 flex items-center gap-2 tracking-widest">
                  <BookOpen className="h-3 w-3" /> Conduta Padrão-Ouro
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed italic">{debriefing.gold}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 pt-4 pb-8"
        >
          <Button onClick={onRestart} className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <RotateCcw className="mr-2 h-4 w-4" /> Novo Caso
          </Button>
          <Button variant="outline" onClick={onExit} className="flex-1 h-12 rounded-xl font-bold border-border/50 hover:bg-secondary transition-all hover:scale-[1.02] active:scale-[0.98]">
            <LogOut className="mr-2 h-4 w-4" /> Finalizar
          </Button>
        </motion.div>
      </motion.div>
    </ScrollArea>
  );

};

export default GameDashboard;
