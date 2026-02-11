import React, { createContext, useContext, useState, useCallback } from 'react';
import { SimulationState, VitalSigns, ChatMessage, ClinicalCase, PatientStatus } from '@/types/medical';

interface SimulationContextType {
  simulation: SimulationState | null;
  startSimulation: (clinicalCase: ClinicalCase) => void;
  endSimulation: () => void;
  addMessage: (message: ChatMessage) => void;
  updateVitals: (vitals: Partial<VitalSigns>) => void;
  updateStatus: (status: PatientStatus) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
};

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulation, setSimulation] = useState<SimulationState | null>(null);

  const startSimulation = useCallback((clinicalCase: ClinicalCase) => {
    const systemMessage: ChatMessage = {
      id: 'sys-1',
      role: 'system',
      content: `🏥 Caso iniciado: ${clinicalCase.title}\n\n${clinicalCase.initialScenario}\n\nVocê é o médico plantonista. Avalie o paciente e tome as condutas que julgar necessárias. Pode solicitar exames, prescrever medicamentos e realizar procedimentos.`,
      timestamp: new Date(),
    };
    setSimulation({
      caseData: clinicalCase,
      vitalSigns: { ...clinicalCase.vitalSignsStart },
      patientStatus: 'warning',
      messages: [systemMessage],
      isActive: true,
    });
  }, []);

  const endSimulation = useCallback(() => {
    setSimulation(prev => prev ? { ...prev, isActive: false } : null);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setSimulation(prev => prev ? { ...prev, messages: [...prev.messages, message] } : null);
  }, []);

  const updateVitals = useCallback((vitals: Partial<VitalSigns>) => {
    setSimulation(prev => prev ? { ...prev, vitalSigns: { ...prev.vitalSigns, ...vitals } } : null);
  }, []);

  const updateStatus = useCallback((status: PatientStatus) => {
    setSimulation(prev => prev ? { ...prev, patientStatus: status } : null);
  }, []);

  return (
    <SimulationContext.Provider value={{ simulation, startSimulation, endSimulation, addMessage, updateVitals, updateStatus }}>
      {children}
    </SimulationContext.Provider>
  );
};
