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
  const heartRate = fc || 0;
  const pulseDuration = heartRate > 0 ? 60 / heartRate : 1;

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
      className="bg-[#050505] border-2 border-[#1a1a1a] rounded-2xl p-5 shadow-2xl transition-all relative overflow-hidden group"
      role="region" 
      aria-label="Monitor de Sinais Vitais"
    >
      {/* Background Grid Pattern for Clinical Look */}
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} 
      />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] pointer-events-none animate-scan-line" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/80">
            Monitor Multiparamétrico v4.0
          </span>
        </div>
        <div className={cn(
          'text-[10px] font-black uppercase px-4 py-1.5 rounded-lg border-2 backdrop-blur-md',
          statusBadge[status],
        )} aria-live="polite">
          {statusLabel[status]}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
        <VitalItem
          icon={<motion.div animate={{ scale: heartRate > 100 ? [1, 1.2, 1] : [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: pulseDuration }}><Heart className="h-5 w-5" /></motion.div>}
          label="Frequência Cardíaca"
          shortLabel="FC"
          value={`${fc}`}
          unit="bpm"
          color={getVitalColor('fc')}
        />
        <VitalItem
          icon={<Activity className="h-5 w-5" />}
          label="Pressão Arterial"
          shortLabel="PA"
          value={`${pas}/${pad}`}
          unit="mmHg"
          color={getVitalColor('pa')}
        />
        <VitalItem
          icon={<Wind className="h-5 w-5" />}
          label="Saturação Oxigênio"
          shortLabel="SpO₂"
          value={`${satO2}`}
          unit="%"
          color={getVitalColor('satO2')}
        />
        <VitalItem
          icon={<Thermometer className="h-5 w-5" />}
          label="Freq. Respiratória"
          shortLabel="FR"
          value={`${fr}`}
          unit="irpm"
          color={getVitalColor('fr')}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-40">
        <div className="flex gap-4">
          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-primary animate-pulse" />
          </div>
          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-primary animate-pulse" />
          </div>
        </div>
        <span className="text-[8px] font-bold text-white/50 tracking-widest uppercase">Waveform Analysis: Active</span>
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
  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 flex flex-col items-center text-center gap-1.5 group/item hover:border-primary/40 transition-all hover:bg-primary/5 cursor-default">
    <div className={cn('flex items-center gap-2 mb-1', color)}>
      {icon}
      <span className="text-[11px] font-black uppercase tracking-wider opacity-60">{shortLabel}</span>
    </div>
    <div className="flex flex-col items-center">
      <span className={cn('text-3xl font-black leading-none tabular-nums tracking-tighter', color)}>
        {value}
      </span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{unit}</span>
    </div>
  </div>
);

export default VitalMonitor;
