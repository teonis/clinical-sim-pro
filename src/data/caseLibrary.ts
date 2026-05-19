export type CaseLevel = "Básico" | "Intermediário" | "Avançado";

export interface LibraryCase {
  id: string;
  title: string;
  specialty: string;
  /** Tags adicionais usadas pelos filtros (ex.: "Emergência") */
  tags?: string[];
  level: CaseLevel;
  duration: string;
  description: string;
  competencies: string[];
  simulationBriefing: string;
  /** Mapeamento para o motor de simulação atual */
  engineSpecialty: string;
  engineDifficulty: "ESTUDANTE" | "RESIDENTE" | "ESPECIALISTA";
}

export const LIBRARY_SPECIALTIES = [
  "Todos",
  "Cardiologia",
  "Pneumologia",
  "Infectologia",
  "Emergência",
  "Clínica Médica",
  "Trauma",
] as const;

export const LIBRARY_LEVELS = [
  "Todos os níveis",
  "Básico",
  "Intermediário",
  "Avançado",
] as const;

const levelToDifficulty = (level: CaseLevel) =>
  level === "Básico" ? "ESTUDANTE" : level === "Intermediário" ? "RESIDENTE" : "ESPECIALISTA";

export const caseLibrary: LibraryCase[] = [
  {
    id: "iam-stemi",
    title: "Infarto Agudo do Miocárdio com Supra de ST",
    specialty: "Cardiologia",
    tags: ["Emergência"],
    level: "Avançado",
    duration: "15–20 min",
    description:
      "Paciente chega ao pronto atendimento com dor torácica típica, sudorese e instabilidade progressiva. O aluno deve reconhecer o cenário e conduzir a abordagem tempo-dependente.",
    competencies: [
      "Reconhecimento de síndrome coronariana aguda",
      "Solicitação e interpretação inicial do ECG",
      "Priorização de reperfusão",
      "Conduta inicial em paciente instável",
    ],
    simulationBriefing:
      "Homem, 58 anos, hipertenso e tabagista, chega ao PS com dor torácica retroesternal em aperto há 90 minutos, irradiando para MSE, associada a sudorese fria e náusea. Apresenta-se taquicárdico, hipertenso e ansioso. Espera-se que o aluno reconheça SCA com supra de ST, solicite ECG imediato, monitorize, inicie MONA quando indicado e priorize estratégia de reperfusão tempo-dependente.",
    engineSpecialty: "Cardiologia",
    engineDifficulty: levelToDifficulty("Avançado"),
  },
  {
    id: "pac",
    title: "Pneumonia Adquirida na Comunidade",
    specialty: "Pneumologia",
    level: "Intermediário",
    duration: "12–18 min",
    description:
      "Paciente com febre, tosse, dispneia e piora do estado geral. O desafio é avaliar gravidade, levantar hipóteses e decidir condutas iniciais.",
    competencies: [
      "Avaliação de gravidade respiratória",
      "Indicação de exames complementares",
      "Decisão de internação",
      "Conduta inicial antimicrobiana",
    ],
    simulationBriefing:
      "Homem, 68 anos, com tosse produtiva amarelada, febre 38,9°C e dispneia progressiva há 4 dias. Ao exame: taquipneico, SpO2 91% em ar ambiente, estertores crepitantes em base direita. O aluno deve estratificar gravidade (CURB-65/PSI), solicitar exames pertinentes, decidir local de tratamento e iniciar antibioticoterapia empírica adequada.",
    engineSpecialty: "Pneumologia",
    engineDifficulty: levelToDifficulty("Intermediário"),
  },
  {
    id: "sepse-choque",
    title: "Sepse com Evolução para Choque Séptico",
    specialty: "Infectologia",
    tags: ["Emergência"],
    level: "Avançado",
    duration: "18–25 min",
    description:
      "Paciente com foco infeccioso provável, hipotensão e sinais de hipoperfusão. A simulação exige rapidez no reconhecimento e tratamento.",
    competencies: [
      "Identificação precoce de sepse",
      "Ressuscitação inicial",
      "Antibioticoterapia oportuna",
      "Indicação de vasopressores",
    ],
    simulationBriefing:
      "Mulher, 72 anos, institucionalizada, com disúria há 3 dias, febre e rebaixamento de consciência nas últimas horas. PA 80/50, FC 122, FR 26, SpO2 93%, lactato elevado. Espera-se reconhecimento de sepse com hipoperfusão, coleta de culturas, início precoce de antibiótico de amplo espectro, ressuscitação volêmica guiada e indicação de noradrenalina quando refratária.",
    engineSpecialty: "Infectologia",
    engineDifficulty: levelToDifficulty("Avançado"),
  },
  {
    id: "crise-asmatica",
    title: "Crise Asmática Grave",
    specialty: "Pneumologia",
    tags: ["Emergência"],
    level: "Intermediário",
    duration: "10–15 min",
    description:
      "Paciente com dispneia intensa, fala entrecortada e sinais de esforço respiratório. O aluno deve identificar gravidade e escalonar o suporte.",
    competencies: [
      "Classificação de gravidade",
      "Oxigenoterapia",
      "Broncodilatadores",
      "Reconhecimento de falência ventilatória",
    ],
    simulationBriefing:
      "Mulher, 24 anos, asmática, chega ao PS com dispneia intensa, sibilos audíveis, fala entrecortada, uso de musculatura acessória, FR 32, SpO2 88%. Espera-se classificação de gravidade, oxigenoterapia titulada, beta-2 agonista e ipratrópio inalatórios, corticoide sistêmico precoce e reconhecimento de sinais de falência ventilatória que indiquem suporte avançado.",
    engineSpecialty: "Pneumologia",
    engineDifficulty: levelToDifficulty("Intermediário"),
  },
  {
    id: "hipoglicemia",
    title: "Hipoglicemia Grave no Pronto Atendimento",
    specialty: "Clínica Médica",
    tags: ["Emergência"],
    level: "Básico",
    duration: "8–12 min",
    description:
      "Paciente com confusão mental, sudorese e instabilidade autonômica. O desafio é reconhecer rapidamente a emergência metabólica e tratá-la.",
    competencies: [
      "Reconhecimento clínico",
      "Correção imediata da glicemia",
      "Reavaliação",
      "Investigação de causa",
    ],
    simulationBriefing:
      "Homem, 65 anos, diabético em uso de insulina, trazido com confusão, sudorese fria e tremores. HGT 38 mg/dL. Espera-se reconhecimento da emergência metabólica, correção imediata com glicose IV ou via oral conforme nível de consciência, reavaliação seriada da glicemia e investigação da causa precipitante.",
    engineSpecialty: "Endocrinologia",
    engineDifficulty: levelToDifficulty("Básico"),
  },
  {
    id: "politrauma",
    title: "Politrauma com Choque Hemorrágico",
    specialty: "Trauma",
    tags: ["Emergência"],
    level: "Avançado",
    duration: "20–25 min",
    description:
      "Vítima de acidente de trânsito chega instável, com sinais de choque. O aluno deve conduzir uma abordagem organizada em ambiente de alta pressão.",
    competencies: [
      "ABCDE do trauma",
      "Reconhecimento de choque hemorrágico",
      "Priorização terapêutica",
      "Controle de sangramento",
    ],
    simulationBriefing:
      "Homem, 32 anos, vítima de colisão automobilística em alta velocidade. Chega ao PS pálido, sudoreico, PA 80/40, FC 132, com dor abdominal difusa e fratura exposta em fêmur direito. Espera-se abordagem sistemática ABCDE do trauma, reconhecimento de choque hemorrágico classe III, controle de hemorragias externas, reposição volêmica/hemocomponentes e acionamento de equipe cirúrgica.",
    engineSpecialty: "Trauma / Emergência",
    engineDifficulty: levelToDifficulty("Avançado"),
  },
  {
    id: "rnc-agudo",
    title: "Rebaixamento Agudo do Nível de Consciência",
    specialty: "Emergência",
    tags: ["Neurologia"],
    level: "Avançado",
    duration: "15–20 min",
    description:
      "Paciente chega com alteração súbita de consciência. O aluno deve estabilizar, construir hipóteses e priorizar decisões diagnósticas.",
    competencies: [
      "Avaliação inicial do paciente grave",
      "Diagnóstico diferencial",
      "Exclusão de causas reversíveis",
      "Indicação de neuroimagem",
    ],
    simulationBriefing:
      "Mulher, 70 anos, encontrada em casa com rebaixamento súbito de consciência (Glasgow 9). Hipertensa e diabética. Espera-se estabilização inicial (vias aéreas, ventilação e circulação), HGT, exclusão de causas reversíveis (hipoglicemia, opioides, hipoxemia), construção de diagnóstico diferencial e indicação precoce de neuroimagem.",
    engineSpecialty: "Neurologia",
    engineDifficulty: levelToDifficulty("Avançado"),
  },
  {
    id: "abdome-agudo",
    title: "Dor Abdominal Aguda com Instabilidade",
    specialty: "Clínica Médica",
    tags: ["Emergência"],
    level: "Intermediário",
    duration: "12–18 min",
    description:
      "Paciente com dor abdominal intensa, palidez e queda progressiva da pressão arterial. O desafio é reconhecer gravidade e decidir os próximos passos.",
    competencies: [
      "Reconhecimento de abdome agudo grave",
      "Avaliação hemodinâmica",
      "Priorização de exames",
      "Decisão de encaminhamento urgente",
    ],
    simulationBriefing:
      "Homem, 60 anos, com dor abdominal intensa de início súbito há 2 horas, pálido, sudoreico, PA caindo progressivamente (atual 90/55), FC 118. Abdome distendido e doloroso difusamente. Espera-se reconhecimento de abdome agudo potencialmente catastrófico, estabilização hemodinâmica, solicitação direcionada de exames de imagem e laboratório e acionamento cirúrgico precoce.",
    engineSpecialty: "Cirurgia Geral",
    engineDifficulty: levelToDifficulty("Intermediário"),
  },
];
