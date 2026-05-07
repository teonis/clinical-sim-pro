import { motion } from 'framer-motion';
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3"
  >
    <div className="text-primary">{icon}</div>
    <span className="font-mono text-xl font-bold text-foreground">{value}</span>
    <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
  </motion.div>
);

interface FeatureCardProps {
  step: string;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ step, title, description }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 * parseInt(step) }}
    className="flex gap-3 rounded-xl border border-border bg-card p-4"
  >
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
      {step}
    </div>
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </motion.div>
);
