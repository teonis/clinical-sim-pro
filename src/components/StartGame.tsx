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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 max-w-5xl mx-auto py-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter">Iniciar Plantão</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Configure seu cenário de simulação clínica de alto rigor.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-md">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            Ambiente Certificado
          </span>
        </div>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/5 p-8 md:p-12 relative overflow-hidden group">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="grid lg:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">
                Especialidade Clínica
              </label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="h-16 rounded-2xl bg-white/5 border-white/10 text-lg font-bold focus:ring-primary/20 transition-all hover:bg-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#0a0a0a] text-white">
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s} className="font-bold py-4 focus:bg-primary focus:text-primary-foreground transition-colors cursor-pointer">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">
                Nível de Proficiência
              </label>
              <div className="grid grid-cols-3 gap-4">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group/btn ${
                      difficulty === d
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_10px_30px_rgba(var(--primary),0.3)]"
                        : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    <span className="text-xs font-black tracking-widest uppercase">{d}</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] opacity-60", difficulty === d ? "text-primary-foreground" : "text-primary")}>
                      {getMultiplierLabel(d).split(' ')[1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10 flex flex-col">
            <div className="space-y-4 flex-1">
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-[0.3em] ml-1">
                Contexto Adicional (Personalizado)
              </label>
              <Textarea
                className="h-full min-h-[160px] rounded-2xl bg-white/5 border-white/10 p-6 font-medium resize-none focus:ring-primary/20 transition-all hover:bg-white/10 text-white placeholder:text-white/20"
                value={customCase}
                onChange={(e) => setCustomCase(e.target.value)}
                placeholder="Ex: Paciente 45 anos, dor precordial típica, tabagista, HAS..."
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading}
              size="lg"
              className="h-20 text-xl font-black rounded-2xl shadow-2xl shadow-primary/20 group hover:-translate-y-1 active:scale-95 transition-all bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-3" /> 
                  <span className="tracking-widest">Sincronizando...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="h-6 w-6 mr-3" /> 
                  ADMITIR PACIENTE <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Cenários Disponíveis", val: "1.2k+", icon: BookOpen },
          { label: "Sessões Concluídas", val: "45k+", icon: ShieldCheck },
          { label: "Guidelines Ativos", val: "150+", icon: Activity }
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center gap-5 hover:bg-white/[0.05] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stat.val}</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StartGame;
