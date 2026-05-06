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
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="min-h-screen flex bg-[#0a0a0a] transition-colors duration-500 overflow-hidden">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-16 lg:w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0 z-30 transition-all duration-300 relative">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-4 border-b border-white/5 h-20">
          <div className="w-10 h-10 rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] flex items-center justify-center shrink-0">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <span className="font-black text-xl text-white block leading-none tracking-tighter">BOLUS</span>
            <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase opacity-70 mt-1">SIMULADOR CLÍNICO</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all group relative",
                activeTab === id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", activeTab === id ? "text-primary-foreground" : "text-primary")} />
              <span className="hidden lg:block tracking-tight">{label}</span>
              {activeTab === id && (
                <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-6 bg-white rounded-r-full lg:hidden" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-6 bg-black/20">
          <div className="flex items-center gap-4 p-1">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-sm font-black text-white border border-white/10 overflow-hidden shadow-2xl">
              {sidebarAvatar ? (
                <img src={sidebarAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (displayName || userEmail).substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="hidden lg:block overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">{displayName || userEmail}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">
                  {userStats ? userStats.currentLevel : "Nível..."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <ThemeToggle />
            <Button variant="outline" size="lg" onClick={onLogout} className="w-full h-12 rounded-2xl font-black border-white/10 bg-transparent text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all">
              <LogOut className="h-5 w-5 lg:mr-3" />
              <span className="hidden lg:inline uppercase tracking-widest text-xs">Encerrar Sessão</span>
            </Button>
          </div>
        </div>
      </aside>


      {/* Main */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === "home" && (
            <>
              <StartGame onStart={onStartGame} isLoading={isLoading} />

              {/* Leaderboard */}
              <div className="mt-12 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-foreground text-xs uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-accent" /> Ranking Acadêmico
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isRankingLoading ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest animate-pulse">
                      Sincronizando Dados...
                    </div>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((entry, idx) => (
                      <div key={idx} className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md group cursor-default">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-inner",
                          idx === 0 ? "bg-accent/10 text-accent border border-accent/20" :
                          idx === 1 ? "bg-primary/10 text-primary border border-primary/20" :
                          idx === 2 ? "bg-secondary/10 text-secondary border border-secondary/20" : 
                          "bg-muted text-muted-foreground"
                        )}>
                          #{idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                            {entry.display_name || (entry.username || "").split("@")[0]}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">{entry.specialty || "Geral"}</p>
                            <p className="text-[11px] font-bold text-primary tabular-nums">{entry.score} pts</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
                      <p className="text-muted-foreground text-sm font-medium italic">Ranking em atualização.</p>
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
