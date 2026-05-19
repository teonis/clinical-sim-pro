import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  Target, 
  LayoutGrid, 
  ArrowLeft,
  Play,
  CheckCircle2,
  Circle
} from "lucide-react";
import { trainingCases, TrainingCase } from "@/data/trainingCases";
import { trainingTracks, TrainingTrack } from "@/data/trainingTracks";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { StartParams } from "@/types/simulation";

interface TrainingTabProps {
  onStartGame: (params: StartParams) => void;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ onStartGame }) => {
  const [selectedTrack, setSelectedTrack] = useState<TrainingTrack | null>(null);

  const handleStartCase = (tCase: TrainingCase) => {
    onStartGame({
      especialidade: tCase.specialty.split(" / ")[0].toUpperCase(),
      dificuldade: tCase.level,
      caso_especifico: tCase.initialScenario
    });
  };

  if (selectedTrack) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <button 
          onClick={() => setSelectedTrack(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar para Treinamentos</span>
        </button>

        <div className="bg-card rounded-[2.5rem] border border-border p-10 relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-4xl font-black text-foreground tracking-tight uppercase leading-none">{selectedTrack.title}</h2>
                <p className="text-muted-foreground mt-4 text-lg font-medium">{selectedTrack.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                  <Target className="h-4 w-4" /> Objetivo Pedagógico
                </div>
                <p className="text-sm text-foreground leading-relaxed">{selectedTrack.objective}</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-2xl p-6 h-fit min-w-[240px] border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                  <span>Progresso da Trilha</span>
                  <span>{selectedTrack.progress}%</span>
                </div>
                <Progress value={selectedTrack.progress} className="h-2" />
                <Button 
                  className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs"
                  onClick={() => {
                    // Start first case if not started
                    if (selectedTrack.cases.length > 0) {
                      const firstCase = trainingCases.find(c => c.id === selectedTrack.cases[0].id);
                      if (firstCase) handleStartCase(firstCase);
                    }
                  }}
                >
                  Continuar Trilha
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" /> Casos da Trilha
          </h3>
          <div className="space-y-3">
            {selectedTrack.cases.map((cRef, idx) => {
              const fullCase = trainingCases.find(tc => tc.id === cRef.id);
              if (!fullCase) return null;
              
              return (
                <div 
                  key={cRef.id}
                  className="bg-card rounded-2xl border border-border p-6 flex items-center justify-between group hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center">
                      {cRef.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      ) : cRef.status === "IN_PROGRESS" ? (
                        <Circle className="h-6 w-6 text-primary animate-pulse" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{idx + 1}. {fullCase.title}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                        {fullCase.specialty} · {fullCase.duration}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="rounded-full h-10 w-10 p-0 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleStartCase(fullCase)}
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black text-foreground tracking-tight uppercase leading-none">Treinamentos</h1>
          <p className="text-muted-foreground mt-4 text-xl font-medium tracking-tight">
            Desenvolva seu raciocínio clínico com casos estruturados e trilhas de prática progressiva.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Casos Estruturados
        </h3>
        <p className="text-sm text-muted-foreground -mt-4">Treine cenários clínicos específicos com objetivos claros e competências bem definidas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingCases.map((tCase, idx) => (
            <motion.div 
              key={tCase.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card rounded-[2rem] border border-border p-8 flex flex-col hover:shadow-xl hover:border-primary/20 transition-all group"
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                    {tCase.specialty}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {tCase.level}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{tCase.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                  {tCase.description}
                </p>
                
                <div className="space-y-2 mb-8">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Competências:</p>
                  <div className="flex flex-wrap gap-2">
                    {tCase.competencies.map((comp, i) => (
                      <span key={i} className="text-[10px] font-bold text-foreground/70 bg-muted px-2 py-1 rounded-lg">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{tCase.duration}</span>
                </div>
                <Button 
                  onClick={() => handleStartCase(tCase)}
                  className="rounded-xl h-10 px-6 font-bold uppercase tracking-widest text-[10px] group-hover:translate-x-1 transition-transform"
                >
                  Iniciar Caso <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-8 pb-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" /> Trilhas de Treinamento
        </h3>
        <p className="text-sm text-muted-foreground -mt-4">Siga jornadas progressivas de prática clínica e desenvolva competências essenciais com mais consistência.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trainingTracks.map((track, idx) => (
            <motion.div 
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-card rounded-[2.5rem] border border-border p-10 flex flex-col md:flex-row gap-8 hover:shadow-2xl hover:border-primary/30 transition-all group overflow-hidden relative"
            >
              {/* Subtle background icon */}
              <BookOpen className="absolute -bottom-4 -right-4 h-32 w-32 text-primary/5 -rotate-12 group-hover:scale-110 transition-transform" />
              
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{track.title}</h4>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{track.caseCount} Casos</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">·</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{track.level}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground font-medium leading-relaxed mb-6">
                  {track.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-muted-foreground">
                    <span>Progresso</span>
                    <span>{track.progress}%</span>
                  </div>
                  <Progress value={track.progress} className="h-1.5" />
                </div>
              </div>

              <div className="flex flex-col justify-end relative z-10">
                <Button 
                  onClick={() => setSelectedTrack(track)}
                  variant="outline"
                  className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg"
                >
                  Ver Trilha <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TrainingTab;
