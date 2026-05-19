import React from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Shield, Zap, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandingHeroProps {
  onStart: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-background/50">
      {/* Subtle Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-10"
          >
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Simulação Médica</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-8xl md:text-[10rem] font-black mb-4 tracking-tighter leading-none text-foreground italic"
          >
            PULZU
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-4xl font-medium text-muted-foreground mb-12 tracking-tight opacity-70"
          >
            A dose de realidade que o seu plantão precisa.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl mx-auto mb-16 relative group"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-card/40 backdrop-blur-2xl border border-white/20 h-20 rounded-[2rem] px-8 shadow-2xl focus-within:ring-4 focus-within:ring-primary/10 transition-all">
              <Search className="h-6 w-6 text-primary mr-5" />
              <input 
                type="text" 
                placeholder="Busque por sua faculdade de medicina..." 
                className="bg-transparent border-none focus:ring-0 text-base font-semibold w-full placeholder:text-muted-foreground/30"
              />
              <div className="ml-4 px-3 py-1 bg-muted rounded-lg text-[8px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                Ficha Técnica
              </div>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button 
              size="lg" 
              onClick={onStart}
              className="h-20 px-12 text-xl font-black rounded-3xl transition-all group w-full sm:w-auto shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95"
            >
              Iniciar Treinamento <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="h-20 px-12 text-xl font-black rounded-3xl w-full sm:w-auto border-2 border-border hover:bg-white hover:border-primary/30 transition-all shadow-lg"
            >
              Explorar Casos
            </Button>
          </motion.div>

          {/* Clinical Monitor Preview - Minimalist Style */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative max-w-4xl mx-auto rounded-[3rem] border border-white/20 bg-card/40 backdrop-blur-3xl p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden"
          >
            <div className="bg-background/40 rounded-[2.8rem] p-12 border border-white/10">
              <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Telemetry Stream</span>
                </div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Status: Monitorando
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: 'FC', val: '72', unit: 'bpm' },
                  { label: 'PA', val: '120/80', unit: 'mmHg' },
                  { label: 'SpO₂', val: '98', unit: '%' },
                  { label: 'FR', val: '14', unit: 'irpm' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</span>
                    <span className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">{stat.val}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1">{stat.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;