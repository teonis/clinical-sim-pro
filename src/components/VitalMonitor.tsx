import { VitalSigns, PatientStatus } from '@/types/medical';
import { Heart, Activity, Wind, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VitalMonitorProps {
  vitals: VitalSigns;
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

const VitalMonitor = ({ vitals, status }: VitalMonitorProps) => {
  const getVitalColor = (type: string) => {
    switch (type) {
      case 'fc': return vitals.fc > 100 || vitals.fc < 60 ? 'text-critical' : 'text-primary';
      case 'pa': return vitals.pas > 140 || vitals.pad > 90 || vitals.pas < 90 ? 'text-critical' : 'text-primary';
      case 'satO2': return vitals.satO2 < 92 ? 'text-critical' : vitals.satO2 < 95 ? 'text-warning' : 'text-primary';
      case 'fr': return vitals.fr > 20 || vitals.fr < 12 ? 'text-warning' : 'text-primary';
      default: return 'text-primary';
    }
  };

  return (
    <div className={cn('lcd-screen rounded-sm p-3 transition-colors duration-500', statusBorder[status])}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', statusDot[status])} />
          <span className="text-[10px] font-mono-vital font-medium uppercase tracking-widest text-primary/60">
            MONITOR v2.4
          </span>
        </div>
        <span className={cn(
          'text-[10px] font-mono-vital font-bold uppercase px-2 py-0.5 rounded-sm',
          status === 'stable' && 'bg-primary/10 text-primary',
          status === 'warning' && 'bg-warning/10 text-warning',
          status === 'critical' && 'bg-critical/10 text-critical',
        )}>
          {status === 'stable' ? 'ESTÁVEL' : status === 'warning' ? 'ATENÇÃO' : 'CRÍTICO'}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <VitalItem
          icon={<Heart className="h-3.5 w-3.5" />}
          label="FC"
          value={`${vitals.fc}`}
          unit="bpm"
          color={getVitalColor('fc')}
        />
        <VitalItem
          icon={<Activity className="h-3.5 w-3.5" />}
          label="PA"
          value={`${vitals.pas}/${vitals.pad}`}
          unit="mmHg"
          color={getVitalColor('pa')}
        />
        <VitalItem
          icon={<Wind className="h-3.5 w-3.5" />}
          label="SpO₂"
          value={`${vitals.satO2}`}
          unit="%"
          color={getVitalColor('satO2')}
        />
        <VitalItem
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="FR"
          value={`${vitals.fr}`}
          unit="irpm"
          color={getVitalColor('fr')}
        />
      </div>
    </div>
  );
};

const VitalItem = ({ icon, label, value, unit, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
}) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className={cn('flex items-center gap-1', color)}>
      {icon}
      <span className="text-[10px] font-mono-vital font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <span className={cn('font-mono-vital text-lg font-bold leading-none lcd-glow', color)}>{value}</span>
    <span className="text-[9px] font-mono-vital text-muted-foreground">{unit}</span>
  </div>
);

export default VitalMonitor;
