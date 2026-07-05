import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chatCompletion, tryParseJson, type ChatMessage } from "./ai-gateway.server";

const LangSchema = z.enum(["fr", "en"]).optional();

// ------- 1) AI medication scanner (photo) -------
const ScanInput = z.object({
  imageDataUrl: z.string().min(20),
  note: z.string().max(500).optional(),
  lang: LangSchema,
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
    const lang = data.lang ?? "fr";
    const isFr = lang === "fr";

    const system = isFr
      ? "Tu es un expert en pharmacovigilance au Cameroun spécialisé dans la détection des médicaments contrefaits. Analyse l'image d'un médicament (emballage, blister, notice) et détecte les signes de contrefaçon : fautes d'orthographe, logos flous, hologrammes absents, numéros de lot suspects, boîte abîmée, impression de mauvaise qualité, absence de mentions légales (DCI, AMM, dosage). Réponds STRICTEMENT en JSON, en français."
      : "You are a pharmacovigilance expert in Cameroon specialized in detecting counterfeit medications. Analyze the image of a medication (packaging, blister, leaflet) and detect signs of counterfeiting: spelling mistakes, blurry logos, missing holograms, suspicious batch numbers, damaged box, low-quality printing, missing legal notices (INN, marketing authorization, dosage). Reply STRICTLY in JSON, in English.";

    const userText =
      (data.note ? (isFr ? `Contexte du citoyen: ${data.note}\n\n` : `User context: ${data.note}\n\n`) : "") +
      (isFr
        ? `Analyse cette photo et renvoie un objet JSON avec exactement ces champs:
{
  "verdict": "authentique" | "suspect" | "indetermine",
  "confidence": nombre entre 0 et 1,
  "redFlags": [liste courte de signaux d'alerte visibles en français],
  "advice": "conseil court et actionnable pour le citoyen (2 phrases max, en français)",
  "name": "nom du médicament si lisible sinon null"
}`
        : `Analyze this photo and return a JSON object with exactly these fields:
{
  "verdict": "authentique" | "suspect" | "indetermine",
  "confidence": number between 0 and 1,
  "redFlags": [short list of visible warning signals in English],
  "advice": "short actionable advice for the citizen (max 2 sentences, in English)",
  "name": "medication name if readable, otherwise null"
}`);

    const messages: ChatMessage[] = [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ],
      },
    ];

    const raw = await chatCompletion({
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    const parsed = tryParseJson<ScanResult>(raw);
    if (!parsed) {
      return {
        verdict: "indetermine",
        confidence: 0,
        redFlags: [],
        advice: isFr
          ? "L'analyse n'a pas pu aboutir. Rendez-vous dans une pharmacie agréée pour vérification."
          : "The analysis could not be completed. Please visit an approved pharmacy for verification.",
      };
    }
    parsed.confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
    parsed.redFlags = Array.isArray(parsed.redFlags) ? parsed.redFlags.slice(0, 6) : [];
    return parsed;
  });

// ------- 2) AI prescription verification -------
const PrescriptionInput = z.object({
  imageDataUrl: z.string().min(20),
  lang: LangSchema,
});

export type PrescriptionCheck = {
  authenticityScore: number;
  status: "coherente" | "incoherente" | "suspecte" | "illisible";
  issues: string[];
  medications: { name: string; dose?: string; note?: string }[];
  recommendation: string;
};

