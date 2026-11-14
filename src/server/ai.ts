import { createServerFn } from "@tanstack/react-start"
import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import { z } from "zod"

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5"
export const MAX_WORDS = 2000

function getClient() {
  return new Anthropic()
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function friendlyError(error: unknown): never {
  if (error instanceof Anthropic.AuthenticationError) {
    throw new Error("Clé API Anthropic invalide. Vérifie ANTHROPIC_API_KEY dans le fichier .env.")
  }
  if (error instanceof Anthropic.RateLimitError) {
    throw new Error("Limite de requêtes atteinte. Réessaie dans quelques instants.")
  }
  if (error instanceof Anthropic.BadRequestError) {
    throw new Error(`Requête refusée par l'API : ${error.message}`)
  }
  if (error instanceof Anthropic.APIConnectionError) {
    throw new Error("Impossible de joindre l'API Anthropic. Vérifie ta connexion internet.")
  }
  if (error instanceof Anthropic.APIError) {
    throw new Error(`Erreur de l'API Anthropic (${error.status}).`)
  }
  if (error instanceof Error && /api key|apiKey|credentials/i.test(error.message)) {
    throw new Error("Aucune clé API trouvée. Ajoute ANTHROPIC_API_KEY dans le fichier .env puis relance le serveur.")
  }
  throw error instanceof Error ? error : new Error("Erreur inconnue.")
}

/* ---------------------------------------------------------------- status */

export const getEngineStatus = createServerFn({ method: "GET" }).handler(async () => {
  const configured = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
  return { configured, model: MODEL }
})

/* --------------------------------------------------------------- rewrite */

const TONES = {
  naturel: "naturel et fluide, comme quelqu'un qui écrit simplement et clairement",
  academique: "académique mais vivant : précis, structuré, sans jargon inutile ni formules creuses",
  simple: "simple et accessible : phrases courtes, vocabulaire courant",
  formel: "formel et professionnel, poli et soigné",
} as const

const INTENSITIES = {
  legere: "Corrige et fluidifie le texte en gardant la majorité des phrases telles quelles.",
  moyenne: "Reformule librement les phrases maladroites ou répétitives, en gardant la structure générale.",
  forte: "Réécris entièrement le texte avec tes propres mots et une structure de phrases nouvelle, en conservant toutes les idées.",
} as const

const RewriteInput = z.object({
  text: z.string().min(1),
  tone: z.enum(["naturel", "academique", "simple", "formel"]),
  intensity: z.enum(["legere", "moyenne", "forte"]),
})

export const rewriteText = createServerFn({ method: "POST" })
  .validator((data: unknown) => RewriteInput.parse(data))
  .handler(async ({ data }) => {
    const words = wordCount(data.text)
    if (words > MAX_WORDS) throw new Error(`Texte trop long (${words} mots, maximum ${MAX_WORDS}).`)

    const system = [
      "Tu es un éditeur littéraire. Tu réécris le texte fourni pour qu'il se lise de manière naturelle et humaine :",
      "varie la longueur et le rythme des phrases, évite les tournures stéréotypées, les listes artificielles,",
      "les transitions mécaniques (« De plus », « En conclusion », « Il est important de noter ») et le vocabulaire pompeux.",
      `Ton recherché : ${TONES[data.tone]}.`,
      INTENSITIES[data.intensity],
      "Règles : conserve exactement le sens, les faits, les chiffres, les noms propres et les citations. N'ajoute aucune information.",
      "Réponds dans la même langue que le texte d'origine. Conserve les paragraphes.",
      "Renvoie uniquement le texte réécrit, sans titre, sans commentaire et sans guillemets autour.",
    ].join(" ")

    try {
      const response = await getClient().beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium" },
        system,
        messages: [{ role: "user", content: data.text }],
      })
      if (response.stop_reason === "refusal") {
        throw new Error("Le modèle a refusé de traiter ce texte.")
      }
      const text = response.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("")
        .trim()
      if (!text) throw new Error("Réponse vide du modèle.")
      return { text, words: wordCount(text) }
    } catch (error) {
      friendlyError(error)
    }
  })

/* ---------------------------------------------------------------- detect */

const DetectionSchema = z.object({
  ai_score: z.number().describe("Probabilité globale (0 à 100) que le texte ait été généré par une IA"),
  verdict: z.enum(["humain", "mixte", "ia"]),
  summary: z.string().describe("Explication courte (2 à 3 phrases) en français"),
  signals: z.array(z.string()).describe("3 à 5 indices observés, en français"),
  sentences: z
    .array(
      z.object({
        text: z.string().describe("Phrase recopiée à l'identique depuis le texte"),
        ai_probability: z.number().describe("0 à 100"),
      }),
    )
    .describe("Toutes les phrases du texte, dans l'ordre"),
})

export type DetectionResult = z.infer<typeof DetectionSchema>

const DetectInput = z.object({ text: z.string().min(1) })

export const detectAI = createServerFn({ method: "POST" })
  .validator((data: unknown) => DetectInput.parse(data))
  .handler(async ({ data }) => {
    const words = wordCount(data.text)
    if (words > MAX_WORDS) throw new Error(`Texte trop long (${words} mots, maximum ${MAX_WORDS}).`)

    const system = [
      "Tu es un linguiste spécialisé dans l'analyse stylométrique des textes générés par des modèles de langage.",
      "Évalue la probabilité que le texte fourni ait été généré par une IA en t'appuyant sur des indices concrets :",
      "uniformité du rythme et de la longueur des phrases, transitions stéréotypées, vocabulaire générique,",
      "structure trop symétrique, absence d'expérience personnelle, de maladresses ou de détails spécifiques.",
      "Sois nuancé : un texte formel n'est pas forcément écrit par une IA. Découpe le texte en phrases,",
      "recopie chaque phrase exactement et donne-lui une probabilité. Réponds en français.",
    ].join(" ")

    try {
      const response = await getClient().beta.messages.parse({
        model: MODEL,
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium", format: betaZodOutputFormat(DetectionSchema) },
        system,
        messages: [{ role: "user", content: `Texte à analyser :\n\n${data.text}` }],
      })
      if (response.stop_reason === "refusal") throw new Error("Le modèle a refusé d'analyser ce texte.")
      const parsed = response.parsed_output
      if (!parsed) throw new Error("Analyse illisible, réessaie.")
      const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
      return {
        ...parsed,
        ai_score: clamp(parsed.ai_score),
        sentences: parsed.sentences.map((s) => ({ ...s, ai_probability: clamp(s.ai_probability) })),
      } satisfies DetectionResult
    } catch (error) {
      friendlyError(error)
    }
  })
