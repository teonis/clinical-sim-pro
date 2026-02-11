import React from "react";
import { GameSession } from "@/services/sessionService";
import { SimulationState } from "@/types/simulation";
import { renderWithTooltips } from "@/components/MedicalTooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle, Skull, Stethoscope, GraduationCap,
  Clock, FileText, ClipboardList, ThumbsUp, AlertTriangle, BookOpen,
} from "lucide-react";

interface SessionReviewProps {
  session: GameSession;
  onBack: () => void;
}

const SessionReview: React.FC<SessionReviewProps> = ({ session, onBack }) => {
  const lastState = session.last_state as SimulationState | null;
  const isFinished = session.status === "CURADO" || session.status === "OBITO";

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

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{session.case_title}</h1>
          <p className="text-muted-foreground text-sm">
            {session.specialty} · {session.difficulty} · {new Date(session.started_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Status card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-md",
          session.status === "CURADO" ? "bg-primary/10 text-primary" :
          session.status === "OBITO" ? "bg-destructive/10 text-destructive" :
          "bg-warning/10 text-warning"
        )}>
          {session.status === "CURADO" ? <CheckCircle className="h-7 w-7" /> :
           session.status === "OBITO" ? <Skull className="h-7 w-7" /> :
           <Clock className="h-7 w-7" />}
        </div>
        <div className="text-center sm:text-left flex-1">
          <span className={cn(
            "text-xs font-bold uppercase px-3 py-1 rounded-full",
            session.status === "CURADO" ? "bg-primary/10 text-primary" :
            session.status === "OBITO" ? "bg-destructive/10 text-destructive" :
            "bg-warning/10 text-warning"
          )}>
            {session.status === "EM_ANDAMENTO" ? "Em Andamento" : session.status}
          </span>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-bold uppercase">Nota</div>
          <div className="text-3xl font-bold font-mono-vital text-primary">
            {Number(session.current_score).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Last state narrative */}
      {lastState && (
        <>
          <div className="bg-card border-l-4 border-primary shadow-sm p-4 rounded-r-lg">
            <h2 className="text-lg font-bold text-foreground leading-tight">{lastState.interface_usuario.manchete}</h2>
            <span className="text-xs text-primary font-bold uppercase mt-1 block tracking-wide">Último Estado Clínico</span>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed bg-card p-6 rounded-2xl shadow-sm border border-border">
            <p className="whitespace-pre-line">{renderWithTooltips(lastState.interface_usuario.narrativa_principal)}</p>
          </div>

          {/* Vitals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[hsl(var(--vital-bg))] rounded-xl p-4 shadow-inner">
              <span className="text-[10px] font-bold text-[hsl(var(--vital-foreground))] uppercase flex items-center gap-1.5 mb-2">
                <Stethoscope className="h-3 w-3" /> Sinais Vitais
              </span>
              <div className="font-mono-vital text-[hsl(var(--vital-foreground))] text-sm whitespace-pre-wrap leading-relaxed">
                {renderWithTooltips(lastState.dados_medicos.sinais_vitais)}
              </div>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Exames
              </span>
              <div className="font-mono-vital text-foreground text-xs whitespace-pre-wrap leading-relaxed">
                {lastState.dados_medicos.exames_resultados === "Nenhum exame solicitado" ? (
                  <span className="text-muted-foreground italic">Nenhum resultado.</span>
                ) : renderWithTooltips(lastState.dados_medicos.exames_resultados)}
              </div>
            </div>
          </div>

          {/* Mentor feedback */}
          {lastState.interface_usuario.feedback_mentor && (
            <div className="bg-accent border border-border rounded-xl p-4">
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase mb-1">Feedback do Preceptor</h4>
                  <p className="text-sm text-foreground italic">"{lastState.interface_usuario.feedback_mentor}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Debriefing if finished */}
          {isFinished && lastState.interface_usuario.feedback_mentor && (() => {
            const debriefing = parseDebriefing(lastState.interface_usuario.feedback_mentor);
            return (
              <div className="space-y-4">
                {debriefing.resumo && (
                  <div className="bg-secondary p-4 rounded-xl border border-border">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2"><ClipboardList className="h-3 w-3" /> Resumo</h4>
                    <p className="text-sm text-foreground leading-relaxed">{debriefing.resumo}</p>
                  </div>
                )}
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
            );
          })()}

          {/* Score feedback */}
          {lastState.interface_usuario.score_feedback && (
            <div className="flex items-start gap-2 bg-secondary p-3 rounded-lg border border-border text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="font-bold text-muted-foreground text-xs uppercase block">Avaliação</span>
                <span className="text-foreground italic">{lastState.interface_usuario.score_feedback}</span>
              </div>
            </div>
          )}
        </>
      )}

      <Button variant="outline" onClick={onBack} className="w-full">
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Histórico
      </Button>
    </div>
  );
};

export default SessionReview;
