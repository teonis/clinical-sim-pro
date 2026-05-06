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
    const saved = localStorage.getItem("simulamed_specialty");
    return saved && SPECIALTIES.includes(saved) ? saved : SPECIALTIES[0];
  });
  const [difficulty, setDifficulty] = useState(() => {
    const saved = localStorage.getItem("simulamed_difficulty");
    return saved && DIFFICULTIES.includes(saved) ? saved : DIFFICULTIES[0];
  });
  const [customCase, setCustomCase] = useState("");

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">Admissão de Paciente</h1>
          <p className="text-muted-foreground mt-4 text-xl font-medium tracking-tight">Configure as diretrizes do próximo cenário clínico.</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20 backdrop-blur-xl">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Ambiente de Simulação Segura</span>
        </div>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 p-12 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] -mr-48 -mt-48" />
        
        <div className="grid lg:grid-cols-2 gap-16 relative z-10">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3 ml-2">
                <Activity className="h-4 w-4 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Especialidade Médica</label>
              </div>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="h-20 rounded-2xl bg-black/40 border-white/5 text-lg font-black tracking-widest uppercase focus:ring-primary/20 transition-all hover:bg-white/5 px-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a] text-white overflow-hidden">
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s} className="font-black py-4 focus:bg-primary focus:text-black transition-colors cursor-pointer uppercase text-xs tracking-widest">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 ml-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Nível de Proficiência</label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 group/btn relative overflow-hidden",
                      difficulty === d
                        ? "bg-primary text-black border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                        : "bg-white/5 text-muted-foreground border-white/5 hover:border-white/20"
                    )}
                  >
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">{d}</span>
                    {difficulty === d && <motion.div layoutId="diff-glow" className="absolute inset-0 bg-white/10" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-12 flex flex-col">
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-3 ml-2">
                <Info className="h-4 w-4 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Contexto Adicional (Opcional)</label>
              </div>
              <Textarea
                className="h-full min-h-[220px] rounded-3xl bg-black/40 border-white/5 p-8 font-medium resize-none focus:ring-primary/20 transition-all hover:bg-white/5 text-white placeholder:opacity-20 uppercase text-[10px] tracking-widest leading-relaxed"
                value={customCase}
                onChange={(e) => setCustomCase(e.target.value)}
                placeholder="EX: PACIENTE 45 ANOS, DOR PRECORDIAL TÍPICA, TABAGISTA, HAS..."
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading}
              size="lg"
              className="h-24 text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/20 group hover:-translate-y-1 active:scale-95 transition-all bg-primary text-black uppercase tracking-[0.3em]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-4" /> 
                  Sincronizando...
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 mr-4 fill-black" /> 
                  Confirmar Admissão
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Cenários Ativos", val: "1.2k+", icon: Activity },
          { label: "Sessões Concluídas", val: "45k+", icon: ShieldCheck },
          { label: "Protocolos Reais", val: "150+", icon: Play }
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex items-center gap-6 group hover:bg-white/[0.05] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 transition-transform group-hover:scale-110">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-black text-white tracking-tighter">{stat.val}</div>
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-50">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StartGame;