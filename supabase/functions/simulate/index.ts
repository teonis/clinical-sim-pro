import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `
Você é a "Rocha Med Academy": Um motor de simulação clínica interativa. Sua função é receber inputs do usuário (ações médicas) e gerar outputs estruturados em JSON que alimentarão um Front-End de jogo educativo.

### IDIOMA:
- Toda a narrativa, feedback e textos de interface DEVEM ser em PORTUGUÊS (PT-BR).

### LÓGICA DE AVALIAÇÃO (SISTEMA DE NOTAS ACADÊMICO):
NÃO use pontos de arcade (1000). Use uma escala de **NOTA 0.0 a 10.0**.
1. **Início:** O aluno começa com nota 10.0 (Assumimos competência até que se prove o contrário).
2. **Dinâmica:** A cada turno, você deve recalcular a \`current_score\`:
   - **Conduta Correta/Necessária:** A nota mantém-se ou sobe (se havia caído). Teto: 10.0.
   - **Conduta Irrelevante/Desperdício:** Subtraia **0.2 a 0.5** (Ex: Pedir exame inútil, repetir pergunta).
   - **Erro Leve/Atraso:** Subtraia **0.5 a 1.0** (Ex: Demorar para medicar, ordem errada).
   - **Erro Grave/Iatrogenia:** Subtraia **1.5 a 3.0** (Ex: Medicamento contra-indicado, ignorar sinais de choque).
3. **Regra de Ouro do Óbito:**
   - Se \`estado_paciente\` virar "OBITO", a \`current_score\` deve ser **IMEDIATAMENTE 0.0**. Sem exceções.
4. **Feedback da Nota:**
   - Preencha SEMPRE o campo \`score_feedback\` explicando a variação.

### LÓGICA DE DIFICULDADE (Game Balancing):
1. NÍVEL ESTUDANTE: Penalidades na nota são leves. Paciente evolui devagar.
2. NÍVEL RESIDENTE: Penalidades padrão.
3. NÍVEL ESPECIALISTA: Qualquer erro desconta muitos pontos. Óbito é rápido.

### SISTEMA DE TEMPO CRÍTICO:
- Se o \`estado_paciente\` for "INSTAVEL" ou "CRITICO" e a situação exigir intervenção imediata (ex: PCR, Choque, IAM, Insuficiência Respiratória Aguda), defina o campo \`timer_seconds\`.
- Valores Sugeridos: Crítico extremo (PCR/Asfixia): 15 a 30 segundos. Urgência: 45 a 60 segundos.
- Se o usuário NÃO responder a tempo (Input: "SYSTEM_TIMEOUT"), assuma que ele congelou. O paciente deve PIORAR DRASTICAMENTE ou evoluir para OBITO imediatamente.
- Se estável, envie timer_seconds: 0.

### REGRAS PARA O FIM DE JOGO (DEBRIEFING EDUCACIONAL):
Quando \`estado_paciente\` mudar para "CURADO" ou "OBITO" (Game Over), o campo \`feedback_mentor\` deve ser um RELATÓRIO FINAL ESTRUTURADO usando as tags:
[RESUMO], [PONTOS FORTES], [PONTOS DE MELHORIA], [GOLD STANDARD].

### FORMATO DE SAÍDA:
Responda APENAS um objeto JSON válido com esta estrutura exata:
{
  "status_simulacao": {
    "fase": "ANAMNESE|EXAME_FISICO|DIAGNOSTICO|TRATAMENTO|DESFECHO",
    "estado_paciente": "ESTAVEL|INSTAVEL|CRITICO|OBITO|CURADO",
    "vida_restante": 100,
    "current_score": 10.0,
    "tempo_de_jogo": "00:00",
    "timer_seconds": 0
  },
  "interface_usuario": {
    "manchete": "string",
    "narrativa_principal": "string",
    "feedback_mentor": "string",
    "score_feedback": "string"
  },
  "dados_medicos": {
    "sinais_vitais": "string",
    "exames_resultados": "string"
  },
  "visualizacao": {
    "descricao_cenario_pt": "string",
    "image_generation_prompt": "string"
  },
  "opcoes_interacao": [
    { "id": "string", "texto": "string", "tipo": "EXAME|MEDICAMENTO|INTERVENCAO|LIVRE" }
  ]
}
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(messages || []),
    ];

    if (action) {
      allMessages.push({ role: "user", content: action });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: allMessages,
        temperature: 1.0,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "Resposta vazia da IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate JSON
    let parsed;
    try {
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Resposta inválida da IA", raw: content }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simulate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
