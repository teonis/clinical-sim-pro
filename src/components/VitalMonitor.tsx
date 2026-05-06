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
  stable: { color: 'text-primary', bg: 'bg-primary/10', label: 'Estável' },
  warning: { color: 'text-warning', bg: 'bg-warning/10', label: 'Instável' },
  critical: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Crítico' },
};

const Waveform = ({ color, speed = 2, height = 40 }: { color: string; speed?: number; height?: number }) => {
  const points = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: i * 20,
      y: 20 + Math.random() * 10 - 5
    }));
  }, []);

  return (
    <div className="h-10 w-full overflow-hidden opacity-30">
      <svg viewBox="0 0 400 40" className="w-full h-full preserve-3d">
        <motion.path
          d={`M 0 20 ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L 400 20`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={color}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [-400, 0]
          }}
          transition={{ 
            duration: speed,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </svg>
    </div>
  );
};

const VitalMonitor = ({ fc, pas, pad, satO2, fr, status }: VitalMonitorProps) => {
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
      className="bg-[#050505] border-2 border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
      role="region" 
      aria-label="Monitor de Sinais Vitais"
    >
      {/* Clinical Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] pointer-events-none animate-scan-line opacity-20" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <div className="w-1.5 h-6 bg-primary/20 rounded-full overflow-hidden">
              <motion.div animate={{ height: ['20%', '80%', '40%'] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-full bg-primary" />
            </div>
            <div className="w-1.5 h-6 bg-primary/20 rounded-full overflow-hidden">
              <motion.div animate={{ height: ['60%', '30%', '90%'] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="w-full bg-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Monitor Multiparamétrico</span>
            <span className="text-[8px] font-black text-primary/50 tracking-widest uppercase mt-0.5">Telemetry Active • High Fidelity Mode</span>
          </div>
        </div>
        
        <div className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-xl border-2 backdrop-blur-md transition-all duration-500',
          config.color,
          config.bg,
          status === 'critical' ? 'animate-clinical-pulse border-destructive/50' : 'border-white/5'
        )}>
          <Zap className={cn("h-3 w-3", status === 'critical' && "animate-pulse")} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{config.label}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <VitalItem
          icon={<Heart className="h-5 w-5" />}
          label="FC"
          value={`${fc}`}
          unit="bpm"
          color={getVitalColor('fc')}
          waveform={<Waveform color={getVitalColor('fc')} speed={fc > 100 ? 1 : 2} />}
        />
        <VitalItem
          icon={<Activity className="h-5 w-5" />}
          label="PA"
          value={`${pas}/${pad}`}
          unit="mmHg"
          color={getVitalColor('pa')}
          waveform={<Waveform color={getVitalColor('pa')} speed={1.5} />}
        />
        <VitalItem
          icon={<Wind className="h-5 w-5" />}
          label="SpO₂"
          value={`${satO2}`}
          unit="%"
          color={getVitalColor('satO2')}
          waveform={<Waveform color={getVitalColor('satO2')} speed={3} />}
        />
        <VitalItem
          icon={<Thermometer className="h-5 w-5" />}
          label="FR"
          value={`${fr}`}
          unit="irpm"
          color={getVitalColor('fr')}
          waveform={<Waveform color={getVitalColor('fr')} speed={4} />}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-30">
        <div className="flex gap-6 items-center">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-primary" />
            ))}
          </div>
          <span className="text-[8px] font-black text-white tracking-[0.3em] uppercase">Data Stream: Synchronized</span>
        </div>
        <span className="text-[8px] font-black text-white/50 tracking-[0.5em] uppercase">BOLUS CLINICAL ENGINE</span>
      </div>
    </div>
  );
};

const VitalItem = ({ icon, label, value, unit, color, waveform }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  waveform: React.ReactNode;
}) => (
  <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 flex flex-col gap-4 group/item hover:border-primary/30 transition-all hover:bg-white/[0.04] cursor-default">
    <div className="flex items-center justify-between">
      <div className={cn('flex items-center gap-2', color)}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-primary/40" />
        <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
      </div>
    </div>
    
    <div className="flex flex-col items-center py-2">
      <span className={cn('text-4xl font-black leading-none tabular-nums tracking-tighter transition-all group-hover/item:scale-110', color)}>
        {value}
      </span>
      <span className="text-[9px] font-black text-muted-foreground uppercase mt-2 tracking-widest opacity-60">{unit}</span>
    </div>

    {waveform}
  </div>
);

export default VitalMonitor;