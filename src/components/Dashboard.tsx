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
    { id: "home" as TabType, icon: LayoutDashboard, label: "Console" },
    { id: "performance" as TabType, icon: BarChart3, label: "Análise" },
    { id: "history" as TabType, icon: Clock, label: "Registros" },
    { id: "feedback" as TabType, icon: MessageSquare, label: "Suporte" },
  ];

  return (
    <div className="min-h-screen flex bg-[#030303] text-foreground overflow-hidden selection:bg-primary/30">
      {/* Sidebar - Integrated High-Tech Navigation */}
      <aside className="w-20 lg:w-72 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col shrink-0 z-40 transition-all duration-500">
        <div className="p-8 flex items-center gap-4 h-24 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)] flex items-center justify-center shrink-0">
            <span className="text-black font-black text-sm">B</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl text-white tracking-tighter leading-none">BOLUS</h1>
            <p className="text-[8px] font-black text-primary tracking-[0.4em] uppercase mt-1">Medical OS v4</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-black transition-all group relative overflow-hidden",
                activeTab === id 
                  ? "bg-primary text-black shadow-[0_0_30px_rgba(var(--primary),0.2)]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", activeTab === id ? "text-black" : "text-primary")} />
              <span className="hidden lg:block uppercase tracking-widest text-[10px]">{label}</span>
              {activeTab === id && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-white/10 pointer-events-none" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-8 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
              {sidebarAvatar ? (
                <img src={sidebarAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-black text-white truncate uppercase tracking-wider">{displayName || userEmail}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate">
                  {userStats?.currentLevel || "Autenticando..."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <ThemeToggle />
            <button 
              onClick={onLogout}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:border-destructive/50 hover:text-destructive transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Encerrar Sessão</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Command Bar */}
        <header className="h-24 shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-xl px-10 flex items-center justify-between z-30">
          <div className="flex items-center gap-8 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="BUSCAR CENÁRIOS, DIRETRIZES OU REGISTROS..." 
                className="w-full h-12 bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/30 transition-all placeholder:opacity-30"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-4 px-6 py-2 bg-white/5 rounded-xl border border-white/5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Latência: 24ms</span>
            </div>
            <button className="w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),1)]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {activeTab === "home" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <StartGame onStart={onStartGame} isLoading={isLoading} />
                
                {/* Global Performance Overview Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
                        <Trophy className="h-4 w-4 text-primary" /> Ranking Global de Proficiência
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leaderboard.slice(0, 4).map((entry, idx) => (
                        <div key={idx} className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 flex items-center gap-5 group hover:border-primary/30 transition-all hover:bg-white/[0.04]">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-inner",
                            idx === 0 ? "bg-primary text-black" : "bg-white/5 text-muted-foreground border border-white/5"
                          )}>
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-white truncate uppercase tracking-wider">
                              {entry.display_name || entry.username?.split("@")[0]}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{entry.specialty || "Clínica Geral"}</span>
                              <span className="text-xs font-black text-primary tabular-nums">{entry.score} XP</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
                      <Activity className="h-4 w-4 text-primary" /> Status do Sistema
                    </h3>
                    <div className="bg-white/[0.02] rounded-3xl border border-white/5 p-8 space-y-8">
                      {[
                        { label: "Casos Resolvidos", val: userStats?.totalGames || 0, max: 100, color: "bg-primary" },
                        { label: "Média Global", val: userStats?.averageScore || 0, max: 10, color: "bg-primary" },
                        { label: "Taxa de Sobrevivência", val: 88, max: 100, color: "bg-accent" }
                      ].map((stat, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                            <span className="text-xs font-black text-white">{stat.val}{stat.label === "Taxa de Sobrevivência" ? "%" : ""}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(stat.val / stat.max) * 100}%` }}
                              className={cn("h-full rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]", stat.color)} 
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
              <div className="space-y-10 animate-in fade-in">
                {reviewSession ? (
                  <SessionReview session={reviewSession} onBack={() => setReviewSession(null)} />
                ) : (
                  <>
                    <div className="flex items-end justify-between">
                      <div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">Registros de Missão</h1>
                        <p className="text-muted-foreground mt-2 text-lg font-medium tracking-tight">Análise retrospectiva de condutas e desfechos.</p>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {sessions.length > 0 ? (
                        sessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => setReviewSession(session)}
                            className="bg-white/[0.02] rounded-3xl border border-white/5 p-8 flex flex-col md:flex-row gap-8 items-center justify-between text-left hover:border-primary/30 hover:bg-white/[0.04] transition-all group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-4 mb-3">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                                  {new Date(session.started_at).toLocaleDateString("pt-BR")}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-black uppercase px-3 py-1 rounded-lg border",
                                  session.status === "CURADO" ? "border-primary/30 bg-primary/10 text-primary" :
                                  session.status === "OBITO" ? "border-destructive/30 bg-destructive/10 text-destructive" :
                                  "border-warning/30 bg-warning/10 text-warning"
                                )}>
                                  {session.status}
                                </span>
                              </div>
                              <h3 className="text-2xl font-black text-white tracking-tight uppercase truncate">{session.case_title}</h3>
                              <div className="flex items-center gap-6 mt-2 opacity-50">
                                <div className="flex items-center gap-2">
                                  <Stethoscope className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{session.specialty}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{session.difficulty}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-10 shrink-0">
                              <div className="text-right">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Score Final</div>
                                <div className="text-4xl font-black text-primary tabular-nums tracking-tighter">
                                  {Number(session.current_score).toFixed(1)}
                                </div>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all group-hover:scale-110">
                                <ChevronRight className="h-6 w-6" />
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="py-24 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                          <Activity className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
                          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-sm">Nenhum registro encontrado no console.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="max-w-2xl space-y-10 animate-in fade-in">
                <div>
                  <h1 className="text-5xl font-black text-white tracking-tighter">Suporte Técnico</h1>
                  <p className="text-muted-foreground mt-2 text-lg font-medium tracking-tight">Reporte anomalias ou sugira atualizações de protocolo.</p>
                </div>
                <div className="bg-white/[0.02] rounded-[3rem] border border-white/5 p-12 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Mensagem do Usuário</label>
                    <Textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="DESCREVA SUA SUGESTÃO OU INCIDENTE..."
                      className="min-h-[200px] bg-black/40 border-white/5 rounded-2xl p-6 font-medium text-white placeholder:opacity-20 focus:border-primary/40 transition-all resize-none"
                    />
                  </div>
                  <Button 
                    onClick={() => {}} 
                    disabled={!feedbackText.trim()}
                    className="h-16 w-full rounded-2xl text-xs font-black uppercase tracking-[0.3em] bg-primary text-black shadow-lg shadow-primary/20"
                  >
                    {feedbackSent ? "✓ Transmissão Concluída" : "Enviar Relatório"}
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