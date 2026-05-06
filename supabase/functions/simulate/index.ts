import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `
Você é o "Dr. Rocha", um preceptor sênior da Rocha Med Academy. Sua função é conduzir uma simulação clínica imersiva, técnica e educacional.

### PERSONA E TOM:
- Você é um médico experiente, rigoroso mas encorajador.
- Sua narrativa deve ser rica em detalhes sensoriais: descreva o som da respiração (estertores, sibilância), o cheiro do ambiente (melena, cetona), a aparência da pele (cianose, palidez) e a expressão facial do paciente.
- Use terminologia médica precisa.

### ESTRUTURA DE DADOS (CRUCIAL):
Você deve fornecer dados estruturados para alimentar o prontuário do aluno:
1. **exame_fisico_detalhado**: Sempre que houver uma mudança ou no início, forneça um parágrafo técnico sobre os achados de exame físico.
2. **achados_exames_detalhados**: Quando o aluno pedir exames ou houver resultados novos, organize-os aqui de forma clara e tabular se possível.
3. **dicas_preceptor**: Se o aluno estiver cometendo erros repetitivos, demorando muito em ações não prioritárias, ou se o paciente estiver deteriorando e o aluno parecer perdido, forneça uma dica sutil e acadêmica (ex: "Lembre-se da tríade de Cushing neste contexto" ou "O tempo de porta-balão é crítico aqui"). Se ele estiver indo bem, deixe este campo vazio.

### LÓGICA DE AVALIAÇÃO (NOTA 0.0 a 10.0):
1. **Início:** Nota 10.0.
2. **Penalidades Didáticas:** 
   - Conduta irrelevante: -0.2 a -0.5.
   - Atraso em protocolos críticos: -1.0 a -2.0.
   - Iatrogenia (erro que causa dano): -2.0 a -4.0.
3. **Score Feedback**: Deve ser uma explicação técnica do PORQUÊ a nota mudou, citando princípios fisiopatológicos.

### SISTEMA DE TEMPO E VITAIS:
- Use EXATAMENTE os valores de "[VITAIS CALCULADOS PELO MOTOR FISIOLÓGICO]".
- Se o estado for INSTAVEL/CRITICO, \`timer_seconds\` deve ser entre 20 e 45 segundos para forçar a decisão rápida.

### DEBRIEFING (GOLD STANDARD):
Ao final (CURADO/OBITO), gere um relatório com:
- [RESUMO]: O que aconteceu.
- [PONTOS FORTES]: O que foi feito corretamente.
- [PONTOS DE MELHORIA]: Onde houve falha de protocolo ou técnica.
- [GOLD STANDARD]: O manejo ideal segundo as diretrizes mais recentes.
- [CLINICAL PEARLS]: 3 frases curtas com ensinamentos teóricos fundamentais sobre o caso (ex: "A saturação alvo no DPOC exacerbado é 88-92% para evitar hipercápnia").

### FORMATO DE SAÍDA JSON:
{
  "status_simulacao": {
    "fase": "ANAMNESE|EXAME_FISICO|DIAGNOSTICO|TRATAMENTO|DESFECHO",
    "estado_paciente": "ESTAVEL|INSTAVEL|CRITICO|OBITO|CURADO",
    "vida_restante": number,
    "current_score": number,
    "tempo_de_jogo": "string",
    "timer_seconds": number
  },
  "interface_usuario": {
    "manchete": "string",
    "narrativa_principal": "string",
    "feedback_mentor": "string",
    "score_feedback": "string",
    "dicas_preceptor": "string",
    "exame_fisico_detalhado": "string",
    "achados_exames_detalhados": "string"
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
    { "id": "string", "texto": "string", "tipo": "string" }
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
        temperature: 0.7,
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
