import React from "react";
import { HeartPulse, GraduationCap, Trophy, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center animate-in fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto gradient-brand rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <Activity className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-display font-bold mb-1 gradient-brand-text">SIMULAMED</h1>
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-6">By Time Rocha</p>
        <p className="text-base text-muted-foreground mb-8 leading-relaxed">
          Aprimore sua tomada de decisão clínica com simulações realistas e feedback instantâneo.
        </p>

        <div className="space-y-3 mb-8">
          <div className="bg-card p-4 rounded-xl border border-border text-left hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center shrink-0">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Casos Dinâmicos</h3>
                <p className="text-xs text-muted-foreground">Cenários que evoluem com suas decisões</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border text-left hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Preceptor Virtual</h3>
                <p className="text-xs text-muted-foreground">Feedback detalhado a cada conduta</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border text-left hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Gamificação</h3>
                <p className="text-xs text-muted-foreground">Conquistas e ranking para motivar</p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={onContinue} className="w-full py-6 text-base font-semibold shadow-lg gradient-brand border-0 hover:opacity-90 transition-opacity">
          Iniciar Treinamento <ArrowRight className="h-5 w-5 ml-2" />
        </Button>

        <p className="text-xs text-muted-foreground mt-6">
          16+ especialidades médicas disponíveis
        </p>

        <p className="text-[10px] text-muted-foreground/60 mt-4 leading-relaxed">
          ⚠️ Ferramenta exclusivamente educacional. Não usar para conduta clínica real.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
