import React, { useMemo } from 'react';
import { Heart, Activity, Wind, Thermometer, Zap } from 'lucide-react';
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

const statusConfig: Record<PatientStatus, { color: string; bg: string; label: string }> = {
  stable: { color: 'text-primary', bg: 'bg-primary/5', label: 'Estável' },
  warning: { color: 'text-warning', bg: 'bg-warning/5', label: 'Instável' },
  critical: { color: 'text-destructive', bg: 'bg-destructive/5', label: 'Crítico' },
};

const VitalMonitor = React.memo(({ fc, pas, pad, satO2, fr, status }: VitalMonitorProps) => {
  const config = statusConfig[status];

  const getVitalColor = (type: string) => {
    switch (type) {
      case 'fc': return fc > 120 || fc < 50 ? 'text-destructive' : fc > 100 || fc < 60 ? 'text-warning' : 'text-primary';
      case 'pa': return pas > 160 || pad > 100 || pas < 90 ? 'text-destructive' : pas > 140 || pad > 90 ? 'text-warning' : 'text-primary';
      case 'satO2': return satO2 < 90 ? 'text-destructive' : satO2 < 94 ? 'text-warning' : 'text-primary';
      case 'fr': return fr > 24 || fr < 10 ? 'text-destructive' : fr > 20 || fr < 12 ? 'text-warning' : 'text-primary';
      default: return 'text-primary';
    }
  };

  return (
    <div 
      className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden group"
      role="region" 
      aria-label="Monitor de Sinais Vitais"
    >
      <div className="flex items-center justify-between mb-8 relative z-10 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monitor Multiparamétrico</span>
        </div>
        
        <div className={cn(
          'flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500',
          config.color,
          config.bg,
          status === 'critical' ? 'animate-clinical-pulse border-destructive/20' : 'border-border'
        )}>
          <Zap className="h-3 w-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">{config.label}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <VitalItem
          icon={<Heart className="h-4 w-4" />}
          label="FC"
          value={`${fc}`}
          unit="bpm"
          color={getVitalColor('fc')}
        />
        <VitalItem
          icon={<Activity className="h-4 w-4" />}
          label="PA"
          value={`${pas}/${pad}`}
          unit="mmHg"
          color={getVitalColor('pa')}
        />
        <VitalItem
          icon={<Wind className="h-4 w-4" />}
          label="SpO₂"
          value={`${satO2}`}
          unit="%"
          color={getVitalColor('satO2')}
        />
        <VitalItem
          icon={<Thermometer className="h-4 w-4" />}
          label="FR"
          value={`${fr}`}
          unit="irpm"
          color={getVitalColor('fr')}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-border flex justify-between items-center opacity-40">
        <span className="text-[8px] font-bold text-muted-foreground tracking-widest uppercase">System: Online</span>
        <span className="text-[8px] font-bold text-muted-foreground tracking-widest uppercase">PULZU ENGINE</span>
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
  <div className="flex flex-col gap-2 group/item cursor-default text-center">
    <div className={cn('flex items-center justify-center gap-2 mb-1', color)}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</span>
    </div>
    
    <div className="flex flex-col items-center">
      <span className={cn('text-3xl font-black leading-none tabular-nums tracking-tighter transition-all group-hover/item:scale-105', color)}>
        {value}
      </span>
      <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{unit}</span>
    </div>
  </div>
);

export default VitalMonitor;