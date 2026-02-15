import React, { useState, useEffect } from "react";
import { UserStats, SPECIALTIES } from "@/types/simulation";
import { getUserStats, getLeaderboard, getUserHistory, sendFeedback, toggleGameFavorite } from "@/services/gameService";
import { getUserSessions, GameSession } from "@/services/sessionService";
import { supabase } from "@/integrations/supabase/client";
import { GAME_LEVELS, GameHistoryEntry } from "@/types/simulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import StartGame from "@/components/StartGame";
import SessionReview from "@/components/SessionReview";
import ProfilePerformance from "@/components/ProfilePerformance";
import { cn } from "@/lib/utils";
import {
  Home, BarChart3, Clock, MessageSquare, LogOut, Stethoscope,
  Trophy, Medal, BookOpen, Star, StarOff, Heart, Brain,
  Ambulance, Wind, Bug, Baby, Bone, GraduationCap, ChevronRight,
  Lock, Eye, EyeOff, Pencil, Save, Loader2, User, Shield,
} from "lucide-react";
import { StartParams } from "@/types/simulation";

type TabType = "home" | "performance" | "history" | "feedback";

interface DashboardProps {
  onStartGame: (params: StartParams) => void;
  isLoading: boolean;
  userEmail: string;
  onLogout: () => void;
}

const getSpecialtyIcon = (spec: string) => {
  if (spec.includes("Cardio")) return <Heart className="h-4 w-4" />;
  if (spec.includes("Neuro")) return <Brain className="h-4 w-4" />;
  if (spec.includes("Trauma")) return <Ambulance className="h-4 w-4" />;
  if (spec.includes("Pneumo")) return <Wind className="h-4 w-4" />;
  if (spec.includes("Infecto")) return <Bug className="h-4 w-4" />;
  if (spec.includes("Pediatria")) return <Baby className="h-4 w-4" />;
  if (spec.includes("Ortopedia")) return <Bone className="h-4 w-4" />;
  return <Stethoscope className="h-4 w-4" />;
};

