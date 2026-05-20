import { supabase } from "@/integrations/supabase/client";
import { SimulationState, StartParams, ChatMessageAI } from "@/types/simulation";
import { getEngine, resetEngine, EngineVitals } from "./physiologyEngine";
import { detectProtocol, evaluateProtocol, evaluationToPromptBlock, ProtocolEvaluation } from "./protocolChecklists";
import { generateCase, GeneratedCase } from "./caseGenerator";
import { safeJsonParse } from "@/lib/error-handler";


let lastProtocolEvaluation: ProtocolEvaluation | null = null;
let lastGeneratedCase: GeneratedCase | null = null;

export const getLastProtocolEvaluation = (): ProtocolEvaluation | null => lastProtocolEvaluation;
export const getLastGeneratedCase = (): GeneratedCase | null => lastGeneratedCase;

// Conversation history for multi-turn simulation
let conversationHistory: ChatMessageAI[] = [];

export const getConversationHistory = (): ChatMessageAI[] => [...conversationHistory];

/** Map the LLM's sinais_vitais string into initial engine vitals (best-effort). */
function parseVitalsFromResponse(state: SimulationState): Partial<EngineVitals> {
  const raw = state.dados_medicos?.sinais_vitais ?? "";
  
  const extract = (patterns: RegExp[]): number | undefined => {
    for (const p of patterns) {
      const m = raw.match(p);
      if (m) return parseFloat(m[1]);
    }
    return undefined;
  };

  return {
    hr: extract([/FC[:\s]*(\d+)/i, /Frequência Cardíaca[:\s]*(\d+)/i, /HR[:\s]*(\d+)/i]),
    sbp: extract([/PA[:\s]*(\d+)/i, /Pressão Arterial[:\s]*(\d+)/i, /BP[:\s]*(\d+)/i]),
    dbp: extract([/\/(\d+)\s*mmHg/i, /PA[:\s]*\d+\/(\d+)/i, /BP[:\s]*\d+\/(\d+)/i]),
    spo2: extract([/SpO2[:\s]*(\d+)/i, /Sat[:\s]*(\d+)/i, /Saturação[:\s]*(\d+)/i]),
    rr: extract([/FR[:\s]*(\d+)/i, /Frequência Respiratória[:\s]*(\d+)/i, /RR[:\s]*(\d+)/i]),
    temp: extract([/Temp[:\s]*([\d.]+)/i, /Temperatura[:\s]*([\d.]+)/i]),
  };
}


