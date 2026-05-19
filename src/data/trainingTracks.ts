export interface TrainingTrack {
  id: string;
  title: string;
  description: string;
  caseCount: number;
  level: string;
  progress: number;
  objective: string;
  cases: {
    id: string;
    title: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  }[];
}

export const trainingTracks: TrainingTrack[] = [
  {
    id: "track-1",
    title: "Primeiros Plantões",
    description: "Treine os cenários mais comuns e mais perigosos enfrentados por médicos no início da prática clínica.",
    caseCount: 8,
    level: "Estudante / Recém-formado",
    progress: 0,
    objective: "Desenvolver segurança no atendimento inicial de urgências comuns no pronto atendimento.",
    cases: [
      { id: "tc-6", title: "Hipoglicemia grave", status: "NOT_STARTED" },
      { id: "tc-1", title: "Dor torácica aguda", status: "NOT_STARTED" },
      { id: "tc-3", title: "Crise asmática", status: "NOT_STARTED" },
      { id: "tc-2", title: "Sepse em fase inicial", status: "NOT_STARTED" },
      { id: "tc-5", title: "Rebaixamento do nível de consciência", status: "NOT_STARTED" }
    ]
  },
  {
    id: "track-2",
    title: "Sala Vermelha",
    description: "Casos de alta complexidade com pacientes instáveis, priorização rápida e decisões críticas.",
    caseCount: 10,
    level: "Residente",
    progress: 0,
    objective: "Dominar o manejo avançado de pacientes críticos e estabilização de emergências complexas.",
    cases: []
  },
  {
    id: "track-3",
    title: "Emergências Cardiológicas",
    description: "Do reconhecimento da dor torácica ao manejo de arritmias e choque cardiogênico.",
    caseCount: 7,
    level: "Estudante a Residente",
    progress: 0,
    objective: "Aprofundar o conhecimento em protocolos cardiológicos e interpretação rápida de ECG em emergência.",
    cases: []
  },
  {
    id: "track-4",
    title: "Raciocínio Clínico em Clínica Médica",
    description: "Casos de investigação diagnóstica, hipóteses diferenciais e condutas progressivas.",
    caseCount: 12,
    level: "Estudante",
    progress: 0,
    objective: "Refinar a capacidade de diagnóstico diferencial e investigação sistemática em medicina interna.",
    cases: []
  }
];
