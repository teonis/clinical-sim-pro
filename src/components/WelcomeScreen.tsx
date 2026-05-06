import React from "react";
import { HeartPulse, GraduationCap, Trophy, ArrowRight, Activity, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg text-center"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <div className="w-16 h-16 mx-auto bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm group">
            <Activity className="h-8 w-8 text-primary transition-transform group-hover:scale-110 duration-300" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="text-5xl font-bold mb-2 text-foreground tracking-tight">BOLUS</h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.3em] mb-10 opacity-60">
            Clinical Simulator v5.0
          </p>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-md mx-auto">
            Aprimore sua tomada de decisão clínica com simulações realistas e feedback acadêmico robusto.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 mb-12">
          {[
            { icon: HeartPulse, title: "Casos Reais", desc: "Simulações baseadas em evidências clínicas" },
            { icon: GraduationCap, title: "Mentor IA", desc: "Feedback pedagógico sobre cada conduta" },
            { icon: Trophy, title: "Protocolos", desc: "Avaliação por aderência aos guidelines" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-card border border-border p-5 rounded-xl text-left hover:shadow-md transition-all group flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-snug">{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8">
          <Button 
            onClick={onContinue} 
            size="lg"
            className="w-full h-14 text-base font-bold rounded-lg shadow-sm hover:translate-y-[-2px] active:translate-y-0 transition-all bg-primary text-primary-foreground group"
          >
            INICIAR SIMULAÇÃO <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="flex flex-col items-center gap-6 opacity-60">
            <div className="flex items-center gap-2 py-1.5 px-3 bg-muted rounded-full text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Ambiente Educativo Controlado</span>
            </div>

            <div className="flex items-start gap-2 max-w-xs text-left">
              <ShieldAlert className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-normal">
                FERRAMENTA EXCLUSIVAMENTE EDUCACIONAL. NÃO SUBSTITUI O JULGAMENTO CLÍNICO PROFISSIONAL OU DIRETRIZES INSTITUCIONAIS.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
