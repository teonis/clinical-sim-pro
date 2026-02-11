export enum SimPhase {
  ANAMNESE = "ANAMNESE",
  EXAME_FISICO = "EXAME_FISICO",
  DIAGNOSTICO = "DIAGNOSTICO",
  TRATAMENTO = "TRATAMENTO",
  DESFECHO = "DESFECHO",
}

export enum PatientState {
  ESTAVEL = "ESTAVEL",
  INSTAVEL = "INSTAVEL",
  CRITICO = "CRITICO",
  OBITO = "OBITO",
  CURADO = "CURADO",
}

export enum ActionType {
  EXAME = "EXAME",
  MEDICAMENTO = "MEDICAMENTO",
  INTERVENCAO = "INTERVENCAO",
  LIVRE = "LIVRE",
}

export interface SimulationStatus {
  fase: SimPhase | string;
  estado_paciente: PatientState | string;
  vida_restante: number;
  current_score: number;
  tempo_de_jogo: string;
  timer_seconds?: number;
}

export interface UserInterfaceData {
  manchete: string;
  narrativa_principal: string;
  feedback_mentor: string;
  score_feedback: string;
}

export interface MedicalData {
  sinais_vitais: string;
  exames_resultados: string;
}

export interface VisualizationData {
  descricao_cenario_pt: string;
  image_generation_prompt: string;
}

export interface InteractionOption {
  id: string;
  texto: string;
  tipo: ActionType | string;
}

export interface SimulationState {
  status_simulacao: SimulationStatus;
  interface_usuario: UserInterfaceData;
  dados_medicos: MedicalData;
  visualizacao: VisualizationData;
  opcoes_interacao: InteractionOption[];
}

export interface StartParams {
  especialidade: string;
  dificuldade: string;
  caso_especifico?: string;
}

export interface ChatMessageAI {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GameHistoryEntry {
  id: number | string;
  user_id: string;
  username: string;
  score: number;
  outcome: string;
  difficulty: string;
  specialty: string;
  case_title: string;
  is_favorite: boolean;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
}

export interface UserStats {
  totalGames: number;
  totalScore: number;
  currentLevel: string;
  nextLevelScore: number;
  averageScore: number;
  specialtyPerformance: {
    name: string;
    count: number;
    avgScore: number;
    deaths: number;
  }[];
  recentHistory: GameHistoryEntry[];
}

export const SPECIALTIES = [
  "Cardiologia",
  "Neurologia",
  "Trauma / Emergência",
  "Pneumologia",
  "Infectologia",
  "Pediatria",
  "Ginecologia e Obstetrícia",
  "Gastroenterologia",
  "Ortopedia",
  "Psiquiatria",
  "Dermatologia",
  "Endocrinologia",
  "Nefrologia",
  "Oncologia",
  "Cirurgia Geral",
  "ALEATÓRIO",
];

export const DIFFICULTIES = ["ESTUDANTE", "RESIDENTE", "ESPECIALISTA"];

export const GAME_LEVELS = [
  { name: "Calouro de Jaleco", minScore: 0 },
  { name: "Aspirante Clínico", minScore: 50 },
  { name: "Interno de Plantão", minScore: 100 },
  { name: "Caçador de Diagnósticos", minScore: 150 },
  { name: "Residente Resiliente", minScore: 200 },
  { name: "Talento em Ascensão", minScore: 300 },
  { name: "Mestre do Estetoscópio", minScore: 500 },
  { name: "Referência do Serviço", minScore: 700 },
  { name: "Lenda da Medicina", minScore: 1000 },
];

export const MEDICAL_TERMS: Record<string, string> = {
  Taquicardia: "Frequência cardíaca acelerada (>100 bpm).",
  Bradicardia: "Frequência cardíaca lenta (<60 bpm).",
  Hipotensão: "Pressão arterial baixa, podendo causar choque.",
  Hipertensão: "Pressão arterial elevada.",
  Hipoxemia: "Baixa concentração de oxigênio no sangue.",
  Dispneia: "Dificuldade ou desconforto para respirar.",
  Cianose: "Coloração azulada da pele/lábios por falta de O2.",
  Glasgow: "Escala (3-15) que mede o nível de consciência.",
  Saturação: "Porcentagem de hemoglobina carregando oxigênio (SpO2).",
  Edema: "Inchaço causado por acúmulo de líquidos nos tecidos.",
  PCR: "Parada Cardiorrespiratória.",
  IAM: "Infarto Agudo do Miocárdio (Ataque Cardíaco).",
  AVC: "Acidente Vascular Cerebral (Derrame).",
  Sepse: "Resposta inflamatória sistêmica grave a uma infecção.",
  Choque: "Falência circulatória, sangue não chega aos órgãos.",
  Epinefrina: "Adrenalina, usada em PCR e anafilaxia.",
  Atropina: "Medicamento usado para tratar bradicardia.",
  Amiodarona: "Antiarrítmico usado em taquicardias graves.",
  Intubação: "Procedimento para garantir via aérea definitiva.",
  PA: "Pressão Arterial.",
  FC: "Frequência Cardíaca.",
  FR: "Frequência Respiratória.",
  SpO2: "Saturação de Oxigênio.",
};
