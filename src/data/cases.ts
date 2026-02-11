import { ClinicalCase } from '@/types/medical';

export const mockCases: ClinicalCase[] = [
  {
    id: '1',
    title: 'Dor Torácica Aguda',
    description: 'Paciente masculino, 58 anos, chega ao PS com dor torácica intensa há 2 horas, irradiando para membro superior esquerdo.',
    specialty: 'Cardiologia',
    difficulty: 'medium',
    initialScenario: 'Paciente consciente, sudoreico, com fácies de dor. Refere dor retroesternal em aperto, de forte intensidade (8/10), com início há 2 horas durante esforço físico.',
    vitalSignsStart: { fc: 110, pas: 160, pad: 95, satO2: 94, fr: 22, temp: 36.8 },
    completed: false,
  },
  {
    id: '2',
    title: 'Cetoacidose Diabética',
    description: 'Paciente feminina, 22 anos, trazida pelo SAMU com rebaixamento do nível de consciência e hálito cetônico.',
    specialty: 'Endocrinologia',
    difficulty: 'hard',
    initialScenario: 'Paciente sonolenta, desidratada (+++/4), com respiração de Kussmaul e hálito cetônico. Acompanhante relata que paciente parou insulina há 3 dias.',
    vitalSignsStart: { fc: 120, pas: 90, pad: 60, satO2: 97, fr: 28, temp: 37.2 },
    completed: false,
  },
  {
    id: '3',
    title: 'Pneumonia Comunitária',
    description: 'Paciente masculino, 72 anos, com tosse produtiva, febre e dispneia progressiva há 5 dias.',
    specialty: 'Pneumologia',
    difficulty: 'easy',
    initialScenario: 'Paciente em regular estado geral, taquipneico, com estertores crepitantes em base direita. Expectoração amarelada e febre há 5 dias.',
    vitalSignsStart: { fc: 95, pas: 130, pad: 80, satO2: 91, fr: 24, temp: 38.6 },
    completed: true,
  },
  {
    id: '4',
    title: 'Abdome Agudo Inflamatório',
    description: 'Paciente feminina, 28 anos, com dor abdominal em fossa ilíaca direita há 12 horas com piora progressiva.',
    specialty: 'Cirurgia',
    difficulty: 'easy',
    initialScenario: 'Paciente com dor à palpação em FID, com sinais de Blumberg e Rovsing positivos. Refere início da dor em região periumbilical com migração para FID.',
    vitalSignsStart: { fc: 88, pas: 120, pad: 75, satO2: 98, fr: 18, temp: 37.9 },
    completed: false,
  },
  {
    id: '5',
    title: 'AVC Isquêmico',
    description: 'Paciente masculino, 65 anos, com hemiparesia à direita e disartria de início súbito há 1 hora.',
    specialty: 'Neurologia',
    difficulty: 'hard',
    initialScenario: 'Paciente hipertenso, com hemiparesia braquiofacial direita, disartria e desvio de rima labial. Tempo de início dos sintomas: 1 hora. NIHSS: 14.',
    vitalSignsStart: { fc: 82, pas: 190, pad: 110, satO2: 96, fr: 16, temp: 36.5 },
    completed: false,
  },
  {
    id: '6',
    title: 'Crise Asmática Grave',
    description: 'Paciente feminina, 19 anos, com dispneia intensa, sibilos e uso de musculatura acessória.',
    specialty: 'Pneumologia',
    difficulty: 'medium',
    initialScenario: 'Paciente sentada, com tiragem intercostal e uso de musculatura acessória. Sibilos expiratórios difusos bilateralmente. Não consegue completar frases.',
    vitalSignsStart: { fc: 125, pas: 130, pad: 85, satO2: 88, fr: 32, temp: 36.4 },
    completed: false,
  },
];

export const specialties = [
  'Todas',
  'Cardiologia',
  'Endocrinologia',
  'Pneumologia',
  'Cirurgia',
  'Neurologia',
];

export const difficulties = [
  { value: 'all', label: 'Todas' },
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' },
];