const Dashboard: React.FC<DashboardProps> = ({ onStartGame, isLoading, userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameHistoryEntry[]>([]);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [reviewSession, setReviewSession] = useState<GameSession | null>(null);
  const [rankingSpecialty, setRankingSpecialty] = useState("TODAS");
  const [isRankingLoading, setIsRankingLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [sidebarAvatar, setSidebarAvatar] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      getUserHistory().then(setHistory);
      getUserSessions().then(setSessions);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "home") updateLeaderboard();
  }, [rankingSpecialty, activeTab]);

  const loadData = async () => {
    const [stats, hist] = await Promise.all([getUserStats(), getUserHistory()]);
    setUserStats(stats);
    setHistory(hist);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (profile?.display_name) setDisplayName(profile.display_name);
      else setDisplayName(userEmail.split("@")[0]);
      if (profile?.avatar_url) setSidebarAvatar(profile.avatar_url);
    }
  };

  const updateLeaderboard = async () => {
    setIsRankingLoading(true);
    const data = await getLeaderboard(rankingSpecialty);
    setLeaderboard(data);
    setIsRankingLoading(false);
  };

  const handleToggleFavorite = async (gameId: number | string) => {
    setHistory((prev) =>
      prev.map((item) => {
        if (item.id === gameId) {
          const newStatus = !item.is_favorite;
          toggleGameFavorite(gameId, newStatus);
          return { ...item, is_favorite: newStatus };
        }
        return item;
      })
    );
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    await sendFeedback(feedbackText);
    setFeedbackSent(true);
    setFeedbackText("");
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const handleSaveDisplayName = async () => {
    setIsProfileLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
    }
    setIsProfileLoading(false);
  };

  const navItems = [
    { id: "home" as TabType, icon: Home, label: "Início" },
    { id: "performance" as TabType, icon: BarChart3, label: "Desempenho" },
    { id: "history" as TabType, icon: Clock, label: "Histórico" },
    { id: "feedback" as TabType, icon: MessageSquare, label: "Feedback" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 bg-card border-r border-border flex flex-col shrink-0 z-20">
        <div className="p-4 flex items-center justify-center lg:justify-start gap-3 border-b border-border h-16">
          <div className="w-8 h-8 rounded-sm bg-primary/10 hud-border flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden lg:block">
            <span className="font-display font-black text-sm text-primary lcd-glow block leading-tight tracking-tighter">BOLUS</span>
            <span className="text-[9px] font-mono-vital text-muted-foreground tracking-widest uppercase">NIGHT PROTOCOL</span>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-sm text-sm font-medium transition-colors",
                activeTab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-5 w-5 mx-auto lg:mx-0" />
              <span className="hidden lg:block">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 p-2">
            <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center text-xs font-bold text-foreground border border-border overflow-hidden">
              {sidebarAvatar ? (
                <img src={sidebarAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (displayName || userEmail).substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="hidden lg:block overflow-hidden flex-1">
              <p className="text-xs font-bold text-foreground truncate">{displayName || userEmail}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {userStats ? userStats.currentLevel : "Carregando..."}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="w-full">
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline ml-2">Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === "home" && (
            <>
              <StartGame onStart={onStartGame} isLoading={isLoading} />

              {/* Leaderboard */}
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" /> Líderes do Plantão
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isRankingLoading ? (
                    <div className="col-span-full py-8 text-center text-muted-foreground text-xs font-bold uppercase animate-pulse">
                      Atualizando Ranking...
                    </div>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((entry, idx) => (
                      <div key={idx} className="bg-card p-4 rounded-sm border border-border shadow-sm flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-sm flex items-center justify-center font-mono-vital font-bold text-sm shrink-0",
                          idx === 0 ? "bg-primary/10 text-primary hud-border" :
                          idx === 1 ? "bg-secondary text-foreground" :
                          idx === 2 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                        )}>
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground text-sm truncate">
                            {entry.display_name || (entry.username || "").split("@")[0]}
                          </p>
                          <div className="flex justify-between items-center mt-0.5">
                            <p className="text-xs text-muted-foreground truncate">{entry.specialty || "Geral"}</p>
                            <p className="text-xs font-bold text-primary">{entry.score} pts</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center">
                      <p className="text-muted-foreground text-sm">Nenhum ranking disponível ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "performance" && userStats && (
            <ProfilePerformance
              userStats={userStats}
              userEmail={userEmail}
              displayName={displayName}
              onDisplayNameChange={setDisplayName}
              onSaveDisplayName={handleSaveDisplayName}
              isProfileLoading={isProfileLoading}
              onGoToHome={() => setActiveTab("home")}
              history={history}
            />
          )}

          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in">
              {reviewSession ? (
                <SessionReview session={reviewSession} onBack={() => setReviewSession(null)} />
              ) : (
                <>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Histórico de Casos</h1>
                    <p className="text-muted-foreground mt-1">Seus últimos atendimentos simulados.</p>
                  </div>

                  <div className="grid gap-4">
                    {sessions.length > 0 ? (
                      sessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => setReviewSession(session)}
                          className="bg-card rounded-xl border border-border p-5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between text-left hover:border-primary/30 hover:shadow-md transition-all group w-full"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {new Date(session.started_at).toLocaleDateString("pt-BR")}
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                session.status === "CURADO" ? "bg-primary/10 text-primary" :
                                session.status === "OBITO" ? "bg-destructive/10 text-destructive" :
                                "bg-warning/10 text-warning"
                              )}>
                                {session.status === "EM_ANDAMENTO" ? "Em Andamento" : session.status}
                              </span>
                            </div>
                            <h3 className="font-bold text-foreground text-sm">{session.case_title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{session.specialty} · {session.difficulty}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground font-bold uppercase">Nota</div>
                              <div className="text-xl font-bold font-mono-vital text-primary">{Number(session.current_score).toFixed(1)}</div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Nenhum caso encontrado.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="space-y-6 animate-in fade-in max-w-lg">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
                <p className="text-muted-foreground mt-1">Envie sugestões ou reporte problemas.</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Conte-nos o que podemos melhorar..."
                  rows={5}
                />
                <Button onClick={handleFeedbackSubmit} disabled={!feedbackText.trim()}>
                  {feedbackSent ? "✓ Enviado!" : "Enviar Feedback"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
