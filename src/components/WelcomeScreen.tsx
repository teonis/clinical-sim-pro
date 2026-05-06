import React from "react";
import { HeartPulse, GraduationCap, Trophy, ArrowRight, Activity, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-brand-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md text-center relative"
      >
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 blur-[100px] -z-10" />

        <motion.div variants={itemVariants} className="mb-8">
          <div className="w-24 h-24 mx-auto lcd-screen rounded-3xl flex items-center justify-center hud-border shadow-[0_0_30px_rgba(0,255,148,0.1)] relative group">
            <Activity className="h-12 w-12 text-primary lcd-glow transition-transform group-hover:scale-110 duration-500" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse-vital" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="text-6xl font-display font-black mb-1 text-primary lcd-glow tracking-tighter">BOLUS</h1>
          <p className="text-xs font-mono-vital text-muted-foreground tracking-widest uppercase mb-8 opacity-70">
            NIGHT PROTOCOL // v4.0.0
          </p>
          <p className="text-base text-muted-foreground mb-10 leading-relaxed font-medium px-4">
            Aprimore sua tomada de decisão clínica com simulações realistas e feedback instantâneo.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3 mb-10">
          {[
            { icon: HeartPulse, title: "Casos Dinâmicos", desc: "Cenários que evoluem com suas decisões" },
            { icon: GraduationCap, title: "Preceptor Virtual", desc: "Feedback detalhado a cada conduta" },
            { icon: Trophy, title: "Gamificação", desc: "Conquistas e ranking para motivar" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-secondary/40 backdrop-blur-sm p-4 rounded-2xl border border-border/50 text-left hover:border-primary/40 hover:bg-secondary/60 transition-all group cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono-vital font-bold text-sm mb-0.5 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button 
            onClick={onContinue} 
            size="lg"
            className="w-full h-16 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            aria-label="Iniciar simulação"
          >
            INICIAR PROTOCOLO <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="flex items-center justify-center gap-2 mt-8 py-2 px-4 bg-secondary/30 rounded-full w-fit mx-auto border border-border/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold text-muted-foreground font-mono-vital uppercase tracking-wide">
              20+ ESPECIALIDADES DISPONÍVEIS
            </span>
          </div>

          <div className="flex items-start gap-2 max-w-[280px] mx-auto mt-8 text-left opacity-60 hover:opacity-100 transition-opacity">
            <ShieldAlert className="h-3 w-3 text-warning shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-snug font-mono-vital">
              FERRAMENTA EXCLUSIVAMENTE EDUCACIONAL. NÃO USAR PARA CONDUTA CLÍNICA REAL.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
