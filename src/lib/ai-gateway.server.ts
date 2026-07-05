// Server-only. Calls Google Gemini API directly using GEMINI_API_KEY.
// Set the key locally in `.env` (GEMINI_API_KEY=xxx) or in your host's env vars.

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const GEMINI_URL = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export type Lang = "fr" | "en";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

function parseDataUrl(url: string): { mime: string; data: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/.exec(url);
  if (!m) return null;
  return { mime: m[1], data: m[2] };
}

function toGeminiParts(
  content: ChatMessage["content"],
): GeminiPart[] {
  if (typeof content === "string") return [{ text: content }];
  const parts: GeminiPart[] = [];
  for (const block of content) {
    if (block.type === "text") {
      parts.push({ text: block.text });
    } else if (block.type === "image_url") {
      const url = block.image_url.url;
      const parsed = parseDataUrl(url);
      if (parsed) {
        parts.push({ inline_data: { mime_type: parsed.mime, data: parsed.data } });
      } else {
        parts.push({ text: `[image url: ${url}]` });
      }
    }
  }
  return parts;
}

export async function chatCompletion(opts: {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  response_format?: { type: "json_object" };
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing — add it to your environment.");

  // Separate system messages from conversation history.
  const systemTexts: string[] = [];
  const contents: Array<{ role: "user" | "model"; parts: GeminiPart[] }> = [];
  for (const m of opts.messages) {
    if (m.role === "system") {
      systemTexts.push(typeof m.content === "string" ? m.content : "");
      continue;
    }
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: toGeminiParts(m.content),
    });
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      ...(opts.response_format?.type === "json_object"
        ? { responseMimeType: "application/json" }
        : {}),
    },
  };
  if (systemTexts.length) {
    body.systemInstruction = { parts: [{ text: systemTexts.join("\n\n") }] };
  }

  const model = opts.model ?? MODEL;
  const res = await fetch(GEMINI_URL(model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Too many requests. Try again shortly.");
    if (res.status === 403) throw new Error("Gemini API key invalid or unauthorized.");
    throw new Error(`Gemini: ${res.status} ${txt.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("").trim();
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
