import React from "react";
import { motion } from "framer-motion";

interface RecentActivityStatsProps {
  label: string;
  value: number;
  max: number;
}

export const RecentActivityStats: React.FC<RecentActivityStatsProps> = ({ label, value, max }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        className="h-full bg-primary rounded-full" 
      />
    </div>
  </div>
);
