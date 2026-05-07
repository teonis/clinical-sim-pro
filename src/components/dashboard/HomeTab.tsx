import React from "react";
import { motion } from "framer-motion";
import { Trophy, Activity } from "lucide-react";
import StartGame from "@/components/StartGame";
import { UserStats, GameHistoryEntry, StartParams } from "@/types/simulation";
import { cn } from "@/lib/utils";

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
  );
};

export default HomeTab;
