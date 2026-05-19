import React from "react";
import { Search, Bell, Zap } from "lucide-react";

const TopHeader: React.FC = () => {
  return (
    <header className="h-24 shrink-0 bg-background/40 backdrop-blur-3xl border-b border-border/50 px-12 flex items-center justify-between z-30">
      <div className="flex items-center gap-8 flex-1 max-w-2xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
          <input 
            type="text" 
            placeholder="Pesquisar casos, exames ou medicações..." 
            className="w-full h-12 bg-white/50 border border-border/50 rounded-2xl pl-14 pr-6 text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40 shadow-sm"
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
