import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stethoscope, Trophy, FileText, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Stethoscope,
    title: "Preceptor Virtual com IA",
    description:
      "Cada caso clínico é conduzido por um preceptor inteligente que reage às suas decisões em tempo real. Ele avalia suas condutas, dá feedbacks detalhados e simula a evolução do paciente de forma realista.",
    color: "from-primary to-primary/70",
  },
  {
    icon: Trophy,
    title: "Sistema de Notas e Ranking",
    description:
      "Suas decisões clínicas são pontuadas de 0 a 10. Acerte diagnósticos, peça exames pertinentes e prescreva corretamente para manter sua nota alta. Acompanhe seu progresso no histórico e suba no ranking.",
    color: "from-accent to-accent/70",
  },
  {
    icon: FileText,
    title: "Crie Casos Específicos",
    description:
      'Além dos casos gerados automaticamente, você pode descrever um cenário personalizado no campo "Caso Específico". Ideal para estudar temas de provas, revisar casos reais ou treinar situações difíceis.',
    color: "from-destructive to-destructive/70",
  },
];

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("simulamed_onboarding_done", "true");
      onComplete();
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-8 bg-primary" : i < currentStep ? "w-2 bg-primary/50" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
          >
            <div className={`bg-gradient-to-br ${step.color} p-12 flex items-center justify-center`}>
              <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg">
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="p-8 text-center">
              <h2 className="text-xl font-bold text-foreground mb-3">{step.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>

              <div className="mt-8 flex gap-3">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1 py-6"
                  >
                    Voltar
                  </Button>
                )}
                <Button onClick={handleNext} className="flex-1 py-6 font-bold">
                  {currentStep < steps.length - 1 ? (
                    <>
                      Próximo <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Começar! <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem("simulamed_onboarding_done", "true");
                  onComplete();
                }}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Pular tutorial
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
