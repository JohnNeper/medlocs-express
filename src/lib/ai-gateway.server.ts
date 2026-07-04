// Serveur uniquement. Appelle Lovable AI Gateway sans exposer la clé.
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

export async function chatCompletion(opts: {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  response_format?: { type: "json_object" };
}): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY manquante");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      ...(opts.response_format ? { response_format: opts.response_format } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Trop de requêtes. Réessayez dans un instant.");
    if (res.status === 402) throw new Error("Crédits IA épuisés. Contactez l'admin.");
    throw new Error(`Gateway IA: ${res.status} ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

export function tryParseJson<T = unknown>(text: string): T | null {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
