import { Heart, Activity, Wind, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type PatientStatus = 'stable' | 'warning' | 'critical';

interface VitalMonitorProps {
  fc: number;
  pas: number;
  pad: number;
  satO2: number;
  fr: number;
  status: PatientStatus;
}

const statusBadge: Record<PatientStatus, string> = {
  stable: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusLabel: Record<PatientStatus, string> = {
  stable: 'Estável',
  warning: 'Instável',
  critical: 'Crítico',
};

const VitalMonitor = ({ fc, pas, pad, satO2, fr, status }: VitalMonitorProps) => {
  const getVitalColor = (type: string) => {
    switch (type) {
      case 'fc': return fc > 100 || fc < 60 ? 'text-destructive' : 'text-primary';
      case 'pa': return pas > 140 || pad > 90 || pas < 90 ? 'text-destructive' : 'text-primary';
      case 'satO2': return satO2 < 92 ? 'text-destructive' : satO2 < 95 ? 'text-warning' : 'text-primary';
      case 'fr': return fr > 20 || fr < 12 ? 'text-warning' : 'text-primary';
      default: return 'text-primary';
    }
  };

  return (
    <div 
      className="bg-card border border-border rounded-xl p-4 shadow-sm transition-all"
      role="region" 
      aria-label="Monitor de Sinais Vitais"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-vital" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Monitor Digital
          </span>
        </div>
        <span 
          className={cn(
            'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border',
            statusBadge[status],
          )}
          aria-live="polite"
        >
          {statusLabel[status]}
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <VitalItem
          icon={<motion.div animate={{ scale: fc > 100 ? [1, 1.1, 1] : 1 }} transition={{ repeat: Infinity, duration: 60/fc }}><Heart className="h-4 w-4" /></motion.div>}
          label="Frequência Cardíaca"
          shortLabel="FC"
          value={`${fc}`}
          unit="bpm"
          color={getVitalColor('fc')}
        />
        <VitalItem
          icon={<Activity className="h-4 w-4" />}
          label="Pressão Arterial"
          shortLabel="PA"
          value={`${pas}/${pad}`}
          unit="mmHg"
          color={getVitalColor('pa')}
        />
        <VitalItem
          icon={<Wind className="h-4 w-4" />}
          label="Saturação Oxigênio"
          shortLabel="SpO₂"
          value={`${satO2}`}
          unit="%"
          color={getVitalColor('satO2')}
        />
        <VitalItem
          icon={<Thermometer className="h-4 w-4" />}
          label="Freq. Respiratória"
          shortLabel="FR"
          value={`${fr}`}
          unit="irpm"
          color={getVitalColor('fr')}
        />
      </div>
    </div>
  );
};

const VitalItem = ({ icon, label, shortLabel, value, unit, color }: {
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
  value: string;
  unit: string;
  color: string;
}) => (
  <div className="bg-muted/30 rounded-lg p-3 border border-border/50 flex flex-col items-center text-center gap-1 group hover:border-primary/20 transition-colors">
    <div className={cn('flex items-center gap-1.5', color)}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{shortLabel}</span>
    </div>
    <div className="flex flex-col items-center">
      <span className={cn('text-2xl font-bold leading-tight tabular-nums', color)}>{value}</span>
      <span className="text-[9px] font-medium text-muted-foreground uppercase">{unit}</span>
    </div>
  </div>
);

export default VitalMonitor;
