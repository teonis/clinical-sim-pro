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
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse delay-1000" />
        
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 mb-10 backdrop-blur-md"
          >
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary">Dynamic Physiological Engine v4.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-7xl md:text-[10rem] font-black mb-4 tracking-tighter leading-none select-none"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">BOLUS</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-4xl font-black text-primary mb-8 tracking-[0.3em] uppercase"
          >
            Sua dose de realidade clínica
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Treinamento de alto rigor focado em medicina de emergência. 
            Ambientes críticos, fisiologia dinâmica e debriefing baseado em guidelines reais.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
          >
            <Button 
              size="lg" 
              onClick={onStart}
              className="h-20 px-12 text-xl font-black rounded-2xl shadow-[0_20px_50px_rgba(var(--primary),0.3)] hover:shadow-[0_20px_60px_rgba(var(--primary),0.5)] hover:-translate-y-1 transition-all group w-full sm:w-auto bg-primary text-black"
            >
              INICIAR TREINAMENTO <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="h-20 px-12 text-xl font-black rounded-2xl w-full sm:w-auto border-2 border-white/10 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all tracking-widest"
            >
              CASOS CLÍNICOS
            </Button>
          </motion.div>

          {/* Clinical Monitor Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative max-w-4xl mx-auto rounded-[2.5rem] border-4 border-white/5 bg-[#050505] p-3 shadow-[0_0_100px_rgba(var(--primary),0.1)] overflow-hidden group"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] animate-scan-line pointer-events-none opacity-20" />
            
            <div className="bg-[#0a0a0a] rounded-[2rem] p-10 border border-white/5 relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">System Status: Live Telemetry</span>
                </div>
                <div className="px-4 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest">
                  Protocolo ACLS Ativo
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {[
                  { label: 'FC', val: '112', unit: 'bpm', color: 'text-primary' },
                  { label: 'PA', val: '90/60', unit: 'mmHg', color: 'text-warning' },
                  { label: 'SpO₂', val: '92', unit: '%', color: 'text-warning' },
                  { label: 'FR', val: '24', unit: 'irpm', color: 'text-destructive' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3 opacity-50">{stat.label}</span>
                    <span className={cn("text-5xl md:text-6xl font-black tabular-nums tracking-tighter transition-all group-hover:scale-110", stat.color)}>{stat.val}</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase mt-2 tracking-widest">{stat.unit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-white/5 flex justify-center gap-12 opacity-30">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Rigor Clínico</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Latência Zero</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Baseado em Evidências</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;