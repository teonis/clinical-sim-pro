import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, ChevronRight, GraduationCap, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderWithTooltips } from "@/components/MedicalTooltip";

interface EventLogEntry {
  id: number;
  type: "narrative" | "action" | "system" | "mentor";
  text: string;
  timestamp: string;
}

interface GameEventLogProps {
  eventLog: EventLogEntry[];
  eventLogEndRef: React.RefObject<HTMLDivElement>;
}

const GameEventLog: React.FC<GameEventLogProps> = ({ eventLog, eventLogEndRef }) => {
  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <AnimatePresence mode="popLayout">
        {eventLog.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4",
              entry.type === "action" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
              entry.type === "narrative" ? "bg-card border-border text-primary" :
              entry.type === "action" ? "bg-primary border-primary text-primary-foreground" :
              entry.type === "mentor" ? "bg-primary/10 border-primary/20 text-primary" :
              "bg-destructive/10 border-destructive/20 text-destructive"
            )}>
              {entry.type === "narrative" ? <Stethoscope className="h-4 w-4" /> :
               entry.type === "action" ? <ChevronRight className="h-4 w-4" /> :
               entry.type === "mentor" ? <GraduationCap className="h-4 w-4" /> :
               <ShieldAlert className="h-4 w-4" />}
            </div>
            <div className={cn(
              "flex-1 space-y-1",
              entry.type === "action" && "text-right"
            )}>
              <div className={cn(
                "inline-block px-5 py-3 rounded-2xl text-sm leading-relaxed",
                entry.type === "narrative" ? "bg-card border border-border shadow-sm text-foreground" :
                entry.type === "action" ? "bg-primary text-primary-foreground font-bold" :
                entry.type === "mentor" ? "bg-primary/5 border border-primary/10 text-primary italic" :
                "bg-destructive/5 border border-destructive/10 text-destructive"
              )}>
                {renderWithTooltips(entry.text)}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                {entry.timestamp}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={eventLogEndRef} />
    </div>
  );
};

export default GameEventLog;
