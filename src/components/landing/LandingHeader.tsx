import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LandingHeaderProps {
  onStart: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onStart }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-sm">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-2xl text-foreground leading-none">BOLUS</span>
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-muted-foreground leading-none mt-1">Simulador Clínico</span>
          </div>
        </a>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 mr-4">
            <a href="#features" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors scroll-smooth">Funcionalidades</a>
            <a href="#cases" className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors scroll-smooth">Cenários</a>
          </nav>
          <ThemeToggle />
          <button 
            onClick={onStart}
            className="text-[10px] font-bold tracking-widest px-8 py-3 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            ENTRAR
          </button>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
