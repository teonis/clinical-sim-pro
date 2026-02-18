import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Square } from 'lucide-react';
import VitalMonitor from '@/components/VitalMonitor';
import { useSimulation } from '@/context/SimulationContext';
import { mockCases } from '@/data/cases';
import { ChatMessage, PatientStatus } from '@/types/medical';
import { cn } from '@/lib/utils';

const SimulationScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { simulation, startSimulation, addMessage, updateVitals, updateStatus, endSimulation } = useSimulation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && !simulation) {
      const found = mockCases.find(c => c.id === id);
      if (found) startSimulation(found);
      else navigate('/cases');
    }
  }, [id, simulation, startSimulation, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simulation?.messages]);

  const simulateResponse = (userInput: string) => {
    setIsTyping(true);

    // Simple simulation logic - in production this would call AI
    setTimeout(() => {
      const lowerInput = userInput.toLowerCase();
      let responseText = '';
      let newStatus: PatientStatus | null = null;

      if (lowerInput.includes('ecg') || lowerInput.includes('eletrocardiograma')) {
        responseText = '📊 ECG realizado: Ritmo sinusal com supradesnivelamento de ST em V1-V4 e espelho em DII, DIII e aVF. Sugestivo de IAM anterior.';
      } else if (lowerInput.includes('troponina') || lowerInput.includes('enzimas')) {
        responseText = '🔬 Resultado: Troponina I: 2.8 ng/mL (VR < 0.04). CK-MB: 45 U/L (VR < 25). Valores significativamente elevados.';
      } else if (lowerInput.includes('aspirina') || lowerInput.includes('aas')) {
        responseText = '💊 AAS 300mg administrado via oral. Paciente relata leve melhora da dor (7/10 → 5/10).';
        if (simulation) {
          updateVitals({ fc: simulation.vitalSigns.fc - 5 });
        }
      } else if (lowerInput.includes('morfina')) {
        responseText = '💉 Morfina 4mg EV administrada. Paciente apresenta alívio significativo da dor (5/10 → 2/10). Monitorar depressão respiratória.';
        if (simulation) {
          updateVitals({ fc: simulation.vitalSigns.fc - 10, fr: simulation.vitalSigns.fr - 2 });
        }
      } else if (lowerInput.includes('amiodarona')) {
        responseText = '💉 Amiodarona 300mg EV em 10 min. Observar intervalo QT no monitor. FC reduzindo gradualmente.';
        if (simulation) {
          updateVitals({ fc: Math.max(70, simulation.vitalSigns.fc - 20) });
          newStatus = 'stable';
        }
      } else if (lowerInput.includes('intub') || lowerInput.includes('via aérea')) {
        responseText = '🫁 Via aérea avançada assegurada. Tubo 7.5 fixado em 22cm da rima labial. Capnografia: 35mmHg. Ventilação mecânica iniciada.';
        if (simulation) {
          updateVitals({ satO2: 98, fr: 14 });
          newStatus = 'warning';
        }
      } else if (lowerInput.includes('exame físico') || lowerInput.includes('examinar')) {
        responseText = '🩺 Exame físico:\n• Ausculta cardíaca: B3 presente, sem sopros\n• Pulmonar: MV+ bilateral, estertores finos em bases\n• Abdome: flácido, indolor\n• Extremidades: pulsos periféricos presentes, sem edema';
      } else if (lowerInput.includes('rx') || lowerInput.includes('raio-x') || lowerInput.includes('radiografia')) {
        responseText = '📷 RX Tórax: Índice cardiotorácico no limite superior. Velamento em base de hemitórax direito sugestivo de derrame pleural pequeno. Sem pneumotórax.';
      } else if (lowerInput.includes('finalizar') || lowerInput.includes('alta') || lowerInput.includes('encerrar')) {
        responseText = '🏁 Simulação encerrada. Gerando relatório de desempenho...\n\n📋 **Debriefing:**\n• Diagnóstico correto identificado\n• Condutas dentro do protocolo ACLS\n• Tempo de resposta adequado\n\n✅ Score: 78/100';
        endSimulation();
      } else {
        responseText = `🩺 Enfermeiro: Entendido, doutor(a). "${userInput}" — anotado. O paciente permanece em observação. FC: ${simulation?.vitalSigns.fc}bpm, PA: ${simulation?.vitalSigns.pas}/${simulation?.vitalSigns.pad}mmHg.\n\nO que mais deseja solicitar?`;
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      addMessage(aiMessage);
      if (newStatus) updateStatus(newStatus);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleSend = () => {
    if (!input.trim() || !simulation?.isActive) return;
    const msg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    addMessage(msg);
    simulateResponse(input.trim());
    setInput('');
    inputRef.current?.focus();
  };

  if (!simulation) return null;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="shrink-0 border-b border-border bg-card px-4 pt-10 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/cases')}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">{simulation.caseData.title}</h1>
            <p className="text-[10px] text-muted-foreground">{simulation.caseData.specialty}</p>
          </div>
          {simulation.isActive && (
            <button
              onClick={endSimulation}
              className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Square className="h-3 w-3" />
              Encerrar
            </button>
          )}
        </div>
        <VitalMonitor
          fc={simulation.vitalSigns.fc}
          pas={simulation.vitalSigns.pas}
          pad={simulation.vitalSigns.pad}
          satO2={simulation.vitalSigns.satO2}
          fr={simulation.vitalSigns.fr}
          status={simulation.patientStatus}
        />
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {simulation.messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground rounded-br-md'
                  : msg.role === 'system'
                  ? 'mx-auto max-w-[90%] bg-accent text-accent-foreground text-center rounded-2xl'
                  : 'bg-card border border-border text-card-foreground rounded-bl-md'
              )}
            >
              {msg.role === 'assistant' && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                  Simulação
                </span>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[9px] opacity-50 mt-1 block text-right">
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-card border border-border w-fit"
          >
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-xs text-muted-foreground ml-1">Simulando...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-card p-3 safe-area-pb">
        {simulation.isActive ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ex: Solicitar ECG, Prescrever AAS 300mg..."
              className="flex-1 min-h-[44px] rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/cases')}
            className="w-full min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
          >
            Voltar aos Casos
          </button>
        )}
      </div>
    </div>
  );
};

export default SimulationScreen;
