import { ActionType } from "@/types/simulation";

export interface TrainingCase {
  id: string;
  title: string;
  specialty: string;
  level: "ESTUDANTE" | "RESIDENTE" | "ESPECIALISTA";
  duration: string;
  description: string;
  competencies: string[];
  initialScenario: string;
}

export const trainingCases: TrainingCase[] = [
  {
    id: "tc-1",
    title: "Dor Torácica com Suspeita de IAM",
    specialty: "Cardiologia / Emergência",
    level: "ESTUDANTE",
    duration: "12–18 min",
    description: "Um paciente chega com dor torácica aguda. O objetivo é reconhecer sinais de alto risco e conduzir a abordagem inicial corretamente.",
    competencies: [
      "Reconhecimento de síndrome coronariana",
      "Priorização de ECG",
      "Conduta inicial em dor torácica"
    ],
    initialScenario: "Paciente masculino, 58 anos, hipertenso e tabagista, queixa-se de dor retroesternal em aperto iniciada há 2 horas. A dor irradia para o braço esquerdo e é acompanhada de sudorese fria."
  },
  {
    id: "tc-2",
    title: "Sepse com Instabilidade Hemodinâmica",
    specialty: "Emergência / Infectologia",
    level: "RESIDENTE",
    duration: "15–20 min",
    description: "Paciente febril evolui com hipotensão e sinais de hipoperfusão. O desafio é identificar sepse e agir com rapidez.",
    competencies: [
      "Reconhecimento precoce da sepse",
      "Ressuscitação inicial",
      "Antibioticoterapia no tempo adequado",
      "Indicação de vasopressor"
    ],
    initialScenario: "Paciente feminina, 72 anos, trazida da casa de repouso com história de febre e prostração há 24h. Ao exame: letárgica, extremidades frias, tempo de enchimento capilar lentificado."
  },
  {
    id: "tc-3",
    title: "Crise Asmática Grave",
    specialty: "Pneumologia / Emergência",
    level: "ESTUDANTE",
    duration: "10–15 min",
    description: "Paciente com dispneia intensa e piora progressiva. O aluno deve avaliar gravidade e escalar o suporte.",
    competencies: [
      "Avaliação de gravidade respiratória",
      "Oxigenoterapia",
      "Broncodilatadores",
      "Reconhecimento de falência ventilatória"
    ],
    initialScenario: "Paciente feminina, 19 anos, asmática conhecida, chega ao pronto atendimento em crise há 3 horas, sem melhora com uso de medicação de resgate em casa. Fala em frases curtas e usa musculatura acessória."
  },
  {
    id: "tc-4",
    title: "Politrauma com Choque Hemorrágico",
    specialty: "Trauma / Emergência",
    level: "RESIDENTE",
    duration: "18–25 min",
    description: "Vítima de acidente chega instável. O foco é abordagem sistemática e priorização em cenário crítico.",
    competencies: [
      "Abordagem ABCDE",
      "Identificação de choque hemorrágico",
      "Controle de sangramento",
      "Priorização de condutas"
    ],
    initialScenario: "Paciente masculino, 25 anos, vítima de colisão moto x anteparo fixo. Chega imobilizado em prancha longa, colar cervical, taquicárdico e hipotenso. Apresenta deformidade evidente em coxa direita."
  },
  {
    id: "tc-5",
    title: "Rebaixamento Agudo do Nível de Consciência",
    specialty: "Neurologia / Emergência",
    level: "ESPECIALISTA",
    duration: "15–20 min",
    description: "Paciente chega com alteração súbita de consciência. O aluno deve estabilizar, levantar hipóteses e decidir exames prioritários.",
    competencies: [
      "Estabilização inicial",
      "Diagnóstico diferencial",
      "Tempo-dependência",
      "Indicação de neuroimagem"
    ],
    initialScenario: "Paciente masculino, 65 anos, encontrado caído em casa por familiares. Ao chegar no PS, apresenta Glasgow 9, sem déficits focais evidentes à primeira vista, mas com histórico de diabetes e fibrilação atrial."
  },
  {
    id: "tc-6",
    title: "Hipoglicemia Grave no Pronto Atendimento",
    specialty: "Clínica Médica / Emergência",
    level: "ESTUDANTE",
    duration: "8–12 min",
    description: "Paciente com confusão mental, sudorese e instabilidade. O desafio é reconhecer e tratar rapidamente.",
    competencies: [
      "Reconhecimento de emergência metabólica",
      "Correção imediata",
      "Investigação de causa",
      "Reavaliação clínica"
    ],
    initialScenario: "Paciente feminina, 45 anos, diabética tipo 1, trazida por colegas de trabalho por quadro súbito de confusão mental e comportamento agressivo. Está muito suada e pálida."
  }
];
