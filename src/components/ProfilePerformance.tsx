import React, { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserStats } from "@/types/simulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Camera, Save, Loader2, GraduationCap, Medal, BookOpen,
  Heart, Brain, Ambulance, Wind, Bug, Baby, Bone, Stethoscope,
  TrendingUp, Target, Award, BarChart3, User,
} from "lucide-react";
import { toast } from "sonner";
import { GameHistoryEntry } from "@/types/simulation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";

interface ProfilePerformanceProps {
  userStats: UserStats;
  userEmail: string;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onSaveDisplayName: () => void;
  isProfileLoading: boolean;
  onGoToHome: () => void;
  history: GameHistoryEntry[];
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

const ProfilePerformance: React.FC<ProfilePerformanceProps> = ({
  userStats, userEmail, displayName, onDisplayNameChange,
  onSaveDisplayName, isProfileLoading, onGoToHome, history,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load avatar on mount
  React.useEffect(() => {
    const loadAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    };
    loadAvatar();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const urlWithCache = `${publicUrl}?t=${Date.now()}`;

      await supabase.from("profiles")
        .update({ avatar_url: urlWithCache })
        .eq("user_id", user.id);

      setAvatarUrl(urlWithCache);
      toast.success("Foto atualizada!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar foto.");
    } finally {
      setIsUploading(false);
    }
  };

  // Build chart data from history (score evolution over time)
  const chartData = React.useMemo(() => {
    if (!history || history.length === 0) return [];
    const sorted = [...history].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    let cumSum = 0;
    let count = 0;
    return sorted.map((entry) => {
      cumSum += Number(entry.score) || 0;
      count++;
      return {
        date: new Date(entry.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        nota: Number(entry.score) || 0,
        media: parseFloat((cumSum / count).toFixed(1)),
      };
    });
  }, [history]);

  // Survival rate
  const survivalRate = React.useMemo(() => {
    if (!history || history.length === 0) return 0;
    const cured = history.filter((h) => h.outcome === "CURADO").length;
    return Math.round((cured / history.length) * 100);
  }, [history]);

  if (userStats.totalGames === 0) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground mt-1">Configure seu perfil e acompanhe seu desempenho.</p>
        </div>
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Comece sua Carreira!</h2>
          <p className="text-muted-foreground mb-6">Inicie seu primeiro plantão para ganhar XP e ver seu desempenho.</p>
          <Button onClick={onGoToHome}>Ir para o Plantão</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Seu desempenho e evolução médica.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary border-2 border-border flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 bg-foreground/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-background animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-background" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Name & Level */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row gap-2 items-center sm:items-end mb-2">
              <Input
                value={displayName}
                onChange={(e) => onDisplayNameChange(e.target.value)}
                placeholder="Seu nome"
                className="max-w-xs text-center sm:text-left font-bold"
              />
              <Button size="sm" variant="outline" onClick={onSaveDisplayName} disabled={isProfileLoading}>
                {isProfileLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Award className="h-3.5 w-3.5" />
              {userStats.currentLevel}
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-foreground rounded-2xl p-6 text-background shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-bold text-primary uppercase tracking-widest">Progressão de Nível</div>
            <div className="text-xs font-bold opacity-60">{userStats.currentLevel}</div>
          </div>
          <div className="flex justify-between text-xs font-bold opacity-60 mb-2">
            <span>XP: {userStats.totalScore.toFixed(1)}</span>
            <span>Próximo: {userStats.nextLevelScore}</span>
          </div>
          <Progress value={Math.min(100, (userStats.totalScore / (userStats.nextLevelScore || 1)) * 100)} className="h-3" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Target className="h-5 w-5" />} label="Total de Casos" value={String(userStats.totalGames)} color="text-primary" />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Nota Média" value={String(userStats.averageScore)} color="text-primary" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Taxa de Cura" value={`${survivalRate}%`} color="text-primary" />
        <StatCard icon={<Award className="h-5 w-5" />} label="XP Total" value={userStats.totalScore.toFixed(0)} color="text-primary" />
      </div>

      {/* Score Evolution Chart */}
      {chartData.length >= 2 && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Evolução da Nota Média
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Acompanhe sua melhoria ao longo do tempo</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="media"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorMedia)"
                  name="Média Acumulada"
                />
                <Line
                  type="monotone"
                  dataKey="nota"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "hsl(var(--muted-foreground))" }}
                  name="Nota do Caso"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Specialty Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Medal className="h-4 w-4 text-primary" /> Taxa de Acerto por Especialidade
          </h3>
          <div className="space-y-4">
            {userStats.specialtyPerformance.length > 0 ? (
              userStats.specialtyPerformance.map((spec, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      {getSpecialtyIcon(spec.name)} {spec.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{spec.count} caso(s)</span>
                      <span className={`text-xs font-bold ${spec.avgScore >= 7 ? "text-primary" : "text-warning"}`}>
                        {spec.avgScore}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={spec.avgScore * 10}
                    className={`h-2 ${spec.avgScore < 7 ? "[&>div]:bg-warning" : ""}`}
                  />
                  {spec.deaths > 0 && (
                    <span className="text-[10px] text-destructive font-bold block mt-1">
                      ⚠ {spec.deaths} Óbito(s)
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Jogue mais para ver estatísticas.</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-warning" /> Áreas para Melhorar
          </h3>
          <div className="space-y-4">
            {userStats.specialtyPerformance.filter((s) => s.avgScore < 7.0 || s.deaths > 0).length > 0 ? (
              userStats.specialtyPerformance
                .filter((s) => s.avgScore < 7.0 || s.deaths > 0)
                .sort((a, b) => a.avgScore - b.avgScore)
                .map((spec, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        {getSpecialtyIcon(spec.name)} {spec.name}
                      </span>
                      <span className="text-xs font-bold text-warning">{spec.avgScore}</span>
                    </div>
                    <Progress value={spec.avgScore * 10} className="h-2 [&>div]:bg-warning" />
                    {spec.deaths > 0 && (
                      <span className="text-[10px] text-destructive font-bold block mt-1">
                        ⚠ {spec.deaths} Óbito(s)
                      </span>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-6">
                <Medal className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Excelente! Todas as especialidades acima de 7.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon, label, value, color,
}: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) => (
  <div className="bg-card p-5 rounded-2xl border border-border shadow-sm text-center">
    <div className={`${color} mb-2 flex justify-center`}>{icon}</div>
    <div className="text-2xl font-bold text-foreground font-mono-vital">{value}</div>
    <div className="text-muted-foreground text-[10px] font-bold uppercase mt-1">{label}</div>
  </div>
);

export default ProfilePerformance;
