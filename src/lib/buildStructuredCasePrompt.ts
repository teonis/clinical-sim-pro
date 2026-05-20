import { LibraryCase } from "@/types/caseLibrary";

/**
 * Constrói um prompt rico para o simulador a partir de um caso estruturado.
 */
export function buildStructuredCasePrompt(c: LibraryCase): string {
  const patient = c.patientProfile;
  const vitals = c.initialVitals;

  return `
ESTE É UM CASO ESTRUTURADO ("structured_case"). Siga rigorosamente os parâmetros clínicos abaixo:

[TÍTULO DO CENÁRIO]: ${c.title}
[ESPECIALIDADE]: ${c.specialty}
[NÍVEL]: ${c.level}

[OBJETIVOS DE APRENDIZAGEM]:
${c.learningObjectives.map((o) => `- ${o}`).join("\n")}

[PERFIL DO PACIENTE]:
- Idade: ${patient.age} anos
- Sexo: ${patient.sex}
- Contexto: ${patient.context}
- Antecedentes: ${patient.medicalHistory?.join(", ") || "Nenhum relevante"}

[APRESENTAÇÃO INICIAL]:
${c.initialPresentation}

[SINAIS VITAIS INICIAIS]:
- PA: ${vitals.sbp}/${vitals.dbp} mmHg
- FC: ${vitals.hr} bpm
- FR: ${vitals.rr} irpm
- SpO2: ${vitals.spo2}%
- Temp: ${vitals.temp}°C
${vitals.capillaryGlucose ? `- Glicemia Capilar: ${vitals.capillaryGlucose} mg/dL` : ""}

[ACHADOS DE EXAME FÍSICO INICIAL]:
${c.initialPhysicalExam}

[INFORMAÇÕES DISPONÍVEIS DE IMEDIATO]:
${c.initialAvailableInformation.join("; ")}

[DIRETRIZES PARA O SIMULADOR]:
- DIREÇÃO DIAGNÓSTICA IDEAL: ${c.idealDiagnosticDirection}
- DIREÇÃO DE MANEJO IDEAL: ${c.idealManagementDirection}
- ERROS CRÍTICOS A MONITORAR: ${c.criticalMistakes.join(", ")}
- AÇÕES CHAVE ESPERADAS: ${c.expectedKeyActions.join(", ")}

[ORIENTAÇÕES DE PROGRESSÃO]:
- Se o aluno tomar boas decisões: ${c.progressionGuidance.goodOutcome}
- Se o aluno demorar a agir: ${c.progressionGuidance.delayedOutcome}
- Se o aluno tomar decisões inadequadas: ${c.progressionGuidance.inadequateOutcome}

[FOCO DO DEBRIEFING]:
${c.debriefingFocus.join("; ")}

Ao iniciar a simulação para o aluno, apresente APENAS o que faz sentido na [APRESENTAÇÃO INICIAL] e as [INFORMAÇÕES DISPONÍVEIS DE IMEDIATO]. Não revele os diagnósticos ideais ou erros críticos antecipadamente.
  `.trim();
}
