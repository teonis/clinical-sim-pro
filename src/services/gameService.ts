import { supabase } from "@/integrations/supabase/client";
import { GameHistoryEntry, UserStats, GAME_LEVELS } from "@/types/simulation";

const getDifficultyMultiplier = (difficulty: string) => {
  switch (difficulty) {
    case "ESPECIALISTA": return 2.5;
    case "RESIDENTE": return 1.5;
    default: return 1.0;
  }
};

const calculateStatsFromGames = (games: GameHistoryEntry[]): UserStats => {
  if (!games || games.length === 0) {
    return {
      totalGames: 0, totalScore: 0, currentLevel: "Calouro de Jaleco",
      nextLevelScore: 50, averageScore: 0, specialtyPerformance: [], recentHistory: [],
    };
  }

  const totalGames = games.length;
  const totalScoreRaw = games.reduce((acc, g) => {
    const base = Number(g.score) || 0;
    return acc + base * getDifficultyMultiplier(g.difficulty);
  }, 0);
  const sumPure = games.reduce((acc, g) => acc + (Number(g.score) || 0), 0);
  const averageScore = parseFloat((sumPure / totalGames).toFixed(1));
  const totalScore = parseFloat(totalScoreRaw.toFixed(2));

  let currentLevel = "Calouro de Jaleco";
  let nextLevelScore = 50;
  for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
    if (totalScore >= GAME_LEVELS[i].minScore) {
      currentLevel = GAME_LEVELS[i].name;
      nextLevelScore = GAME_LEVELS[i + 1]?.minScore || 10000;
      break;
    }
  }

  const specialtyMap: Record<string, { count: number; sumScore: number; deaths: number }> = {};
  games.forEach((g) => {
    const spec = g.specialty || "Geral";
    if (!specialtyMap[spec]) specialtyMap[spec] = { count: 0, sumScore: 0, deaths: 0 };
    specialtyMap[spec].count++;
    specialtyMap[spec].sumScore += Number(g.score) || 0;
    if (g.outcome === "OBITO") specialtyMap[spec].deaths++;
  });

  const specialtyPerformance = Object.entries(specialtyMap)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      avgScore: parseFloat((stats.sumScore / stats.count).toFixed(1)),
      deaths: stats.deaths,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return {
    totalGames, totalScore, currentLevel, nextLevelScore,
    averageScore, specialtyPerformance, recentHistory: games.slice(0, 5),
  };
};

export const saveGameResult = async (
  score: number, outcome: string, difficulty: string,
  specialty: string, caseTitle: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("game_history").insert({
    user_id: user.id,
    username: user.email || user.id,
    score,
    outcome,
    difficulty,
    specialty,
    case_title: caseTitle || "Caso Clínico Geral",
    is_favorite: false,
  });
};

export const getUserHistory = async (): Promise<GameHistoryEntry[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("game_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return [];
  return (data || []) as unknown as GameHistoryEntry[];
};

export const toggleGameFavorite = async (gameId: number | string, isFavorite: boolean) => {
  await supabase.from("game_history").update({ is_favorite: isFavorite }).eq("id", Number(gameId));
};

export const getUserStats = async (): Promise<UserStats> => {
  const history = await getUserHistory();
  return calculateStatsFromGames(history);
};

export const getLeaderboard = async (specialtyFilter?: string): Promise<GameHistoryEntry[]> => {
  let query = supabase
    .from("game_history")
    .select("*")
    .order("score", { ascending: false })
    .limit(50);

  if (specialtyFilter && specialtyFilter !== "TODAS") {
    query = query.eq("specialty", specialtyFilter);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  // Enrich with profile info
  const userIds = [...new Set(data.map((g: any) => g.user_id))];
  if (userIds.length === 0) return data as unknown as GameHistoryEntry[];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, is_public_profile")
    .in("user_id", userIds);

  return (data as any[])
    .map((game) => {
      const profile = profiles?.find((p: any) => p.user_id === game.user_id);
      if (profile && !profile.is_public_profile) return null;
      return {
        ...game,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
      };
    })
    .filter(Boolean)
    .slice(0, 10) as GameHistoryEntry[];
};

export const sendFeedback = async (message: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("feedback").insert({
    user_id: user.id,
    username: user.email || user.id,
    message,
  });
};
