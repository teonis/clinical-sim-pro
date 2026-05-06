import React, { useState, useEffect } from "react";
import { UserStats, SPECIALTIES, StartParams, GameHistoryEntry } from "@/types/simulation";
import { getUserStats, getLeaderboard, getUserHistory, sendFeedback, toggleGameFavorite } from "@/services/gameService";
import { getUserSessions, GameSession } from "@/services/sessionService";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import StartGame from "@/components/StartGame";
import SessionReview from "@/components/SessionReview";
import ProfilePerformance from "@/components/ProfilePerformance";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Clock, MessageSquare, LogOut, Stethoscope,
  Trophy, Activity, Bell, Search, User, ChevronRight, ShieldCheck,
  Zap, Brain, Heart, Ambulance, Wind, Bug, Baby, Bone
} from "lucide-react";

type TabType = "home" | "performance" | "history" | "feedback";

interface DashboardProps {
  onStartGame: (params: StartParams) => void;
  isLoading: boolean;
  userEmail: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartGame, isLoading, userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameHistoryEntry[]>([]);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [reviewSession, setReviewSession] = useState<GameSession | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [sidebarAvatar, setSidebarAvatar] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      getUserSessions().then(setSessions);
    }
    if (activeTab === "home") {
      getLeaderboard("TODAS").then(setLeaderboard);
    }
  }, [activeTab]);

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

  const navItems = [
    { id: "home" as TabType, icon: LayoutDashboard, label: "Dashboard" },
    { id: "performance" as TabType, icon: BarChart3, label: "Estatísticas" },
    { id: "history" as TabType, icon: Clock, label: "Histórico" },
    { id: "feedback" as TabType, icon: MessageSquare, label: "Feedback" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden selection:bg-primary/20">
      {/* Sidebar - Clean Light Minimalist */}
      <aside className="w-20 lg:w-72 bg-card border-r border-border flex flex-col shrink-0 z-40 transition-all duration-300">
        <div className="p-8 flex items-center gap-4 h-24 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-sm">B</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl text-foreground tracking-tighter leading-none">BOLUS</h1>
            <p className="text-[8px] font-bold text-muted-foreground tracking-widest uppercase mt-1">Simulador v4.0</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all group relative",
                activeTab === id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform", activeTab === id ? "text-primary-foreground" : "text-primary")} />
              <span className="hidden lg:block tracking-tight">{label}</span>
              {activeTab === id && (
                <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-primary-foreground/30 rounded-r-full lg:hidden" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-border space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center">
              {sidebarAvatar ? (
                <img src={sidebarAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{displayName || userEmail}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                  {userStats?.currentLevel || "Médico"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <ThemeToggle />
            <button 
              onClick={onLogout}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-muted/30">
        {/* Top Header - Clean */}
        <header className="h-20 shrink-0 bg-background/50 backdrop-blur-xl border-b border-border px-10 flex items-center justify-between z-30">
          <div className="flex items-center gap-8 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full h-11 bg-muted border-none rounded-xl pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizado</span>
            </div>
            <button className="w-11 h-11 rounded-xl border border-border bg-background flex items-center justify-center hover:bg-muted transition-all relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            
            {activeTab === "home" && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <StartGame onStart={onStartGame} isLoading={isLoading} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" /> Ranking Acadêmico
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leaderboard.slice(0, 4).map((entry, idx) => (
                        <div key={idx} className="bg-card p-5 rounded-2xl border border-border flex items-center gap-4 hover:shadow-md transition-all">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                            idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}>
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-foreground truncate uppercase">
                              {entry.display_name || entry.username?.split("@")[0]}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">{entry.specialty || "Geral"}</span>
                              <span className="text-xs font-bold text-primary">{entry.score} XP</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" /> Atividade Recente
                    </h3>
                    <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                      {[
                        { label: "Casos Concluídos", val: userStats?.totalGames || 0, max: 100 },
                        { label: "Média Global", val: userStats?.averageScore || 0, max: 10 },
                      ].map((stat, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                            <span>{stat.label}</span>
                            <span className="text-foreground">{stat.val}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(stat.val / stat.max) * 100}%` }}
                              className="h-full bg-primary rounded-full" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "performance" && userStats && (
              <ProfilePerformance
                userStats={userStats}
                userEmail={userEmail}
                displayName={displayName}
                onDisplayNameChange={setDisplayName}
                onSaveDisplayName={() => {}}
                isProfileLoading={isProfileLoading}
                onGoToHome={() => setActiveTab("home")}
                history={history}
              />
            )}

            {activeTab === "history" && (
              <div className="space-y-8 animate-in fade-in">
                {reviewSession ? (
                  <SessionReview session={reviewSession} onBack={() => setReviewSession(null)} />
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="max-w-2xl space-y-8 animate-in fade-in">
                <div>
                  <h1 className="text-4xl font-black text-foreground tracking-tight">Feedback</h1>
                  <p className="text-muted-foreground mt-2 font-medium">Sugestões ou reporte de bugs.</p>
                </div>
                <div className="bg-card rounded-[2rem] border border-border p-10 space-y-6">
                  <Textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Sua mensagem..."
                    className="min-h-[150px] bg-muted border-none rounded-xl p-6 font-medium focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  />
                  <Button 
                    onClick={() => {}} 
                    disabled={!feedbackText.trim()}
                    className="h-14 w-full rounded-xl text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground"
                  >
                    Enviar Mensagem
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;