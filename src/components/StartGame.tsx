import React, { useState } from "react";
import { SPECIALTIES, DIFFICULTIES, StartParams } from "@/types/simulation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, HeartPulse, GraduationCap, Trophy, ArrowRight, Loader2 } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Iniciar Plantão</h1>
          <p className="text-muted-foreground mt-1">Pronto para o próximo caso clínico?</p>
        </div>
      </div>

      <div className="bg-card rounded-sm shadow-sm border border-border p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Especialidade
              </label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Nível de Dificuldade
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`h-16 rounded-sm border transition-all flex flex-col items-center justify-center ${
                      difficulty === d
                        ? d === "ESPECIALISTA"
                          ? "bg-destructive/10 text-destructive border-destructive/20 shadow-sm"
                          : "bg-primary/10 text-primary border-primary/20 shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:bg-secondary hover:border-border"
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-bold tracking-tight">{d}</span>
                    <span className={`text-[9px] font-mono-vital uppercase tracking-wider mt-0.5 ${difficulty === d ? "opacity-100 font-bold" : "opacity-60"}`}>
                      {getMultiplierLabel(d)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Caso Específico (Opcional)
              </label>
              <Textarea
                rows={3}
                value={customCase}
                onChange={(e) => setCustomCase(e.target.value)}
                placeholder="Ex: Paciente 45 anos, dor abdominal súbita..."
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full py-6 text-sm uppercase tracking-wider font-bold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparando Sala...
                </>
              ) : (
                <>
                  Iniciar Plantão <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartGame;
