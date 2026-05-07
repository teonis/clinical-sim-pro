import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Zap, Clock, RotateCcw, LogOut } from "lucide-react";

interface GameHeaderProps {
  caseTitle: string;
  formattedTime: string;
  onRestart: () => void;
  onExit: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ caseTitle, formattedTime, onRestart, onExit }) => {
  return (
    <header className="h-16 shrink-0 bg-card border-b border-border px-8 flex items-center justify-between z-40">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="text-sm font-bold tracking-tight uppercase">{caseTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
          <Clock className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold tabular-nums tracking-widest">{formattedTime}</span>
        </div>
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={onRestart} className="h-8 w-8 rounded-lg hover:bg-muted"><RotateCcw className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onExit} className="h-8 w-8 rounded-lg hover:bg-destructive/5 hover:text-destructive"><LogOut className="h-4 w-4" /></Button>
      </div>
    </header>
  );
};

export default GameHeader;
