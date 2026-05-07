import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Send } from "lucide-react";

interface GameActionInputProps {
  diagnosticHypothesis: string;
  setDiagnosticHypothesis: (val: string) => void;
  customActionText: string;
  setCustomActionText: (val: string) => void;
  isLoading: boolean;
  onSendAction: () => void;
}

const GameActionInput: React.FC<GameActionInputProps> = ({
  diagnosticHypothesis,
  setDiagnosticHypothesis,
  customActionText,
  setCustomActionText,
  isLoading,
  onSendAction,
}) => {
  return (
    <div className="p-6 bg-card border-t border-border space-y-4 shadow-xl">
      <div className="relative group">
        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          value={diagnosticHypothesis}
          onChange={(e) => setDiagnosticHypothesis(e.target.value)}
          placeholder="HIPÓTESE DIAGNÓSTICA..."
          className="h-10 bg-muted border-none rounded-xl pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary/20"
        />
      </div>
      <div className="relative">
        <Input 
          value={customActionText}
          onChange={(e) => setCustomActionText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendAction()}
          placeholder="DIGITE SUA CONDUTA..."
          className="h-14 bg-muted border-none rounded-xl px-6 text-sm font-bold text-foreground placeholder:text-muted-foreground/30 transition-all"
        />
        <Button 
          onClick={onSendAction}
          disabled={isLoading || !customActionText.trim()}
          className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-primary text-primary-foreground hover:scale-105 transition-all"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default GameActionInput;
