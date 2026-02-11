import React, { useState, useEffect, useRef } from "react";
import { SimulationState, ActionType, StartParams } from "@/types/simulation";
import { sendAction, getConversationHistory } from "@/services/simulationService";
import { saveGameResult } from "@/services/gameService";
import { createGameSession, updateGameSession } from "@/services/sessionService";
import { renderWithTooltips } from "@/components/MedicalTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  RotateCcw,
  LogOut,
  Clock,
  Microscope,
  Pill,
  Syringe,
  FileText,
  Stethoscope,
  GraduationCap,
  ThumbsUp,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Skull,
  CheckCircle,
} from "lucide-react";

interface GameDashboardProps {
  initialState: SimulationState;
  onRestart: () => void;
  onExit: () => void;
  gameParams: StartParams;
}

const GameDashboard: React.FC<GameDashboardProps> = ({
  initialState,
  onRestart,
  onExit,
  gameParams,
}) => {
  const [gameState, setGameState] = useState<SimulationState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [customActionText, setCustomActionText] = useState("");
  const [activeTab, setActiveTab] = useState<"prontuario" | "conduta">("prontuario");
  const [showMentor, setShowMentor] = useState(false);
  const narrativeEndRef = useRef<HTMLDivElement>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [prevScore, setPrevScore] = useState(10.0);
  const [scoreDiff, setScoreDiff] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Create session on mount
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
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ESTAVEL": return "bg-primary/10 text-primary border-primary/20";
      case "INSTAVEL": return "bg-warning/10 text-warning border-warning/20";
      case "CRITICO": return "bg-destructive/10 text-destructive border-destructive/20 animate-pulse";
      case "OBITO": return "bg-muted text-muted-foreground border-border";
      case "CURADO": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return "text-primary";
    if (score >= 7.0) return "text-blue-600";
    if (score >= 5.0) return "text-warning";
    return "text-destructive";
  };

  const getActionIcon = (tipo: string) => {
    switch (tipo) {
      case "EXAME": return <Microscope className="h-4 w-4" />;
      case "MEDICAMENTO": return <Pill className="h-4 w-4" />;
      default: return <Syringe className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    setTimeout(() => narrativeEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    setShowMentor(false);
    if (window.innerWidth < 768) setActiveTab("prontuario");

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
    if (window.innerWidth < 768) setActiveTab("prontuario");
    setTimeLeft(null);
    try {
      const newState = await sendAction(id, type === ActionType.LIVRE ? customActionText : undefined);
      setGameState(newState);
      setCustomActionText("");
      // Persist session update
      if (sessionId) {
        updateGameSession(sessionId, newState, getConversationHistory());
      }
    } catch (error) {
      console.error("Error processing action:", error);
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

  const isGameOver =
    gameState.status_simulacao.estado_paciente === "OBITO" ||
    gameState.status_simulacao.estado_paciente === "CURADO";
  const debriefing = isGameOver ? parseDebriefing(gameState.interface_usuario.feedback_mentor) : null;

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden relative">
      {/* Critical Timer */}
      {timeLeft !== null && maxTime !== null && !isGameOver && (
        <div className="absolute top-0 left-0 w-full z-50">
          <div className="bg-destructive text-destructive-foreground px-4 py-2 flex justify-between items-center shadow-md animate-pulse">
            <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" /> Decisão Crítica Necessária
            </span>
            <span className="font-mono-vital text-xl font-bold">{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / maxTime) * 100} className="h-1.5 rounded-none [&>div]:bg-destructive" />
        </div>
      )}

      {/* Header */}
      <header className={cn("shrink-0 bg-card border-b border-border px-4 py-3 shadow-sm z-30", timeLeft !== null && "mt-[50px]")}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <Stethoscope className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display font-bold text-sm hidden sm:inline gradient-brand-text">
                SIMULAMED
              </span>
            </div>
            <div className={cn("px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide flex items-center gap-2", getStatusColor(gameState.status_simulacao.estado_paciente))}>
              <div className={cn("w-2 h-2 rounded-full", gameState.status_simulacao.estado_paciente === "CRITICO" ? "bg-destructive animate-ping" : "bg-current")} />
              {gameState.status_simulacao.estado_paciente}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase hidden sm:inline text-right leading-tight">
                Nota<br />Atual
              </span>
              <div className="relative bg-secondary rounded-lg px-4 py-1.5 min-w-[100px] text-center border border-border">
                <span className={cn("font-mono-vital text-xl font-bold", getScoreColor(gameState.status_simulacao.current_score))}>
                  {gameState.status_simulacao.current_score.toFixed(1)}
                </span>
                {scoreDiff !== null && (
                  <span className={cn("absolute -bottom-4 right-0 text-xs font-bold animate-bounce", scoreDiff > 0 ? "text-primary" : "text-destructive")}>
                    {scoreDiff > 0 ? "+" : ""}{scoreDiff.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <Button variant="ghost" size="icon" onClick={onRestart} title="Reiniciar">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onExit} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Column: Narrative */}
        <div className={cn("flex-1 flex flex-col min-w-0 bg-card md:bg-transparent", activeTab === "prontuario" ? "flex absolute inset-0 md:static z-10" : "hidden md:flex")}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 md:pr-2">
            <div className="bg-card border-l-4 border-primary shadow-sm p-4 rounded-r-lg">
              <h2 className="text-lg font-bold text-foreground leading-tight">{gameState.interface_usuario.manchete}</h2>
              <span className="text-xs text-primary font-bold uppercase mt-1 block tracking-wide">Evolução Clínica Atual</span>
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed bg-card p-6 rounded-2xl shadow-sm border border-border">
              <p className="whitespace-pre-line">{renderWithTooltips(gameState.interface_usuario.narrativa_principal)}</p>
            </div>

            {gameState.interface_usuario.score_feedback && !isGameOver && (
              <div className="flex items-start gap-2 bg-secondary p-3 rounded-lg border border-border text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-bold text-muted-foreground text-xs uppercase block">Avaliação do Preceptor</span>
                  <span className="text-foreground italic">{gameState.interface_usuario.score_feedback}</span>
                </div>
              </div>
            )}

            {!isGameOver && gameState.interface_usuario.feedback_mentor && (
              <div className="mt-4">
                {!showMentor ? (
                  <button onClick={() => setShowMentor(true)} className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wide hover:text-primary/80 transition-colors py-2">
                    <Stethoscope className="h-4 w-4" /> Ver Comentário do Preceptor
                  </button>
                ) : (
                  <div className="bg-accent border border-border rounded-xl p-4 relative animate-in fade-in">
                    <button onClick={() => setShowMentor(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">✕</button>
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground uppercase mb-1">Nota do Preceptor</h4>
                        <p className="text-sm text-foreground italic">"{gameState.interface_usuario.feedback_mentor}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={narrativeEndRef} className="h-4" />
          </div>

          {/* Vital Signs Monitor */}
          <div className="bg-card border-t border-border p-4 shadow-sm z-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[hsl(var(--vital-bg))] rounded-xl p-3 shadow-inner relative overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-[hsl(var(--vital-foreground))] uppercase flex items-center gap-1.5">
                    <Stethoscope className="h-3 w-3 animate-pulse" /> Monitor
                  </span>
                </div>
                <div className="font-mono-vital text-[hsl(var(--vital-foreground))] text-sm whitespace-pre-wrap leading-relaxed">
                  {renderWithTooltips(gameState.dados_medicos.sinais_vitais)}
                </div>
              </div>
              <div className="bg-secondary border border-border rounded-xl p-3 flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> Laboratório / Imagem
                </span>
                <div className="flex-1 overflow-y-auto max-h-24">
                  <div className="font-mono-vital text-foreground text-xs whitespace-pre-wrap leading-relaxed">
                    {gameState.dados_medicos.exames_resultados === "Nenhum exame solicitado" ? (
                      <span className="text-muted-foreground italic">Nenhum resultado pendente.</span>
                    ) : (
                      renderWithTooltips(gameState.dados_medicos.exames_resultados)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className={cn("md:w-[400px] lg:w-[450px] flex-col bg-secondary border-l border-border shadow-xl z-20", activeTab === "conduta" ? "flex absolute inset-0 md:static z-20" : "hidden md:flex")}>
          <div className="h-48 sm:h-56 bg-muted relative shrink-0 overflow-hidden border-b border-border">
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <div>
                <Stethoscope className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-xs font-medium">{gameState.visualizacao.descricao_cenario_pt}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/50">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="h-3 w-3 text-primary" /> {isGameOver ? "Relatório Final" : "Condutas Disponíveis"}
              </h3>
            </div>

            {isGameOver ? (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center mb-6">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-md", gameState.status_simulacao.estado_paciente === "CURADO" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    {gameState.status_simulacao.estado_paciente === "CURADO" ? <CheckCircle className="h-8 w-8" /> : <Skull className="h-8 w-8" />}
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {gameState.status_simulacao.estado_paciente === "CURADO" ? "Alta Médica" : "Óbito Confirmado"}
                  </h2>
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-foreground text-background rounded-full mt-2 shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">Nota Final</span>
                    <span className="font-mono-vital text-2xl font-bold text-primary">{gameState.status_simulacao.current_score.toFixed(1)}</span>
                  </div>
                </div>
                {debriefing && (
                  <div className="space-y-4 mb-8">
                    <div className="bg-secondary p-4 rounded-xl border border-border">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2"><ClipboardList className="h-3 w-3" /> Resumo do Caso</h4>
                      <p className="text-sm text-foreground leading-relaxed">{debriefing.resumo}</p>
                    </div>
                    {debriefing.fortes && (
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <h4 className="text-xs font-bold text-primary uppercase mb-2 flex items-center gap-2"><ThumbsUp className="h-3 w-3" /> Pontos Fortes</h4>
                        <p className="text-sm text-foreground leading-relaxed">{debriefing.fortes}</p>
                      </div>
                    )}
                    {debriefing.melhoria && (
                      <div className="bg-warning/5 p-4 rounded-xl border border-warning/10">
                        <h4 className="text-xs font-bold text-warning uppercase mb-2 flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> Pontos de Atenção</h4>
                        <p className="text-sm text-foreground leading-relaxed">{debriefing.melhoria}</p>
                      </div>
                    )}
                    {debriefing.gold && (
                      <div className="bg-accent p-4 rounded-xl border border-border">
                        <h4 className="text-xs font-bold text-accent-foreground uppercase mb-2 flex items-center gap-2"><BookOpen className="h-3 w-3" /> Gold Standard</h4>
                        <p className="text-sm text-foreground leading-relaxed">{debriefing.gold}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-3 w-full">
                  <Button onClick={onRestart} className="flex-1">Novo Caso</Button>
                  <Button variant="outline" onClick={onExit} className="flex-1">Menu</Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {gameState.opcoes_interacao
                    .filter((opt) => opt.tipo !== "LIVRE")
                    .map((opt) => (
                      <button
                        key={opt.id}
                        disabled={isLoading}
                        onClick={() => handleAction(opt.id, opt.tipo)}
                        className={cn(
                          "w-full p-4 rounded-xl text-left transition-all border group relative",
                          isLoading ? "opacity-50 cursor-not-allowed bg-muted" : "hover:border-primary/30 hover:shadow-md active:scale-[0.99] bg-card border-border"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0",
                            opt.tipo === "EXAME" ? "bg-blue-50 text-blue-600" :
                            opt.tipo === "MEDICAMENTO" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                          )}>
                            {getActionIcon(opt.tipo)}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">{opt.tipo}</span>
                            <span className="font-semibold text-sm text-foreground leading-tight block">{opt.texto}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
                <div className="p-4 bg-secondary border-t border-border">
                  <label className="block text-[10px] text-muted-foreground mb-2 uppercase font-bold tracking-wider">Outra Conduta</label>
                  <div className="flex gap-2">
                    <Input
                      value={customActionText}
                      onChange={(e) => setCustomActionText(e.target.value)}
                      placeholder="Digite sua ação..."
                      disabled={isLoading}
                      onKeyDown={(e) => e.key === "Enter" && handleAction("LIVRE", ActionType.LIVRE)}
                    />
                    <Button
                      onClick={() => handleAction("LIVRE", ActionType.LIVRE)}
                      disabled={isLoading || !customActionText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden shrink-0 bg-card border-t border-border flex justify-around p-2 z-40 safe-area-pb shadow-sm">
        <button onClick={() => setActiveTab("prontuario")} className={cn("flex flex-col items-center gap-1 p-2 rounded-lg w-1/2", activeTab === "prontuario" ? "text-primary bg-primary/10" : "text-muted-foreground")}>
          <FileText className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase">Prontuário</span>
        </button>
        <div className="w-px bg-border h-8 mx-2 self-center" />
        <button onClick={() => setActiveTab("conduta")} className={cn("flex flex-col items-center gap-1 p-2 rounded-lg w-1/2", activeTab === "conduta" ? "text-primary bg-primary/10" : "text-muted-foreground")}>
          <Stethoscope className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase">Conduta</span>
        </button>
      </div>
    </div>
  );
};

export default GameDashboard;
