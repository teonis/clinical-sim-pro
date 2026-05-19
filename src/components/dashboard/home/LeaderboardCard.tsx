import React from "react";
import { cn } from "@/lib/utils";
import { GameHistoryEntry } from "@/types/simulation";

interface LeaderboardCardProps {
  entry: GameHistoryEntry;
  rank: number;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entry, rank }) => (
  <div className="bg-card p-5 rounded-2xl border border-border flex items-center gap-4 hover:shadow-md transition-all">
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
      rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    )}>
      #{rank}
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
);
