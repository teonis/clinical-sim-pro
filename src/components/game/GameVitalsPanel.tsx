import React from "react";
import { motion } from "framer-motion";
import { Activity, Microscope, Pill, ChevronRight, CheckCircle, Skull } from "lucide-react";
import VitalMonitor from "@/components/VitalMonitor";
import { Button } from "@/components/ui/button";
import { SimulationState } from "@/types/simulation";
import { cn } from "@/lib/utils";

interface GameVitalsPanelProps {
  vitals: { hr: number; sbp: number; dbp: number; spo2: number; rr: number };
  vitalStatus: 'stable' | 'warning' | 'critical';
  gameState: SimulationState;
  isGameOver: boolean;
  onAction: (id: string, type: string, text?: string) => void;
  onRestart: () => void;
  onExit: () => void;
  formattedTime: string;
}

const GameVitalsPanel: React.FC<GameVitalsPanelProps> = ({
  vitals,
  vitalStatus,
  gameState,
  isGameOver,
  onAction,
  onRestart,
  onExit,
  formattedTime,
}) => {
  const patientState = gameState.status_simulacao.estado_paciente;

  return (
    <div className="hidden lg:flex flex-col w-[35%] bg-card">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto">
        <VitalMonitor 
          fc={vitals.hr} 
          pas={vitals.sbp} 
          pad={vitals.dbp} 
          satO2={vitals.spo2} 
          fr={vitals.rr} 
          status={vitalStatus} 
        />

        {!isGameOver && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" /> Ações Sugeridas
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {gameState.opcoes_interacao.filter(opt => opt.tipo !== "LIVRE").slice(0, 5).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onAction(opt.id, opt.tipo, opt.texto)}
                  className="group bg-muted border border-transparent p-4 rounded-xl flex items-center justify-between hover:border-primary/20 transition-all hover:bg-primary/5"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      opt.tipo === "EXAME" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    )}>
                      {opt.tipo === "EXAME" ? <Microscope className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{opt.tipo}</p>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{opt.texto}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className={cn(
              "p-8 rounded-[2rem] border flex flex-col items-center text-center space-y-4 shadow-sm",
              patientState === "CURADO" ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"
            )}>
              {patientState === "CURADO" ? <CheckCircle className="h-16 w-16 text-primary" /> : <Skull className="h-16 w-16 text-destructive" />}
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">{patientState === "CURADO" ? "Sucesso" : "Óbito"}</h2>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Sessão de simulação concluída.</p>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Score</p>
                  <p className="text-3xl font-black text-primary tabular-nums">{gameState.status_simulacao.current_score.toFixed(1)}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tempo</p>
                  <p className="text-3xl font-black text-foreground tabular-nums">{formattedTime}</p>
                </div>
              </div>
            </div>
            
            <Button onClick={onRestart} className="w-full h-14 rounded-xl text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20">Novo Caso</Button>
            <Button variant="outline" onClick={onExit} className="w-full h-14 rounded-xl text-xs font-bold uppercase tracking-widest border border-border">Sair</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameVitalsPanel;
