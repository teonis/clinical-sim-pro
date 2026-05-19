import React from "react";
import { motion } from "framer-motion";
import { Trophy, Activity } from "lucide-react";
import StartGame from "@/components/StartGame";
import { UserStats, GameHistoryEntry, StartParams } from "@/types/simulation";
import { LeaderboardCard } from "./home/LeaderboardCard";
import { RecentActivityStats } from "./home/RecentActivityStats";

interface HomeTabProps {
  onStartGame: (params: StartParams) => void;
  isLoading: boolean;
  leaderboard: GameHistoryEntry[];
  userStats: UserStats | null;
}

const HomeTab: React.FC<HomeTabProps> = ({ onStartGame, isLoading, leaderboard, userStats }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <StartGame onStart={onStartGame} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Ranking Acadêmico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaderboard.slice(0, 4).map((entry, idx) => (
              <LeaderboardCard key={idx} entry={entry} rank={idx + 1} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Atividade Recente
          </h3>
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            <RecentActivityStats label="Casos Concluídos" value={userStats?.totalGames || 0} max={100} />
            <RecentActivityStats label="Média Global" value={userStats?.averageScore || 0} max={10} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeTab;