export const verifyPrescription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PrescriptionInput.parse(d))
  .handler(async ({ data }): Promise<PrescriptionCheck> => {
    const lang = data.lang ?? "fr";
    const isFr = lang === "fr";

    const system = isFr
      ? "Tu es un pharmacien expert au Cameroun qui aide à détecter les fausses ordonnances et les incohérences. Vérifie: en-tête du médecin/hôpital, cachet, signature, date récente, DCI cohérente, posologie plausible, absence de rature suspecte, associations dangereuses. Réponds en JSON strict, en français."
      : "You are an expert pharmacist in Cameroon helping detect fake prescriptions and inconsistencies. Check: doctor/hospital header, stamp, signature, recent date, coherent INN, plausible dosage, no suspicious erasures, dangerous drug combinations. Reply in strict JSON, in English.";

    const userText = isFr
      ? `Analyse cette ordonnance et renvoie EXACTEMENT ce JSON:
{
  "authenticityScore": nombre 0..1,
  "status": "coherente" | "incoherente" | "suspecte" | "illisible",
  "issues": [problèmes détectés en français],
  "medications": [{"name": "...", "dose": "...", "note": "..."}],
  "recommendation": "conseil au citoyen en 1-2 phrases"
}`
      : `Analyze this prescription and return EXACTLY this JSON:
{
  "authenticityScore": number 0..1,
  "status": "coherente" | "incoherente" | "suspecte" | "illisible",
  "issues": [detected issues in English],
  "medications": [{"name": "...", "dose": "...", "note": "..."}],
  "recommendation": "advice to the citizen in 1-2 sentences"
}`;

    const messages: ChatMessage[] = [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ],
      },
    ];

    const raw = await chatCompletion({
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    const parsed = tryParseJson<PrescriptionCheck>(raw);
    if (!parsed) {
      return {
        authenticityScore: 0,
        status: "illisible",
        issues: [isFr ? "Analyse impossible" : "Analysis impossible"],
        medications: [],
        recommendation: isFr
          ? "Consultez directement une pharmacie agréée avec l'original."
          : "Please visit an approved pharmacy directly with the original document.",
      };
    }
    parsed.authenticityScore = Math.max(0, Math.min(1, Number(parsed.authenticityScore) || 0));
    parsed.issues = Array.isArray(parsed.issues) ? parsed.issues.slice(0, 8) : [];
    parsed.medications = Array.isArray(parsed.medications) ? parsed.medications.slice(0, 10) : [];
    return parsed;
  });

// ------- 3) Anti-self-medication assistant -------
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
  lang: LangSchema,
});

export const assistantChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AssistantInput.parse(d))
  .handler(async ({ data }) => {
    const lang = data.lang ?? "fr";
    const isFr = lang === "fr";

    const system = isFr
      ? `Tu es "MedLocs Sentinelle", assistant santé du Cameroun.
Règles ABSOLUES:
- Tu NE prescris JAMAIS de médicament, ni dosage, ni traitement.
- Tu refuses de recommander un achat direct.
- Face à des symptômes, tu orientes: pharmacie agréée la plus proche, médecin généraliste, ou urgences (117 police / 118 pompiers) selon gravité.
- Tu détectes les signaux de gravité (fièvre >39°C, douleur thoracique, difficulté à respirer, sang, enfant <2 ans, femme enceinte) → réponse: "consultez immédiatement un médecin/urgences".
- Tu mets en garde contre l'automédication, les faux médicaments vendus en ligne/marché, et les conseils IA/réseaux sociaux non vérifiés.
- Réponds en français, ton chaleureux, court (5 phrases max), avec puces si utile.
- Termine chaque réponse par: "⚠️ Ceci n'est pas un avis médical. Consultez un professionnel de santé."`
      : `You are "MedLocs Sentinelle", a health assistant for Cameroon.
ABSOLUTE rules:
- You NEVER prescribe medication, dosage, or treatment.
- You refuse to recommend a direct purchase.
- For symptoms, redirect to: nearest approved pharmacy, general practitioner, or emergencies (117 police / 118 fire) depending on severity.
- You detect severity signals (fever >39°C, chest pain, breathing difficulty, blood, child <2 years, pregnant woman) → reply: "consult a doctor / emergencies immediately".
- Warn against self-medication, fake medicines sold online/on markets, and unverified AI/social media advice.
- Reply in English, warm tone, short (max 5 sentences), with bullets when useful.
- End every reply with: "⚠️ This is not medical advice. Consult a healthcare professional."`;

    const messages: ChatMessage[] = [
      { role: "system", content: system },
      ...data.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await chatCompletion({ messages, temperature: 0.5 });
    return { reply };
  });
