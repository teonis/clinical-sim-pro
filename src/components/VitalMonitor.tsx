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

const statusBorder: Record<PatientStatus, string> = {
  stable: 'border-primary/30',
  warning: 'border-warning/30',
  critical: 'border-critical/30',
};

const statusDot: Record<PatientStatus, string> = {
  stable: 'bg-primary lcd-glow',
  warning: 'bg-warning',
  critical: 'bg-critical animate-pulse-vital',
};

const statusLabel: Record<PatientStatus, string> = {
  stable: 'ESTÁVEL',
  warning: 'ATENÇÃO',
  critical: 'CRÍTICO',
};

const statusBadge: Record<PatientStatus, string> = {
  stable: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  critical: 'bg-critical/10 text-critical',
};

const VitalMonitor = ({ fc, pas, pad, satO2, fr, status }: VitalMonitorProps) => {
  const getVitalColor = (type: string) => {
    switch (type) {
      case 'fc': return fc > 100 || fc < 60 ? 'text-critical' : 'text-primary';
      case 'pa': return pas > 140 || pad > 90 || pas < 90 ? 'text-critical' : 'text-primary';
      case 'satO2': return satO2 < 92 ? 'text-critical' : satO2 < 95 ? 'text-warning' : 'text-primary';
      case 'fr': return fr > 20 || fr < 12 ? 'text-warning' : 'text-primary';
      default: return 'text-primary';
    }
  };

  return (
    <div 
      className={cn('lcd-screen rounded-sm p-3 transition-colors duration-500', statusBorder[status])}
      role="region" 
      aria-label="Monitor de Sinais Vitais"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', statusDot[status])} aria-hidden="true" />
          <span className="text-[10px] font-mono-vital font-medium uppercase tracking-widest text-primary/60">
            MONITOR v2.4
          </span>
        </div>
        <span 
          className={cn(
            'text-[10px] font-mono-vital font-bold uppercase px-2 py-0.5 rounded-sm',
            statusBadge[status],
          )}
          aria-live="polite"
        >
          {statusLabel[status]}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <VitalItem
          icon={<motion.div animate={{ scale: fc > 100 ? [1, 1.2, 1] : 1 }} transition={{ repeat: Infinity, duration: 60/fc }}><Heart className="h-3.5 w-3.5" /></motion.div>}
          label="FC"
          value={`${fc}`}
          unit="bpm"
          color={getVitalColor('fc')}
          description={`${fc} batimentos por minuto`}
        />
        <VitalItem
          icon={<Activity className="h-3.5 w-3.5" />}
          label="PA"
          value={`${pas}/${pad}`}
          unit="mmHg"
          color={getVitalColor('pa')}
          description={`Pressão arterial ${pas} por ${pad} milímetros de mercúrio`}
        />
        <VitalItem
          icon={<Wind className="h-3.5 w-3.5" />}
          label="SpO₂"
          value={`${satO2}`}
          unit="%"
          color={getVitalColor('satO2')}
          description={`Saturação de oxigênio em ${satO2} por cento`}
        />
        <VitalItem
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="FR"
          value={`${fr}`}
          unit="irpm"
          color={getVitalColor('fr')}
          description={`Frequência respiratória em ${fr} incursões por minuto`}
        />
      </div>
    </div>
  );
};

const VitalItem = ({ icon, label, value, unit, color, description }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  description: string;
}) => (
  <div className="flex flex-col items-center gap-0.5" aria-label={description}>
    <div className={cn('flex items-center gap-1', color)}>
      {icon}
      <span className="text-[10px] font-mono-vital font-medium uppercase tracking-wider text-muted-foreground" aria-hidden="true">{label}</span>
    </div>
    <span className={cn('font-mono-vital text-lg font-bold leading-none lcd-glow', color)} aria-hidden="true">{value}</span>
    <span className="text-[9px] font-mono-vital text-muted-foreground" aria-hidden="true">{unit}</span>
  </div>
);

export default VitalMonitor;
