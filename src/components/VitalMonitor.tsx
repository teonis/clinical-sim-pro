import { VitalSigns, PatientStatus } from '@/types/medical';
import { Heart, Activity, Wind, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VitalMonitorProps {
  vitals: VitalSigns;
  status: PatientStatus;
}

const statusColors: Record<PatientStatus, string> = {
  stable: 'border-success/40 bg-success/5',
  warning: 'border-warning/40 bg-warning/5',
  critical: 'border-critical/40 bg-critical/5',
};

const statusDot: Record<PatientStatus, string> = {
  stable: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-critical animate-pulse-vital',
};

const VitalMonitor = ({ vitals, status }: VitalMonitorProps) => {
  const getVitalColor = (type: string) => {
    switch (type) {
      case 'fc': return vitals.fc > 100 || vitals.fc < 60 ? 'text-critical' : 'text-success';
      case 'pa': return vitals.pas > 140 || vitals.pad > 90 || vitals.pas < 90 ? 'text-critical' : 'text-success';
      case 'satO2': return vitals.satO2 < 92 ? 'text-critical' : vitals.satO2 < 95 ? 'text-warning' : 'text-success';
      case 'fr': return vitals.fr > 20 || vitals.fr < 12 ? 'text-warning' : 'text-success';
      default: return 'text-success';
    }
  };

  return (
    <div className={cn('rounded-xl border-2 p-3 transition-colors duration-500', statusColors[status])}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 rounded-full', statusDot[status])} />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Monitor Multiparamétrico
          </span>
        </div>
        <span className={cn(
          'text-xs font-bold uppercase px-2 py-0.5 rounded-full',
          status === 'stable' && 'bg-success/20 text-success',
          status === 'warning' && 'bg-warning/20 text-warning',
          status === 'critical' && 'bg-critical/20 text-critical',
        )}>
          {status === 'stable' ? 'Estável' : status === 'warning' ? 'Atenção' : 'Crítico'}
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
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <span className={cn('font-mono text-lg font-bold leading-none', color)}>{value}</span>
    <span className="text-[9px] text-muted-foreground">{unit}</span>
  </div>
);

export default VitalMonitor;
