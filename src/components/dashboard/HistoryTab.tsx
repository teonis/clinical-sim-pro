import React from "react";
import { Activity, ChevronRight } from "lucide-react";
import { GameSession } from "@/services/sessionService";
import SessionReview from "@/components/SessionReview";
import { cn } from "@/lib/utils";

interface HistoryTabProps {
  sessions: GameSession[];
  reviewSession: GameSession | null;
  setReviewSession: (session: GameSession | null) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ sessions, reviewSession, setReviewSession }) => {
  if (reviewSession) {
    return <SessionReview session={reviewSession} onBack={() => setReviewSession(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Histórico de Casos</h1>
        <p className="text-muted-foreground mt-2 font-medium">Registros de atendimentos anteriores.</p>
      </div>

      <div className="grid gap-4">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setReviewSession(session)}
              className="bg-card rounded-2xl border border-border p-6 flex flex-col md:flex-row gap-6 items-center justify-between text-left hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
                    {new Date(session.started_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                    session.status === "CURADO" ? "bg-primary/5 text-primary border-primary/20" :
                    session.status === "OBITO" ? "bg-destructive/5 text-destructive border-destructive/20" :
                    "bg-warning/5 text-warning border-warning/20"
                  )}>
                    {session.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground truncate">{session.case_title}</h3>
                <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-widest">{session.specialty} · {session.difficulty}</p>
              </div>
              <div className="flex items-center gap-8 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Score</div>
                  <div className="text-3xl font-black text-primary tabular-nums">
                    {Number(session.current_score).toFixed(1)}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
              </div>
            </button>
          ))
        ) : (
          <div className="py-20 text-center bg-card border border-dashed border-border rounded-[2rem]">
            <Activity className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Nenhum registro encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTab;
