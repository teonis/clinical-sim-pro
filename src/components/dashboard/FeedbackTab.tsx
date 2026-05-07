import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackTabProps {
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  onSendFeedback: () => void;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ feedbackText, setFeedbackText, onSendFeedback }) => {
  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Feedback</h1>
        <p className="text-muted-foreground mt-2 font-medium">Sugestões ou reporte de bugs.</p>
      </div>
      <div className="bg-card rounded-[2rem] border border-border p-10 space-y-6">
        <Textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Sua mensagem..."
          className="min-h-[150px] bg-muted border-none rounded-xl p-6 font-medium focus:ring-1 focus:ring-primary/20 transition-all resize-none"
        />
        <Button 
          onClick={onSendFeedback} 
          disabled={!feedbackText.trim()}
          className="h-14 w-full rounded-xl text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground"
        >
          Enviar Mensagem
        </Button>
      </div>
    </div>
  );
};

export default FeedbackTab;
