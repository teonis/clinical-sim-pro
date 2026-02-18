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
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* Critical Timer Bar */}
      {timeLeft !== null && maxTime !== null && !isGameOver && (
        <div className="shrink-0 z-50">
          <div className="bg-destructive text-destructive-foreground px-4 py-2 flex justify-between items-center animate-pulse">
            <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" /> Decisão Crítica
            </span>
            <span className="font-mono-vital text-xl font-bold">{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / maxTime) * 100} className="h-1 rounded-none [&>div]:bg-destructive" />
        </div>
      )}

      {/* ── Fixed Header ──────────────────────────────────────────────── */}
      <header className="shrink-0 bg-card border-b border-border px-3 py-2.5 z-30">
        <div className="flex items-center justify-between gap-2">
          {/* Left: logo + case name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-sm bg-primary/10 hud-border flex items-center justify-center shrink-0">
              <Stethoscope className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-display font-bold text-foreground truncate leading-tight">
                {gameState.interface_usuario.manchete}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("text-[10px] font-mono-vital font-bold uppercase", statusColor)}>
                  {patientState}
                </span>
                {generatedCase && (
                  <span className="text-[10px] text-muted-foreground font-mono-vital">
                    {generatedCase.patient.sex === "M" ? "♂" : "♀"} {generatedCase.patient.age}a
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: clock + score + actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Game Clock */}
            <div className="lcd-screen rounded-sm px-2.5 py-1 hud-border flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-primary" />
              <span className="font-mono-vital text-sm font-bold text-primary lcd-glow">
                {engine.getFormattedTime()}
              </span>
            </div>

            {/* Score */}
            <div className="lcd-screen rounded-sm px-2.5 py-1 hud-border text-center relative">
              <span className={cn("font-mono-vital text-sm font-bold", 
                gameState.status_simulacao.current_score >= 7 ? "text-primary" :
                gameState.status_simulacao.current_score >= 5 ? "text-warning" : "text-destructive"
              )}>
                {gameState.status_simulacao.current_score.toFixed(1)}
              </span>
              {scoreDiff !== null && (
                <span className={cn(
                  "absolute -bottom-3.5 right-0 text-[10px] font-bold animate-bounce",
                  scoreDiff > 0 ? "text-primary" : "text-destructive"
                )}>
                  {scoreDiff > 0 ? "+" : ""}{scoreDiff.toFixed(1)}
                </span>
              )}
            </div>

            {/* Header buttons */}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRestart} title="Reiniciar">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onExit} title="Sair">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Vital Monitor ─────────────────────────────────────────────── */}
      {!isGameOver && (
        <div className="shrink-0 px-3 py-2 bg-background">
          <VitalMonitor
            fc={vitals.hr}
            pas={vitals.sbp}
            pad={vitals.dbp}
            satO2={vitals.spo2}
            fr={vitals.rr}
            status={vitalStatus}
          />
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
            <div className="px-3 py-2 space-y-2 pb-4">
              {eventLog.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "flex gap-2 text-sm",
                    entry.type === "action" && "flex-row-reverse"
                  )}
                >
                  {entry.type !== "action" ? (
                    /* AI / System messages: left-aligned bubble */
                    <div className="flex gap-2 max-w-[90%]">
                      <div className={cn(
                        "shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5",
                        entry.type === "narrative" ? "bg-primary/10 text-primary" :
                        entry.type === "mentor" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      )}>
                        {getEventIcon(entry.type)}
                      </div>
                      <div>
                        <div className={cn(
                          "rounded-lg rounded-tl-none px-3 py-2 text-sm leading-relaxed",
                          entry.type === "narrative" ? "bg-card border border-border text-foreground" :
                          entry.type === "mentor" ? "bg-warning/5 border border-warning/20 text-foreground italic" :
                          "bg-destructive/5 border border-destructive/20 text-destructive"
                        )}>
                          <p className="whitespace-pre-line">{renderWithTooltips(entry.text)}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono-vital mt-0.5 block">
                          {entry.timestamp} ({entry.gameMinutes}min)
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* User actions: right-aligned bubble */
                    <div className="flex flex-col items-end max-w-[80%] ml-auto">
                      <div className="rounded-lg rounded-tr-none px-3 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                        {entry.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono-vital mt-0.5">
                        {entry.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              ))}

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
        <div className="shrink-0 border-t border-border bg-card p-3 z-30 safe-area-pb">
          {/* Expandable actions panel */}
          {showActions && predefinedActions.length > 0 && (
            <div className="mb-3 space-y-1.5 max-h-48 overflow-y-auto">
              {predefinedActions.map((opt) => (
                <button
                  key={opt.id}
                  disabled={isLoading}
                  onClick={() => handleAction(opt.id, opt.tipo)}
                  className={cn(
                    "w-full p-3 rounded-sm text-left transition-all border group",
                    isLoading
                      ? "opacity-50 cursor-not-allowed bg-muted"
                      : "hover:border-primary/30 active:scale-[0.99] bg-secondary border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-sm flex items-center justify-center shrink-0",
                      opt.tipo === "EXAME" ? "bg-accent text-accent-foreground" :
                      opt.tipo === "MEDICAMENTO" ? "bg-primary/10 text-primary" :
                      "bg-warning/10 text-warning"
                    )}>
                      {getActionIcon(opt.tipo)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">{opt.tipo}</span>
                      <span className="font-medium text-sm text-foreground leading-tight block truncate">{opt.texto}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Toggle actions button */}
            {predefinedActions.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                className={cn("h-10 w-10 shrink-0", showActions && "border-primary text-primary")}
                onClick={() => setShowActions(!showActions)}
              >
                <ClipboardList className="h-4 w-4" />
              </Button>
            )}

            <Input
              value={customActionText}
              onChange={(e) => setCustomActionText(e.target.value)}
              placeholder="Digite sua conduta..."
              disabled={isLoading}
              className="flex-1 bg-secondary"
              onKeyDown={(e) => e.key === "Enter" && handleAction("LIVRE", ActionType.LIVRE)}
            />
            <Button
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => handleAction("LIVRE", ActionType.LIVRE)}
              disabled={isLoading || !customActionText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
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
      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {/* Outcome header */}
        <div className="text-center">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3",
            isCured ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          )}>
            {isCured ? <CheckCircle className="h-7 w-7" /> : <Skull className="h-7 w-7" />}
          </div>
          <h2 className="text-lg font-display font-bold text-foreground">
            {isCured ? "Alta Médica" : "Óbito Confirmado"}
          </h2>
          <p className="text-xs text-muted-foreground font-mono-vital mt-1">
            Tempo total: {engine.getFormattedTime()} ({engine.getGameTimeMinutes()} min)
          </p>
          <div className="inline-flex items-center gap-3 px-5 py-1.5 bg-card border border-border rounded-sm mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nota</span>
            <span className="font-mono-vital text-xl font-bold text-primary lcd-glow">
              {gameState.status_simulacao.current_score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Action Timeline */}
        {engine.getActionTimeline().length > 0 && (
          <div className="bg-secondary p-3 rounded-sm border border-border">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Timeline
            </h4>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {engine.getActionTimeline().map((entry, i) => {
                const h = Math.floor(entry.gameTimeMinutes / 60);
                const m = entry.gameTimeMinutes % 60;
                const ts = `${String(h).padStart(2, "0")}:${String(Math.round(m)).padStart(2, "0")}`;
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-2 text-xs font-mono-vital",
                    entry.isCritical ? "text-destructive" : "text-muted-foreground"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", entry.isCritical ? "bg-destructive" : "bg-muted-foreground/40")} />
                    <span className="font-bold w-11 shrink-0">{ts}</span>
                    <span className="truncate">{entry.actionText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Protocol Checklist */}
        {protocolEval && (
          <div className="bg-card p-3 rounded-sm border border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                <ClipboardList className="h-3 w-3 text-primary" /> {protocolEval.protocolName}
              </h4>
              <span className={cn(
                "text-xs font-mono-vital font-bold px-2 py-0.5 rounded-sm",
                protocolEval.adherenceScore >= 8 ? "bg-primary/10 text-primary" :
                protocolEval.adherenceScore >= 5 ? "bg-warning/10 text-warning" :
                "bg-destructive/10 text-destructive"
              )}>
                {protocolEval.adherenceScore.toFixed(1)}/10
              </span>
            </div>
            <div className="space-y-1.5">
              {protocolEval.results.map((r) => (
                <div key={r.itemId} className="text-xs">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">
                      {r.status === "done" ? "✅" : r.status === "late" ? "⏱️" : "❌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "font-semibold",
                        r.status === "done" ? "text-primary" :
                        r.status === "late" ? "text-warning" : "text-destructive"
                      )}>
                        {r.label}
                      </span>
                      {r.performedAt !== null && (
                        <span className="text-muted-foreground ml-1">
                          — {r.performedAt}min
                          {r.targetMinutes !== null && (
                            <span className={r.performedAt > r.targetMinutes ? "text-destructive" : "text-primary"}>
                              {" "}(meta: &lt;{r.targetMinutes}min)
                            </span>
                          )}
                        </span>
                      )}
                      {r.status === "missed" && r.targetMinutes !== null && (
                        <span className="text-destructive ml-1">— meta: &lt;{r.targetMinutes}min</span>
                      )}
                    </div>
                  </div>
                  {r.status !== "done" && (
                    <div className="ml-6 mt-0.5 text-muted-foreground italic flex items-start gap-1">
                      <BookOpen className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{r.reference}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debriefing sections */}
        {debriefing && (
          <div className="space-y-3">
            <div className="bg-secondary p-3 rounded-sm border border-border">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 flex items-center gap-2">
                <ClipboardList className="h-3 w-3" /> Resumo
              </h4>
              <p className="text-sm text-foreground leading-relaxed">{debriefing.resumo}</p>
            </div>
            {debriefing.fortes && (
              <div className="bg-primary/5 p-3 rounded-sm border border-primary/10">
                <h4 className="text-[10px] font-bold text-primary uppercase mb-1.5 flex items-center gap-2">
                  <ThumbsUp className="h-3 w-3" /> Pontos Fortes
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{debriefing.fortes}</p>
              </div>
            )}
            {debriefing.melhoria && (
              <div className="bg-warning/5 p-3 rounded-sm border border-warning/10">
                <h4 className="text-[10px] font-bold text-warning uppercase mb-1.5 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" /> Atenção
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{debriefing.melhoria}</p>
              </div>
            )}
            {debriefing.gold && (
              <div className="bg-accent p-3 rounded-sm border border-border">
                <h4 className="text-[10px] font-bold text-accent-foreground uppercase mb-1.5 flex items-center gap-2">
                  <BookOpen className="h-3 w-3" /> Gold Standard
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{debriefing.gold}</p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-3 pt-2 pb-4">
          <Button onClick={onRestart} className="flex-1">Novo Caso</Button>
          <Button variant="outline" onClick={onExit} className="flex-1">Menu</Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default GameDashboard;
