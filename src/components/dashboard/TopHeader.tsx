import React from "react";
import { Search, Bell, Zap } from "lucide-react";

const TopHeader: React.FC = () => {
  return (
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
  );
};

export default TopHeader;
