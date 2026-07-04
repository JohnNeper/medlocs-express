import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chatCompletion, tryParseJson, type ChatMessage } from "./ai-gateway.server";

// ------- 1) Scanner IA de médicament (photo) -------
const ScanInput = z.object({
  imageDataUrl: z.string().min(20),
  note: z.string().max(500).optional(),
});

export type ScanResult = {
  verdict: "authentique" | "suspect" | "indetermine";
  confidence: number;
  redFlags: string[];
  advice: string;
  name?: string;
};

export const scanMedication = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ScanInput.parse(d))
  .handler(async ({ data }): Promise<ScanResult> => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Tu es un expert en pharmacovigilance au Cameroun spécialisé dans la détection des médicaments contrefaits. Analyse l'image d'un médicament (emballage, blister, notice) et détecte les signes de contrefaçon : fautes d'orthographe, logos flous, hologrammes absents, numéros de lot suspects, boîte abîmée, impression de mauvaise qualité, absence de mentions légales (DCI, AMM, dosage). Réponds STRICTEMENT en JSON.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              (data.note ? `Contexte du citoyen: ${data.note}\n\n` : "") +
              `Analyse cette photo et renvoie un objet JSON avec exactement ces champs:
{
  "verdict": "authentique" | "suspect" | "indetermine",
  "confidence": nombre entre 0 et 1,
  "redFlags": [liste courte de signaux d'alerte visibles en français],
  "advice": "conseil court et actionnable pour le citoyen (2 phrases max)",
  "name": "nom du médicament si lisible sinon null"
}`,
          },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ],
      },
    ];

    const raw = await chatCompletion({ messages, temperature: 0.2 });
    const parsed = tryParseJson<ScanResult>(raw);
    if (!parsed) {
      return {
        verdict: "indetermine",
        confidence: 0,
        redFlags: [],
        advice:
          "L'analyse n'a pas pu aboutir. Rendez-vous dans une pharmacie agréée pour vérification.",
      };
    }
    parsed.confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
    parsed.redFlags = Array.isArray(parsed.redFlags) ? parsed.redFlags.slice(0, 6) : [];
    return parsed;
  });

// ------- 2) Vérification IA d'ordonnance -------
const PrescriptionInput = z.object({
  imageDataUrl: z.string().min(20),
});

export type PrescriptionCheck = {
  authenticityScore: number; // 0..1
  status: "coherente" | "incoherente" | "suspecte" | "illisible";
  issues: string[];
  medications: { name: string; dose?: string; note?: string }[];
  recommendation: string;
};

export const verifyPrescription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PrescriptionInput.parse(d))
  .handler(async ({ data }): Promise<PrescriptionCheck> => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Tu es un pharmacien expert au Cameroun qui aide à détecter les fausses ordonnances et les incohérences. Vérifie: en-tête du médecin/hôpital, cachet, signature, date récente, DCI cohérente, posologie plausible, absence de rature suspecte, associations dangereuses. Réponds en JSON strict.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyse cette ordonnance et renvoie EXACTEMENT ce JSON:
{
  "authenticityScore": nombre 0..1,
  "status": "coherente" | "incoherente" | "suspecte" | "illisible",
  "issues": [problèmes détectés en français],
  "medications": [{"name": "...", "dose": "...", "note": "..."}],
  "recommendation": "conseil au citoyen en 1-2 phrases"
}`,
          },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ],
      },
    ];

    const raw = await chatCompletion({ messages, temperature: 0.2 });
    const parsed = tryParseJson<PrescriptionCheck>(raw);
    if (!parsed) {
      return {
        authenticityScore: 0,
        status: "illisible",
        issues: ["Analyse impossible"],
        medications: [],
        recommendation: "Consultez directement une pharmacie agréée avec l'original.",
      };
    }
    parsed.authenticityScore = Math.max(
      0,
      Math.min(1, Number(parsed.authenticityScore) || 0),
    );
    parsed.issues = Array.isArray(parsed.issues) ? parsed.issues.slice(0, 8) : [];
    parsed.medications = Array.isArray(parsed.medications)
      ? parsed.medications.slice(0, 10)
      : [];
    return parsed;
  });

// ------- 3) Assistant anti-automédication -------
const AssistantInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export const assistantChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AssistantInput.parse(d))
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `Tu es "MedLocs Sentinelle", assistant santé du Cameroun.
Règles ABSOLUES:
- Tu NE prescris JAMAIS de médicament, ni dosage, ni traitement.
- Tu refuses de recommander un achat direct.
- Face à des symptômes, tu orientes: pharmacie agréée la plus proche, médecin généraliste, ou urgences (117 police / 118 pompiers) selon gravité.
- Tu détectes les signaux de gravité (fièvre >39°C, douleur thoracique, difficulté à respirer, sang, enfant <2 ans, femme enceinte) → réponse: "consultez immédiatement un médecin/urgences".
- Tu mets en garde contre l'automédication, les faux médicaments vendus en ligne/marché, et les conseils IA/réseaux sociaux non vérifiés.
- Réponds en français, ton chaleureux, court (5 phrases max), avec puces si utile.
- Termine chaque réponse par: "⚠️ Ceci n'est pas un avis médical. Consultez un professionnel de santé."`,
      },
      ...data.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await chatCompletion({
      messages,
      temperature: 0.5,
      model: "google/gemini-3-flash-preview",
    });
    return { reply };
  });