export const startSimulation = async (params: StartParams): Promise<SimulationState> => {
  try {
    conversationHistory = [];
    lastProtocolEvaluation = null;

    let generatedScenario = params.caso_especifico || "";
    let engineSeedVitals: Partial<EngineVitals> | undefined;

    if (!params.caso_especifico) {
      const generated = generateCase(params.especialidade);
      if (generated) {
        lastGeneratedCase = generated;
        generatedScenario = generated.scenarioPrompt;
        engineSeedVitals = generated.initialVitals;
      }
    } else {
      lastGeneratedCase = null;
    }

    const engine = resetEngine(engineSeedVitals);

    // Securely construct the start command using JSON.stringify to avoid injection
    const startPayload = {
      especialidade: params.especialidade,
      dificuldade: params.dificuldade,
      caso_especifico: generatedScenario
    };

    const startCommand = `START_GAME ${JSON.stringify(startPayload)}\n\n[DADOS VITAIS INICIAIS DESEJADOS]: ${engine.toPromptBlock()}\n\n[DADOS DE EXAME FÍSICO INICIAIS]: ${lastGeneratedCase?.physicalExamBase || ""}\n\n[DADOS DE EXAMES LABORATORIAIS INICIAIS]: ${lastGeneratedCase?.labResultsBase || ""}`;

    conversationHistory.push({ role: "user", content: startCommand });

    // Improved invocation with retry logic
    const invokeWithRetry = async (retries = 2): Promise<any> => {
      try {
        const { data, error } = await supabase.functions.invoke("simulate", {
          body: { messages: conversationHistory },
        });

        if (error) throw error;
        if (!data) throw new Error("O servidor retornou uma resposta vazia.");
        if (data.error) throw new Error(data.error);
        
        return data;
      } catch (err: any) {
        if (retries > 0) {
          console.warn(`Retrying simulation start... (${retries} left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return invokeWithRetry(retries - 1);
        }
        throw err;
      }
    };

    const data = await invokeWithRetry();
    
    const state = data as SimulationState;
    const llmVitals = parseVitalsFromResponse(state);
    const finalVitals = engineSeedVitals
      ? { ...llmVitals, ...engineSeedVitals }
      : llmVitals;
    
    if (state.dados_medicos) {
      const v = finalVitals;
      state.dados_medicos.sinais_vitais = `FC: ${v.hr ?? 80} bpm | PA: ${v.sbp ?? 120}/${v.dbp ?? 80} mmHg | SpO2: ${v.spo2 ?? 97}% | FR: ${v.rr ?? 16} rpm | Temp: ${v.temp ?? 36.5}°C`;
    }
    
    engine.reset(finalVitals);

    // Se o caso for estruturado, o debriefing deve focar nos dados desse caso
    const isStructuredCase = params.caso_especifico?.includes('structured_case');

    const initialNarrative = [
      state.interface_usuario?.manchete,
      state.interface_usuario?.narrativa_principal,
      state.interface_usuario?.exame_fisico_detalhado
    ].filter(Boolean).join(" ");

    
    engine.setConditionsFromNarrative(initialNarrative);

    conversationHistory.push({ role: "assistant", content: JSON.stringify(data) });
    return state;
  } catch (err: any) {
    console.error("Error in startSimulation:", err);
    throw new Error(err.message || "Não foi possível iniciar a simulação. Verifique sua conexão.");
  }
};

export const sendAction = async (
  actionId: string,
  customText?: string
): Promise<SimulationState> => {
  const engine = getEngine();

  let message = "";
  if (actionId === "LIVRE") {
    message = `AÇÃO LIVRE: ${customText}`;
  } else if (actionId === "SYSTEM_TIMEOUT") {
    message = `SYSTEM EVENT: O tempo do usuário acabou. O paciente deve deteriorar IMEDIATAMENTE. Aplique penalidade grave.`;
  } else {
    message = `OPÇÃO ESCOLHIDA: ${actionId}`;
  }

  // 1. Apply deterministic intervention effects
  const actionText = customText || actionId;
  engine.applyIntervention(actionText);
  engine.logAction(actionText); // Log before tick to get current state time

  // 2. Calculate time cost for this action
  const timeCost = actionId === "SYSTEM_TIMEOUT" ? 3 : engine.getTimeCostForAction(actionText);

  // 3. Tick game time forward → degrade vitals based on last known patient state
  const lastAssistant = [...conversationHistory].reverse().find(m => m.role === "assistant");
  let currentPatientState = "ESTAVEL";
  if (lastAssistant) {
    const parsed = safeJsonParse<any>(lastAssistant.content, null);
    if (parsed) {
      currentPatientState = parsed.status_simulacao?.estado_paciente ?? "ESTAVEL";

      const narr = [
        parsed.interface_usuario?.manchete,
        parsed.interface_usuario?.narrativa_principal,
        parsed.interface_usuario?.exame_fisico_detalhado
      ].filter(Boolean).join(" ");
      
      engine.setConditionsFromNarrative(narr);
    }
  }
  engine.tick(timeCost, currentPatientState);


  // 4. Action was already logged to timeline in step 1

  // 5. Inject calculated vitals + time into the user message
  const vitalsBlock = engine.toPromptBlock();

  // 6. If game is ending, evaluate protocol checklist and inject into prompt
  let checklistBlock = "";
  const fullNarrative = conversationHistory
    .filter(m => m.role === "assistant")
    .map(m => {
      try { 
        const p = JSON.parse(m.content); 
        return [
          p.interface_usuario?.manchete,
          p.interface_usuario?.narrativa_principal,
          p.interface_usuario?.exame_fisico_detalhado
        ].filter(Boolean).join(" ");
      }
      catch { return ""; }
    }).join(" ");
  const protocol = detectProtocol(fullNarrative);
  if (protocol) {
    const evaluation = evaluateProtocol(protocol, engine.getActionTimeline(), engine.getAppliedInterventions());
    lastProtocolEvaluation = evaluation;
    checklistBlock = `\n\n${evaluationToPromptBlock(evaluation)}`;
  }

  const enrichedMessage = `${message}\n\n${vitalsBlock}\n\nTempo gasto nesta ação: ${timeCost} min${checklistBlock}`;

  conversationHistory.push({ role: "user", content: enrichedMessage });

  const invokeWithRetry = async (retries = 2): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke("simulate", {
        body: { messages: conversationHistory },
      });

      if (error) throw error;
      if (!data) throw new Error("Resposta inválida do servidor de simulação.");
      if (data.error) throw new Error(data.error);
      
      return data;
    } catch (err: any) {
      if (retries > 0) {
        console.warn(`Retrying action... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return invokeWithRetry(retries - 1);
      }
      throw err;
    }
  };

  const data = await invokeWithRetry();
  conversationHistory.push({ role: "assistant", content: JSON.stringify(data) });
  return data as SimulationState;
};

export const resetConversation = () => {
  conversationHistory = [];
  lastProtocolEvaluation = null;
  lastGeneratedCase = null;
  resetEngine();
};
