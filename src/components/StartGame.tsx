import React, { useState } from "react";
import { SPECIALTIES, DIFFICULTIES, StartParams } from "@/types/simulation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Loader2, ShieldCheck, Activity, UserPlus, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StartGameProps {
  onStart: (params: StartParams) => void;
  isLoading: boolean;
}

const StartGame: React.FC<StartGameProps> = ({ onStart, isLoading }) => {
  const [specialty, setSpecialty] = useState(() => {
    const saved = localStorage.getItem("pulzu_specialty");
    return saved && SPECIALTIES.includes(saved) ? saved : SPECIALTIES[0];
  });
  const [difficulty, setDifficulty] = useState(() => {
    const saved = localStorage.getItem("pulzu_difficulty");
    return saved && DIFFICULTIES.includes(saved) ? saved : DIFFICULTIES[0];
  });
  const [customCase, setCustomCase] = useState("");

  const handleStart = () => {
    localStorage.setItem("pulzu_specialty", specialty);
    localStorage.setItem("pulzu_difficulty", difficulty);
    let finalSpecialty = specialty;
    if (specialty === "ALEATÓRIO") {
      const valid = SPECIALTIES.filter((s) => s !== "ALEATÓRIO");
      finalSpecialty = valid[Math.floor(Math.random() * valid.length)];
    }
    onStart({ especialidade: finalSpecialty, dificuldade: difficulty, caso_especifico: customCase });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight uppercase leading-none">Iniciar Simulação</h1>
          <p className="text-muted-foreground mt-3 text-lg font-medium">Configure as diretrizes do próximo cenário clínico.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Protocolo Seguro</span>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-2xl rounded-[3rem] border border-white/20 p-12 relative overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Especialidade Médica</label>
              </div>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="h-20 rounded-2xl bg-white/50 border border-border/50 text-base font-bold tracking-tight focus:ring-4 focus:ring-primary/10 px-8 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card">
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s} className="font-bold py-3 uppercase text-xs tracking-widest">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1">
                <UserPlus className="h-3.5 w-3.5 text-primary" />
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nível de Proficiência</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm",
                      difficulty === d
                        ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105 z-10"
                        : "bg-white/50 text-muted-foreground border-border/50 hover:border-primary/30 hover:bg-white"
                    )}
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase">{d}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 ml-1">
                <Info className="h-3.5 w-3.5 text-primary" />
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contexto (Opcional)</label>
              </div>
              <Textarea
                className="h-full min-h-[220px] rounded-[2rem] bg-white/50 border border-border/50 p-8 font-medium resize-none focus:ring-4 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground/20 text-base tracking-tight leading-relaxed transition-all shadow-inner"
                value={customCase}
                onChange={(e) => setCustomCase(e.target.value)}
                placeholder="EX: PACIENTE COM DOR PRECORDIAL..."
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading}
              size="lg"
              className="h-20 text-lg font-black rounded-2xl transition-all bg-primary text-primary-foreground uppercase tracking-[0.15em] shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-3" /> 
                  Carregando...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-3 fill-current" /> 
                  Iniciar Simulação
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StartGame;