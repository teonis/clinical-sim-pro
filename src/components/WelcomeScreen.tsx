import React from "react";
import { Stethoscope, HeartPulse, GraduationCap, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center animate-in fade-in">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Stethoscope className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3 text-foreground">Rocha Med Academy</h1>
        <p className="text-base text-muted-foreground mb-8 leading-relaxed">
          Aprimore sua tomada de decisão clínica com simulações realistas e feedback instantâneo.
        </p>

        <div className="space-y-4 mb-8">
          <div className="bg-card p-4 rounded-xl border border-border text-left">
            <div className="flex items-start gap-3">
              <HeartPulse className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Casos Dinâmicos</h3>
                <p className="text-xs text-muted-foreground">Cenários que evoluem com suas decisões</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border text-left">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Preceptor Virtual</h3>
                <p className="text-xs text-muted-foreground">Feedback detalhado a cada conduta</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border text-left">
            <div className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Gamificação</h3>
                <p className="text-xs text-muted-foreground">Conquistas e ranking para motivar</p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={onContinue} className="w-full py-6 text-base font-semibold shadow-lg">
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
