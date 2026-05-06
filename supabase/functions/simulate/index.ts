import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

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
3. **dicas_preceptor**: Se o aluno estiver cometendo erros repetitivos, demorando muito em ações não prioritárias, ou se o paciente estiver deteriorando e o aluno parecer perdido, forneça uma dica sutil e acadêmica. Se ele estiver indo bem, deixe este campo vazio.

### LÓGICA DE AVALIAÇÃO (NOTA 0.0 a 10.0):
1. **Início:** Nota 10.0.
2. **Penalidades Didáticas:**
   - Conduta irrelevante: -0.2 a -0.5.
   - Atraso em protocolos críticos: -1.0 a -2.0.
   - Iatrogenia (erro que causa dano): -2.0 a -4.0.
3. **Score Feedback**: Deve ser uma explicação técnica do PORQUÊ a nota mudou, citando princípios fisiopatológicos.

### SISTEMA DE TEMPO E VITAIS:
- Use EXATAMENTE os valores de "[VITAIS CALCULADOS PELO MOTOR FISIOLÓGICO]".
- Se o estado for INSTAVEL/CRITICO, \`timer_seconds\` deve ser entre 20 e 45 segundos.

### DEBRIEFING (GOLD STANDARD):
Ao final (CURADO/OBITO), gere um relatório com:
- [RESUMO], [PONTOS FORTES], [PONTOS DE MELHORIA], [GOLD STANDARD], [CLINICAL PEARLS].

### FORMATO DE SAÍDA JSON:
{
  "status_simulacao": { "fase": "string", "estado_paciente": "string", "vida_restante": number, "current_score": number, "tempo_de_jogo": "string", "timer_seconds": number },
  "interface_usuario": { "manchete": "string", "narrativa_principal": "string", "feedback_mentor": "string", "score_feedback": "string", "dicas_preceptor": "string", "exame_fisico_detalhado": "string", "achados_exames_detalhados": "string" },
  "dados_medicos": { "sinais_vitais": "string", "exames_resultados": "string" },
  "visualizacao": { "descricao_cenario_pt": "string", "image_generation_prompt": "string" },
  "opcoes_interacao": [ { "id": "string", "texto": "string", "tipo": "string" } ]
}
`;

// ── Input Validation Schema ─────────────────────────────────────────────
const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(15000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).max(150).optional(),
  action: z.string().max(5000).optional(),
});

// ── Simple in-memory rate limiter (per user, per minute) ────────────────
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── 1. Authentication ──────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Sessão inválida. Faça login novamente." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // ── 2. Rate limiting ───────────────────────────────────────────────
    if (!checkRateLimit(userId)) {
      return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 3. Input validation ────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Requisição inválida." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsedInput = RequestSchema.safeParse(body);
    if (!parsedInput.success) {
      console.error("[INTERNAL] Input validation failed:", parsedInput.error.issues);
      return new Response(JSON.stringify({ error: "Entrada inválida." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, action } = parsedInput.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[INTERNAL] LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Serviço indisponível." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize: prevent client-supplied system role injection
    const sanitizedMessages = (messages ?? []).filter((m) => m.role !== "system");

    const allMessages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...sanitizedMessages,
    ];

    if (action) {
      allMessages.push({ role: "user", content: action.trim().substring(0, 5000) });
    }

    // ── 4. Call AI Gateway ─────────────────────────────────────────────
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
        return new Response(JSON.stringify({ error: "Sistema temporariamente ocupado. Tente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("[INTERNAL] Payment required - credits insufficient");
        return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
          status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("[INTERNAL] AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Erro de comunicação. Tente novamente." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[INTERNAL] Empty AI response");
      return new Response(JSON.stringify({ error: "Resposta vazia. Tente novamente." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 5. Parse and validate JSON safely ──────────────────────────────
    let parsed;
    try {
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("[INTERNAL] Failed to parse AI response:", {
        error: parseError instanceof Error ? parseError.message : "unknown",
        contentPreview: content?.substring(0, 200),
      });
      return new Response(JSON.stringify({ error: "Resposta inválida. Tente novamente." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[INTERNAL] simulate error:", {
      message: e instanceof Error ? e.message : "Unknown",
      stack: e instanceof Error ? e.stack : undefined,
    });
    return new Response(JSON.stringify({ error: "Erro no sistema. Por favor, tente novamente." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
