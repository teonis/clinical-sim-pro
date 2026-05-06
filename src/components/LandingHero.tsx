import React from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Shield, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onStart: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse transition-all duration-1000 delay-500" />
        
        {/* Abstract Clinical Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-10 backdrop-blur-sm"
          >
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Protocolo de Emergência v6.2</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-8xl md:text-[12rem] font-black mb-6 tracking-tighter leading-none select-none"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40">BOLUS</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight"
          >
            Sua dose de realidade clínica
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto font-medium"
          >
            O simulador de emergência mais rigoroso do mercado. 
            Ambientes críticos, motor fisiológico dinâmico e 
            <span className="text-foreground font-bold"> debriefing implacável</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button 
              size="lg" 
              onClick={onStart}
              className="h-20 px-12 text-xl font-black rounded-2xl shadow-[0_20px_50px_rgba(var(--primary),0.3)] hover:shadow-[0_20px_60px_rgba(var(--primary),0.5)] hover:-translate-y-1 transition-all group w-full sm:w-auto bg-primary text-primary-foreground"
            >
              INICIAR TREINAMENTO <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="h-20 px-12 text-xl font-bold rounded-2xl w-full sm:w-auto border-2 backdrop-blur-md bg-background/30 hover:bg-background/50 transition-all"
            >
              EXPLORAR CASOS
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500"
          >
            <div className="flex items-center gap-2 font-black tracking-widest text-sm uppercase">
              <Shield className="h-5 w-5" /> Protocolos Reais
            </div>
            <div className="flex items-center gap-2 font-black tracking-widest text-sm uppercase">
              <Zap className="h-5 w-5" /> Resposta Instantânea
            </div>
            <div className="flex items-center gap-2 font-black tracking-widest text-sm uppercase">
              <BookOpen className="h-5 w-5" /> Baseado em Guidelines
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;