import React from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Shield, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onStart: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse transition-all duration-1000 delay-500" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">v5.0 Night Protocol</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-7xl md:text-9xl font-black mb-6 tracking-tighter"
          >
            BOLUS
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-4xl font-medium text-muted-foreground mb-8 tracking-tight italic"
          >
            Sua dose de realidade clínica
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            Simulador clínico de alto rigor focado em medicina de emergência. 
            Colocamos você em cenários críticos onde o tempo corre contra a vida, 
            treinando seu reflexo clínico com um motor fisiológico dinâmico.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              onClick={onStart}
              className="h-16 px-8 text-lg font-bold rounded-xl shadow-2xl hover:scale-105 transition-all group w-full sm:w-auto"
            >
              INICIAR TREINAMENTO <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="h-16 px-8 text-lg font-bold rounded-xl w-full sm:w-auto border-2"
            >
              VER PROTOCOLOS
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;