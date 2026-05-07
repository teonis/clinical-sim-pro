import React from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Shield, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandingHeroProps {
  onStart: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 bg-background">
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
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Plataforma Médica v4.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-9xl font-black mb-4 tracking-tighter leading-none text-foreground"
          >
            BOLUS
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-3xl font-medium text-muted-foreground mb-12 tracking-tight"
          >
            Sua dose de realidade clínica
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button 
              size="lg" 
              onClick={onStart}
              className="h-16 px-10 text-lg font-bold rounded-full transition-all group w-full sm:w-auto shadow-xl shadow-primary/20"
            >
              Iniciar Treinamento <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="h-16 px-10 text-lg font-bold rounded-full w-full sm:w-auto border-2 border-border hover:bg-muted transition-all"
            >
              Explorar Casos
            </Button>
          </motion.div>

          {/* Clinical Monitor Preview - Minimalist Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative max-w-3xl mx-auto rounded-[2rem] border border-border bg-card p-1 shadow-2xl overflow-hidden"
          >
            <div className="bg-background rounded-[1.8rem] p-8 border border-border">
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