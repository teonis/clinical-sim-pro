import React, { useState } from "react";
import { SPECIALTIES, DIFFICULTIES, StartParams } from "@/types/simulation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2, PlayCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface StartGameProps {
  onStart: (params: StartParams) => void;
  isLoading: boolean;
}

const StartGame: React.FC<StartGameProps> = ({ onStart, isLoading }) => {
  const [specialty, setSpecialty] = useState(() => {
    const saved = localStorage.getItem("simulamed_specialty");
    return saved && SPECIALTIES.includes(saved) ? saved : SPECIALTIES[0];
  });
  const [difficulty, setDifficulty] = useState(() => {
    const saved = localStorage.getItem("simulamed_difficulty");
    return saved && DIFFICULTIES.includes(saved) ? saved : DIFFICULTIES[0];
  });
  const [customCase, setCustomCase] = useState("");

  const getMultiplierLabel = (d: string) => {
    switch (d) {
      case "ESTUDANTE": return "XP x1.0";
      case "RESIDENTE": return "XP x1.5";
      case "ESPECIALISTA": return "XP x2.5";
      default: return "";
    }
  };

  const handleStart = () => {
    localStorage.setItem("simulamed_specialty", specialty);
    localStorage.setItem("simulamed_difficulty", difficulty);
    let finalSpecialty = specialty;
    if (specialty === "ALEATÓRIO") {
      const valid = SPECIALTIES.filter((s) => s !== "ALEATÓRIO");
      finalSpecialty = valid[Math.floor(Math.random() * valid.length)];
    }
    onStart({ especialidade: finalSpecialty, dificuldade: difficulty, caso_especifico: customCase });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto py-4"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Iniciar Plantão</h1>
          <p className="text-muted-foreground mt-1 font-medium">Configure seu cenário de simulação clínica.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
          <ShieldCheck className="h-4 w-4 text-secondary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Ambiente Seguro
          </span>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-10 relative overflow-hidden group">
        <div className="grid md:grid-cols-2 gap-10 relative">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Especialidade Clínica
              </label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border text-base font-bold focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card">
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s} className="font-bold py-3 transition-colors">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Nível de Proficiência
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`h-20 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                      difficulty === d
                        ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                        : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50 hover:border-border transition-all"
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-bold tracking-tight">{d}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${difficulty === d ? "opacity-100" : "opacity-40"}`}>
                      {getMultiplierLabel(d)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8 flex flex-col">
            <div className="space-y-3 flex-1">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Contexto Adicional (Opcional)
              </label>
              <Textarea
                className="h-full min-h-[140px] rounded-xl bg-muted/30 border-border p-4 font-medium resize-none focus:ring-primary/20"
                value={customCase}
                onChange={(e) => setCustomCase(e.target.value)}
                placeholder="Ex: Paciente 45 anos, dor precordial típica, tabagista, HAS..."
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading}
              size="lg"
              className="h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/10 group hover:translate-y-[-2px] active:translate-y-0 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> 
                  <span>Preparando Sala...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="h-5 w-5 mr-2" /> 
                  INICIAR SIMULAÇÃO <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Casos Clínicos", val: "1.2k+" },
          { label: "Médicos Ativos", val: "4.5k+" },
          { label: "Diretrizes", val: "150+" }
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stat.val}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StartGame;
