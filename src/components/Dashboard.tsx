import React, { useState, useEffect } from "react";
import { UserStats, SPECIALTIES } from "@/types/simulation";
import { getUserStats, getLeaderboard, getUserHistory, sendFeedback, toggleGameFavorite } from "@/services/gameService";
import { supabase } from "@/integrations/supabase/client";
import { GAME_LEVELS, GameHistoryEntry } from "@/types/simulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import StartGame from "@/components/StartGame";
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
  const [rankingSpecialty, setRankingSpecialty] = useState("TODAS");
  const [isRankingLoading, setIsRankingLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "history") getUserHistory().then(setHistory);
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
        .select("display_name")
        .eq("user_id", user.id)
        .single();
      if (profile?.display_name) setDisplayName(profile.display_name);
      else setDisplayName(userEmail.split("@")[0]);
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
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-sm">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <div className="hidden lg:block">
            <span className="font-display font-bold text-sm gradient-brand-text block leading-tight">SIMULAMED</span>
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase">By Time Rocha</span>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors",
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
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground border border-border">
              {(displayName || userEmail).substring(0, 2).toUpperCase()}
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
                      <div key={idx} className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                          idx === 0 ? "bg-yellow-100 text-yellow-700" :
                          idx === 1 ? "bg-secondary text-foreground" :
                          idx === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
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
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Meu Desempenho</h1>
                <p className="text-muted-foreground mt-1">Análise detalhada da sua evolução médica.</p>
              </div>

              {/* Profile edit */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-foreground text-sm mb-4">Editar Perfil</h3>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Nome de Exibição</label>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Dr(a). Exemplo" />
                  </div>
                  <Button onClick={handleSaveDisplayName} disabled={isProfileLoading}>
                    {isProfileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {userStats.totalGames === 0 ? (
                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-foreground mb-2">Comece sua Carreira!</h2>
                  <p className="text-muted-foreground mb-6">Inicie seu primeiro plantão para ganhar XP.</p>
                  <Button onClick={() => setActiveTab("home")}>Ir para o Plantão</Button>
                </div>
              ) : (
                <>
                  {/* Level Card */}
                  <div className="bg-foreground rounded-2xl p-6 text-background shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-left">
                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Nível Atual</div>
                        <div className="text-3xl font-bold text-background mb-2">{userStats.currentLevel}</div>
                      </div>
                      <div className="w-full md:w-1/2">
                        <div className="flex justify-between text-xs font-bold opacity-60 mb-2">
                          <span>XP: {userStats.totalScore.toFixed(2)}</span>
                          <span>Próximo: {userStats.nextLevelScore}</span>
                        </div>
                        <Progress value={Math.min(100, (userStats.totalScore / (userStats.nextLevelScore || 1)) * 100)} className="h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm text-center">
                      <div className="text-muted-foreground text-xs font-bold uppercase mb-1">Total de Casos</div>
                      <div className="text-2xl font-bold text-foreground">{userStats.totalGames}</div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm text-center">
                      <div className="text-muted-foreground text-xs font-bold uppercase mb-1">Média Score</div>
                      <div className="text-2xl font-bold text-primary">{userStats.averageScore}</div>
                    </div>
                  </div>

                  {/* Specialty performance */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <Medal className="h-4 w-4 text-primary" /> Pontos Fortes
                      </h3>
                      <div className="space-y-4">
                        {userStats.specialtyPerformance.filter((s) => s.avgScore >= 7.0).length > 0 ? (
                          userStats.specialtyPerformance.filter((s) => s.avgScore >= 7.0).map((spec, i) => (
                            <div key={i}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                  {getSpecialtyIcon(spec.name)} {spec.name}
                                </span>
                                <span className="text-xs font-bold text-primary">{spec.avgScore} pts</span>
                              </div>
                              <Progress value={spec.avgScore * 10} className="h-2" />
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Jogue mais para identificar pontos fortes.</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-warning" /> A Melhorar
                      </h3>
                      <div className="space-y-4">
                        {userStats.specialtyPerformance.filter((s) => s.avgScore < 7.0 || s.deaths > 0).length > 0 ? (
                          userStats.specialtyPerformance.filter((s) => s.avgScore < 7.0 || s.deaths > 0).map((spec, i) => (
                            <div key={i}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                  {getSpecialtyIcon(spec.name)} {spec.name}
                                </span>
                                <span className="text-xs font-bold text-warning">{spec.avgScore} pts</span>
                              </div>
                              <Progress value={spec.avgScore * 10} className="h-2 [&>div]:bg-warning" />
                              {spec.deaths > 0 && (
                                <span className="text-[10px] text-destructive font-bold block mt-1">{spec.deaths} Óbito(s)</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Nenhum ponto crítico identificado.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Histórico de Casos</h1>
                  <p className="text-muted-foreground mt-1">Seus últimos atendimentos simulados.</p>
                </div>
                <div className="flex bg-secondary p-1 rounded-lg self-start">
                  <button onClick={() => setShowFavoritesOnly(false)} className={cn("px-4 py-2 rounded-md text-xs font-bold uppercase", !showFavoritesOnly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                    Todos
                  </button>
                  <button onClick={() => setShowFavoritesOnly(true)} className={cn("px-4 py-2 rounded-md text-xs font-bold uppercase flex items-center gap-2", showFavoritesOnly ? "bg-card text-yellow-600 shadow-sm" : "text-muted-foreground")}>
                    <Star className="h-3 w-3" /> Favoritos
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {history.filter((g) => !showFavoritesOnly || g.is_favorite).length > 0 ? (
                  history
                    .filter((g) => !showFavoritesOnly || g.is_favorite)
                    .map((game, i) => (
                      <div key={game.id || i} className="bg-card rounded-xl border border-border p-5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {new Date(game.created_at).toLocaleDateString("pt-BR")}
                            </span>
                            <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", game.outcome === "CURADO" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                              {game.outcome}
                            </span>
                          </div>
                          <h3 className="font-bold text-foreground text-sm">{game.case_title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{game.specialty} · {game.difficulty}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground font-bold uppercase">Nota</div>
                            <div className="text-xl font-bold font-mono-vital text-primary">{Number(game.score).toFixed(1)}</div>
                          </div>
                          <button onClick={() => handleToggleFavorite(game.id)} className="text-muted-foreground hover:text-yellow-500 transition-colors">
                            {game.is_favorite ? <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" /> : <StarOff className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-12 text-center">
                    <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum caso encontrado.</p>
                  </div>
                )}
              </div>
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
