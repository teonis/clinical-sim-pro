import { LibraryCase } from "@/types/caseLibrary";

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

const levelToDifficulty = (level: "Básico" | "Intermediário" | "Avançado") =>
  level === "Básico" ? "ESTUDANTE" : level === "Intermediário" ? "RESIDENTE" : "ESPECIALISTA";

export const caseLibrary: LibraryCase[] = [
  {
    id: "iam-stemi",
    title: "Infarto Agudo do Miocárdio com Supra de ST",
    specialty: "Cardiologia",
    tags: ["Emergência"],
    level: "Avançado",
    duration: "15–20 min",
    description: "Paciente com dor torácica típica e sudorese. O desafio é reconhecer o supra de ST e priorizar a reperfusão.",
    competencies: ["ECG", "SCA", "Reperfusão"],
    learningObjectives: [
      "Reconhecer síndrome coronariana aguda de alto risco",
      "Priorizar ECG em menos de 10 minutos",
      "Identificar necessidade de reperfusão imediata"
    ],
    patientProfile: {
      age: 58,
      sex: "Masculino",
      context: "Chega ao PS trazido por meios próprios",
      medicalHistory: ["Hipertensão", "Tabagista 30 maços/ano"]
    },
    initialPresentation: "Paciente ansioso, pálido e com a mão no peito (sinal de Levine).",
    initialVitals: { sbp: 155, dbp: 95, hr: 104, rr: 20, spo2: 95, temp: 36.6 },
    initialPhysicalExam: "Bulhas rítmicas, sem sopros. Pulmões limpos. Sudorese fria profusa.",
    initialAvailableInformation: ["Dor retroesternal em aperto há 90 min", "Irradiação para MSE", "Náuseas associadas"],
    expectedKeyActions: ["Solicitar ECG imediato", "Monitorização", "Aspirina 200mg", "Clopidogrel", "Acionar Hemodinâmica"],
    criticalMistakes: ["Demorar mais de 10 min para o ECG", "Não monitorizar o paciente", "Não checar contraindicações de trombólise"],
    idealDiagnosticDirection: "IAM com supra de ST em parede anterior.",
    idealManagementDirection: "Antiagregação plaquetária dupla, estatina, analgesia e reperfusão imediata (angioplastia ou fibrinolítico).",
    progressionGuidance: {
      goodOutcome: "Redução da dor, estabilização elétrica e encaminhamento rápido.",
      delayedOutcome: "Evolução para edema agudo de pulmão ou arritmias ventriculares.",
      inadequateOutcome: "Choque cardiogênico ou parada em FV/TV."
    },
    debriefingFocus: ["Tempo porta-ECG", "Indicação de reperfusão", "Abordagem inicial da dor torácica"],
    simulationBriefing: "Homem de 58 anos com dor torácica típica há 90 min.",
    engineSpecialty: "Cardiologia",
    engineDifficulty: levelToDifficulty("Avançado")
  },
  {
    id: "pac",
    title: "Pneumonia Adquirida na Comunidade",
    specialty: "Pneumologia",
    level: "Intermediário",
    duration: "12–18 min",
    description: "Idoso com febre e tosse produtiva. Avalie a gravidade e defina o local de tratamento.",
    competencies: ["Ausculta", "CURB-65", "Antibioticoterapia"],
    learningObjectives: [
      "Estratificar risco pelo CURB-65 ou PSI",
      "Indicar exames radiológicos e laboratoriais",
      "Iniciar antibiótico na primeira hora"
    ],
    patientProfile: {
      age: 68,
      sex: "Masculino",
      context: "Residente de casa de repouso",
      medicalHistory: ["DPOC leve", "Ex-tabagista"]
    },
    initialPresentation: "Paciente prostrado, tossindo muito e com fala entrecortada.",
    initialVitals: { sbp: 105, dbp: 65, hr: 112, rr: 28, spo2: 89, temp: 38.9 },
    initialPhysicalExam: "Estertores crepitantes em base direita. Uso de musculatura acessória leve.",
    initialAvailableInformation: ["Tosse amarelada há 4 dias", "Febre medida em casa", "Piora da dispneia hoje"],
    expectedKeyActions: ["Solicitar Rx de Tórax", "Coletar exames/culturas", "Oxigenoterapia", "Iniciar Ceftriaxone + Azitromicina"],
    criticalMistakes: ["Não avaliar CURB-65", "Aguardar Rx para iniciar antibiótico em paciente instável", "Não ofertar oxigênio"],
    idealDiagnosticDirection: "Pneumonia de lobo inferior direito, CURB-65 de 3 (idade, FR, confusão leve).",
    idealManagementDirection: "Internação hospitalar e antibioticoterapia venosa de amplo espectro.",
    progressionGuidance: {
      goodOutcome: "Melhora da saturação e estabilização da frequência respiratória.",
      delayedOutcome: "Evolução para sepse de foco pulmonar.",
      inadequateOutcome: "Insuficiência respiratória aguda e necessidade de VNI ou IOT."
    },
    debriefingFocus: ["Critérios de internação", "Escolha do antibiótico", "Manejo da hipoxemia"],
    simulationBriefing: "Homem de 68 anos com febre e tosse produtiva há 4 dias.",
    engineSpecialty: "Pneumologia",
    engineDifficulty: levelToDifficulty("Intermediário")
  },
  {
    id: "sepse-choque",
    title: "Sepse com Evolução para Choque Séptico",
    specialty: "Infectologia",
    tags: ["Emergência"],
    level: "Avançado",
    duration: "18–25 min",
    description: "Paciente com foco urinário e hipotensão. Rapidez é essencial para salvar vidas.",
    competencies: ["Ressuscitação", "Culturas", "Drogas Vasoativas"],
    learningObjectives: [
      "Identificar precocemente sinais de hipoperfusão",
      "Realizar ressuscitação volêmica guiada",
      "Indicar noradrenalina oportunamente"
    ],
    patientProfile: {
      age: 72,
      sex: "Feminino",
      context: "Trazida pela filha por confusão mental",
      medicalHistory: ["Diabetes Tipo 2", "Infecções urinárias recorrentes"]
    },
    initialPresentation: "Paciente sonolenta, tempo de enchimento capilar lentificado (4s), extremidades frias.",
    initialVitals: { sbp: 82, dbp: 48, hr: 124, rr: 26, spo2: 92, temp: 38.5 },
    initialPhysicalExam: "Abdome plano, doloroso em hipogástrio. Sem sinais de irritação peritoneal. Murmúrio vesicular presente.",
    initialAvailableInformation: ["Disúria há 3 dias", "Parou de comer e beber água ontem", "Hoje acordou muito confusa"],
    expectedKeyActions: ["Coleta de Culturas e Lactato", "Cristaloide 30ml/kg", "Antibiótico precoce", "Puncionar acesso calibroso"],
    criticalMistakes: ["Atrasar antibiótico", "Volume insuficiente", "Não reavaliar lactato"],
    idealDiagnosticDirection: "Sepse de foco urinário evoluindo para choque séptico.",
    idealManagementDirection: "Pacote de 1 hora da sepse: culturas, lactato, antibiótico e volume. Noradrenalina se hipotensão persistente.",
    progressionGuidance: {
      goodOutcome: "Melhora do nível de consciência e da pressão arterial média (>65).",
      delayedOutcome: "Disfunção multiorgânica (renal, respiratória).",
      inadequateOutcome: "Parada cardiorrespiratória por acidose e hipoperfusão."
    },
    debriefingFocus: ["Bundle de 1 hora", "Metas da ressuscitação", "Reconhecimento do choque"],
    simulationBriefing: "Mulher de 72 anos com provável urossepse e hipotensão.",
    engineSpecialty: "Infectologia",
    engineDifficulty: levelToDifficulty("Avançado")
  },
  {
    id: "crise-asmatica",
    title: "Crise Asmática Grave",
    specialty: "Pneumologia",
    tags: ["Emergência"],
    level: "Intermediário",
    duration: "10–15 min",
    description: "Jovem com broncoespasmo grave. Escalone o tratamento antes da exaustão respiratória.",
    competencies: ["Inalação", "Corticoterapia", "Ventilação"],
    learningObjectives: [
      "Classificar gravidade da crise asmática",
      "Utilizar beta-2 agonista e ipratrópio corretamente",
      "Reconhecer sinais de iminência de parada respiratória"
    ],
    patientProfile: {
      age: 24,
      sex: "Feminino",
      context: "Chega ao PS após exposição a alérgeno",
      medicalHistory: ["Asma persistente moderada", "Uso irregular de corticoide inalatório"]
    },
    initialPresentation: "Paciente sentada (posição de tripé), sudorese, fala apenas monossílabos.",
    initialVitals: { sbp: 138, dbp: 88, hr: 118, rr: 34, spo2: 87, temp: 36.4 },
    initialPhysicalExam: "Sibilos expiratórios e inspiratórios difusos. Uso de musculatura acessória (tiragem supraclavicular).",
    initialAvailableInformation: ["Crise iniciou há 2 horas", "Usou 'bombinha' em casa sem melhora", "Sensação de aperto no peito"],
    expectedKeyActions: ["Oxigênio para alvo 93-95%", "Salbutamol + Ipratrópio contínuo", "Hidrocortisona ou Prednisolona IV", "Sulfato de Magnésio se refratário"],
    criticalMistakes: ["Não iniciar corticoide precocemente", "Sedação desnecessária", "Não monitorizar sinais de exaustão"],
    idealDiagnosticDirection: "Crise asmática muito grave (status asthmaticus).",
    idealManagementDirection: "Broncodilatadores de curta ação, anticolinérgicos e corticoide sistêmico. Considerar Magnésio.",
    progressionGuidance: {
      goodOutcome: "Melhora do murmúrio vesicular e redução da frequência respiratória.",
      delayedOutcome: "Tórax silencioso (ausência de sibilos por baixo fluxo).",
      inadequateOutcome: "Parada respiratória por exaustão da musculatura."
    },
    debriefingFocus: ["Manejo medicamentoso escalonado", "Oxigenoterapia titulada", "Critérios de IOT na asma"],
    simulationBriefing: "Mulher de 24 anos com crise de asma grave e hipoxemia.",
    engineSpecialty: "Pneumologia",
    engineDifficulty: levelToDifficulty("Intermediário")
  },
  {
    id: "hipoglicemia",
    title: "Hipoglicemia Grave no Pronto Atendimento",
    specialty: "Clínica Médica",
    tags: ["Emergência"],
    level: "Básico",
    duration: "8–12 min",
    description: "Paciente diabético confuso. Uma conduta simples pode salvar vidas rapidamente.",
    competencies: ["HGT", "Glicose IV", "Causas reversíveis"],
    learningObjectives: [
      "Incluir hipoglicemia no diferencial de alteração do nível de consciência",
      "Realizar correção endovenosa segura",
      "Orientar sobre riscos de recorrência"
    ],
    patientProfile: {
      age: 65,
      sex: "Masculino",
      context: "Encontrado caído pela esposa",
      medicalHistory: ["Diabetes em uso de Insulina", "Insuficiência Renal leve"]
    },
    initialPresentation: "Paciente em coma (Glasgow 8), pele fria e pegajosa, muito suado.",
    initialVitals: { sbp: 142, dbp: 82, hr: 112, rr: 18, spo2: 96, temp: 35.8, capillaryGlucose: 34 },
    initialPhysicalExam: "Sem sinais de focalidade neurológica. Pupilas isocóricas e fotorreagentes.",
    initialAvailableInformation: ["Tomou insulina e não almoçou", "Confuso há cerca de 30 minutos", "Pulso rítmico e cheio"],
    expectedKeyActions: ["Checar HGT imediatamente", "Glicose 50% 40-60ml IV", "Reavaliar consciência após 5 min", "Iniciar soro glicosado de manutenção"],
    criticalMistakes: ["Solicitar Tomografia antes de checar HGT", "Tentar dar líquidos via oral em paciente inconsciente", "Não investigar o motivo da queda da glicose"],
    idealDiagnosticDirection: "Neuroglicopenia por hipoglicemia grave secundária a erro vacinal/alimentar.",
    idealManagementDirection: "Reposição imediata de glicose hipertônica e vigilância para rebote.",
    progressionGuidance: {
      goodOutcome: "Despertar imediato e normalização dos sinais vitais.",
      delayedOutcome: "Persistência da confusão mental por neuroglicopenia prolongada.",
      inadequateOutcome: "Dano neurológico permanente ou convulsão."
    },
    debriefingFocus: ["Protocolo MOVE", "HGT como sinal vital", "Educação em diabetes"],
    simulationBriefing: "Homem de 65 anos com rebaixamento de consciência. HGT 34.",
    engineSpecialty: "Endocrinologia",
    engineDifficulty: levelToDifficulty("Básico")
  },
  {
    id: "politrauma",
    title: "Politrauma com Choque Hemorrágico",
    specialty: "Trauma",
    tags: ["Emergência"],
    level: "Avançado",
    duration: "20–25 min",
    description: "Vítima de acidente de alta energia. Aplique o ABCDE de forma sistemática.",
    competencies: ["ABCDE", "Acesso Venoso", "Protocolo Transfusional"],
    learningObjectives: [
      "Executar a avaliação primária sistemática (ABCDE)",
      "Reconhecer choque hemorrágico classe III",
      "Priorizar controle de sangramento e reposição volêmica"
    ],
    patientProfile: {
      age: 32,
      sex: "Masculino",
      context: "Vítima de colisão moto x carro",
      medicalHistory: ["Previamente hígido"]
    },
    initialPresentation: "Paciente em prancha rígida e colar cervical, pálido, gemente.",
    initialVitals: { sbp: 78, dbp: 42, hr: 138, rr: 28, spo2: 91, temp: 35.2 },
    initialPhysicalExam: "Vias aéreas pérvias. Expansibilidade reduzida à esquerda. Abdome tenso. Fratura exposta em fêmur D.",
    initialAvailableInformation: ["Acidente há 20 min", "Mecanismo de alta energia", "Perda sanguínea volumosa na cena"],
    expectedKeyActions: ["A: Estabilizar coluna cervical", "B: Oxigênio e ausculta", "C: Dois acessos calibrosos + FAST", "Controle de sangramento externo"],
    criticalMistakes: ["Não imobilizar cervical", "Volume excessivo sem sangue", "Ignorar hipotermia"],
    idealDiagnosticDirection: "Choque hemorrágico por trauma abdominal e fratura de grandes ossos.",
    idealManagementDirection: "Ressuscitação balanceada (sangue/plasma), FAST, contenção de hemorragias e sala de cirurgia.",
    progressionGuidance: {
      goodOutcome: "Estabilização da pressão e melhora da perfusão periférica.",
      delayedOutcome: "Tríade da morte: acidose, coagulopatia e hipotermia.",
      inadequateOutcome: "Exsanguinação e óbito."
    },
    debriefingFocus: ["Sistemática do ABCDE", "Hipotensão permissiva", "Manejo de hemorragias"],
    simulationBriefing: "Vítima de trauma grave, pálido e hipotenso.",
    engineSpecialty: "Trauma / Emergência",
    engineDifficulty: levelToDifficulty("Avançado")
  },
  {
    id: "rnc-agudo",
    title: "Rebaixamento Agudo do Nível de Consciência",
    specialty: "Emergência",
    tags: ["Neurologia"],
    level: "Avançado",
    duration: "15–20 min",
    description: "Idosa encontrada desmaiada. Diferencie AVC de causas metabólicas.",
    competencies: ["Escala de Glasgow", "NIHSS", "Tomografia"],
    learningObjectives: [
      "Proteger via aérea em Glasgow baixo",
      "Realizar exame neurológico focal",
      "Indicar neuroimagem de urgência"
    ],
    patientProfile: {
      age: 70,
      sex: "Feminino",
      context: "Encontrada no chão do quarto",
      medicalHistory: ["Fibrilação Atrial", "Hipertensão"]
    },
    initialPresentation: "Paciente irresponsiva ao chamado verbal, localiza estímulo doloroso (Glasgow 9).",
    initialVitals: { sbp: 190, dbp: 110, hr: 88, rr: 14, spo2: 94, temp: 36.2, capillaryGlucose: 110 },
    initialPhysicalExam: "Desvio de rima para direita. Hemiplegia à esquerda. Pupilas fotorreagentes.",
    initialAvailableInformation: ["Vista bem pela última vez há 2 horas", "Uso irregular de Varfarina", "Roncos inspiratórios leves"],
    expectedKeyActions: ["Monitorização", "Checar HGT (excluir hipo)", "Indicar TC Crânio sem contraste", "Avaliar necessidade de IOT"],
    criticalMistakes: ["Não checar glicemia", "Baixar a pressão arterial de forma agressiva no AVC", "Atrasar a TC"],
    idealDiagnosticDirection: "AVC Isquêmico ou Hemorrágico agudo em janela terapêutica.",
    idealManagementDirection: "Estabilização, neuroimagem imediata e decisão entre trombólise/trombectomia ou manejo de HAS.",
    progressionGuidance: {
      goodOutcome: "Estabilização clínica e encaminhamento para unidade de AVC.",
      delayedOutcome: "Piora do edema cerebral ou transformação hemorrágica.",
      inadequateOutcome: "Herniação cerebral e morte encefálica."
    },
    debriefingFocus: ["Protocolo de AVC", "Proteção de via aérea", "Diferenciais de coma"],
    simulationBriefing: "Mulher de 70 anos com déficit neurológico súbito.",
    engineSpecialty: "Neurologia",
    engineDifficulty: levelToDifficulty("Avançado")
  },
  {
    id: "abdome-agudo",
    title: "Dor Abdominal Aguda com Instabilidade",
    specialty: "Clínica Médica",
    tags: ["Emergência"],
    level: "Intermediário",
    duration: "12–18 min",
    description: "Dor súbita e sinais de irritação peritoneal. Decida o melhor exame e o tempo cirúrgico.",
    competencies: ["FAST", "Abdome Agudo", "Reposição Volêmica"],
    learningObjectives: [
      "Reconhecer sinais clínicos de abdome agudo perfurativo ou vascular",
      "Interpretar achados de exame físico abdominal",
      "Solicitar exames complementares direcionados"
    ],
    patientProfile: {
      age: 60,
      sex: "Masculino",
      context: "Dor iniciou durante o almoço",
      medicalHistory: ["História de Úlcera Peptica", "Uso crônico de AINEs"]
    },
    initialPresentation: "Paciente em posição antálgica, pálido, muito dolorido.",
    initialVitals: { sbp: 95, dbp: 58, hr: 115, rr: 24, spo2: 96, temp: 37.8 },
    initialPhysicalExam: "Abdome em tábua. Sinal de Blumberg positivo em todo abdome. Ausência de ruídos hidroaéreos.",
    initialAvailableInformation: ["Dor súbita 'em facada'", "Vômitos pós-início da dor", "Sudorese intensa"],
    expectedKeyActions: ["Instalar 2 acessos calibrosos", "Sonda Nasogástrica", "Rx Tórax em pé e abdome", "Avaliação Cirúrgica Urgente"],
    criticalMistakes: ["Focar apenas em exames laboratoriais demorados", "Não puncionar acessos venosos", "Administrar opióides antes da avaliação cirúrgica"],
    idealDiagnosticDirection: "Abdome agudo perfurativo (provável úlcera gástrica/duodenal).",
    idealManagementDirection: "Estabilização hemodinâmica, antibiótico profilático e laparotomia exploradora.",
    progressionGuidance: {
      goodOutcome: "Estabilização da dor após medidas iniciais e cirurgia rápida.",
      delayedOutcome: "Evolução para choque séptico por peritonite química/bacteriana.",
      inadequateOutcome: "Óbito por choque e falência múltipla."
    },
    debriefingFocus: ["Semiologia abdominal", "Exames de imagem no abdome agudo", "Indicação cirúrgica"],
    simulationBriefing: "Homem de 60 anos com dor abdominal súbita e choque.",
    engineSpecialty: "Cirurgia Geral",
    engineDifficulty: levelToDifficulty("Intermediário")
  }
];
