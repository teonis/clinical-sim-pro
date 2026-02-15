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
          <div className="w-20 h-20 mx-auto lcd-screen rounded-sm flex items-center justify-center hud-border">
            <Activity className="h-10 w-10 text-primary lcd-glow" />
          </div>
        </div>

        <h1 className="text-4xl font-display font-black mb-1 text-primary lcd-glow tracking-tighter">BOLUS</h1>
        <p className="text-xs font-mono-vital text-muted-foreground tracking-widest uppercase mb-6">NIGHT PROTOCOL // v3.0</p>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Aprimore sua tomada de decisão clínica com simulações realistas e feedback instantâneo.
        </p>

        <div className="space-y-2 mb-8">
          <div className="lcd-screen p-4 rounded-sm hud-border text-left hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 hud-border">
                <HeartPulse className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-mono-vital font-bold text-sm mb-1 text-foreground">Casos Dinâmicos</h3>
                <p className="text-xs text-muted-foreground">Cenários que evoluem com suas decisões</p>
              </div>
            </div>
          </div>

          <div className="lcd-screen p-4 rounded-sm hud-border text-left hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 hud-border">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-mono-vital font-bold text-sm mb-1 text-foreground">Preceptor Virtual</h3>
                <p className="text-xs text-muted-foreground">Feedback detalhado a cada conduta</p>
              </div>
            </div>
          </div>

          <div className="lcd-screen p-4 rounded-sm hud-border text-left hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 hud-border">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-mono-vital font-bold text-sm mb-1 text-foreground">Gamificação</h3>
                <p className="text-xs text-muted-foreground">Conquistas e ranking para motivar</p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={onContinue} className="w-full py-6 text-base font-bold rounded-sm">
          Iniciar Protocolo <ArrowRight className="h-5 w-5 ml-2" />
        </Button>

        <p className="text-xs text-muted-foreground mt-6 font-mono-vital">
          16+ especialidades médicas disponíveis
        </p>

        <p className="text-[10px] text-muted-foreground/60 mt-4 leading-relaxed font-mono-vital">
          ⚠️ Ferramenta exclusivamente educacional. Não usar para conduta clínica real.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
