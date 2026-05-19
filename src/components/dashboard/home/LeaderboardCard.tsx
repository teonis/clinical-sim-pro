import React from "react";
import { cn } from "@/lib/utils";
import { GameHistoryEntry } from "@/types/simulation";

interface LeaderboardCardProps {
  entry: GameHistoryEntry;
  rank: number;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entry, rank }) => (
  <div className="bg-card/50 backdrop-blur-sm p-6 rounded-[2rem] border border-border flex items-center gap-5 hover:shadow-2xl hover:border-primary/30 transition-all group">
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner transition-transform group-hover:scale-110",
      rank === 1 ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-secondary text-muted-foreground"
    )}>
      #{rank}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-base text-foreground truncate uppercase tracking-tight group-hover:text-primary transition-colors">
        {entry.display_name || entry.username?.split("@")[0]}
      </p>
      <div className="flex justify-between items-center mt-1">
        <span className="text-[9px] font-bold text-muted-foreground uppercase">{entry.specialty || "Geral"}</span>
        <span className="text-xs font-bold text-primary">{entry.score} XP</span>
      </div>
    </div>
  </div>
);
