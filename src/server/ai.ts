import { createServerFn } from "@tanstack/react-start"
import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import { z } from "zod"

/*
 * Moteur IA
 * - Par défaut : Ollama (gratuit, 100 % local) sur http://localhost:11434
 * - Si ANTHROPIC_API_KEY est défini dans .env : Claude (Anthropic)
 */

export const MAX_WORDS = 2000

const OLLAMA_URL = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "")
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b"
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5"

type Provider = "ollama" | "claude"

function provider(): Provider {
  return process.env.ANTHROPIC_API_KEY ? "claude" : "ollama"
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

/* ------------------------------------------------------------ prompts */

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

function rewriteSystem(tone: keyof typeof TONES, intensity: keyof typeof INTENSITIES) {
  return [
    "Tu es un éditeur littéraire. Tu réécris le texte fourni pour qu'il se lise de manière naturelle et humaine :",
    "varie la longueur et le rythme des phrases, évite les tournures stéréotypées, les listes artificielles,",
    "les transitions mécaniques (« De plus », « En conclusion », « Il est important de noter ») et le vocabulaire pompeux.",
    `Ton recherché : ${TONES[tone]}.`,
    INTENSITIES[intensity],
    "Règles : conserve exactement le sens, les faits, les chiffres, les noms propres et les citations. N'ajoute aucune information.",
    "Réponds dans la même langue que le texte d'origine. Conserve les paragraphes.",
    "Renvoie uniquement le texte réécrit, sans titre, sans commentaire et sans guillemets autour.",
  ].join(" ")
}

const DETECT_SYSTEM = [
  "Tu es un linguiste spécialisé dans l'analyse stylométrique des textes générés par des modèles de langage.",
  "Évalue la probabilité que le texte fourni ait été généré par une IA en t'appuyant sur des indices concrets :",
  "uniformité du rythme et de la longueur des phrases, transitions stéréotypées, vocabulaire générique,",
  "structure trop symétrique, absence d'expérience personnelle, de maladresses ou de détails spécifiques.",
  "Sois nuancé : un texte formel n'est pas forcément écrit par une IA. Découpe le texte en phrases,",
  "recopie chaque phrase exactement et donne-lui une probabilité. Réponds en français.",
  "Réponds uniquement avec un objet JSON contenant : ai_score (0-100), verdict (\"humain\", \"mixte\" ou \"ia\"),",
  "summary (2-3 phrases), signals (3 à 5 indices courts), sentences (liste de { text, ai_probability }).",
].join(" ")

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

/* ------------------------------------------------------------- ollama */

async function ollamaChat(system: string, user: string, format?: object): Promise<string> {
  let res: Response
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        think: false,
        ...(format ? { format } : {}),
        options: { temperature: format ? 0.2 : 0.8, num_ctx: 16384 },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    })
  } catch {
    throw new Error("Ollama ne répond pas. Ouvre l'application Ollama (ou lance « ollama serve ») puis réessaie.")
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    if (res.status === 404 || /not found/i.test(body)) {
      throw new Error(`Le modèle « ${OLLAMA_MODEL} » n'est pas installé. Lance « ollama pull ${OLLAMA_MODEL} » dans un terminal.`)
    }
    throw new Error(`Erreur Ollama (${res.status}) : ${body.slice(0, 200)}`)
  }
  const data = (await res.json()) as { message?: { content?: string } }
  // retire un éventuel bloc de réflexion
  return (data.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim()
}

/* ------------------------------------------------------------- claude */

function claudeError(error: unknown): never {
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
  throw error instanceof Error ? error : new Error("Erreur inconnue.")
}

/* ---------------------------------------------------------------- status */

export const getEngineStatus = createServerFn({ method: "GET" }).handler(async () => {
  if (provider() === "claude") {
    return { provider: "claude" as const, ready: true, model: CLAUDE_MODEL, message: `Claude (${CLAUDE_MODEL})` }
  }
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(2000) })
    const data = (await res.json()) as { models?: { name: string }[] }
    const names = (data.models ?? []).map((m) => m.name)
    const wanted = OLLAMA_MODEL.includes(":") ? OLLAMA_MODEL : `${OLLAMA_MODEL}:latest`
    const installed = names.includes(wanted) || names.includes(OLLAMA_MODEL)
    return {
      provider: "ollama" as const,
      ready: installed,
      model: OLLAMA_MODEL,
      message: installed
        ? `Ollama local (${OLLAMA_MODEL})`
        : `Ollama tourne, mais le modèle n'est pas installé. Lance « ollama pull ${OLLAMA_MODEL} ».`,
    }
  } catch {
    return {
      provider: "ollama" as const,
      ready: false,
      model: OLLAMA_MODEL,
      message: "Ollama n'est pas lancé. Installe-le depuis ollama.com puis ouvre l'application.",
    }
  }
})

/* --------------------------------------------------------------- rewrite */

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
    const system = rewriteSystem(data.tone, data.intensity)

    let text: string
    if (provider() === "ollama") {
      text = await ollamaChat(system, data.text)
    } else {
      try {
        const response = await new Anthropic().beta.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 16000,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: "medium" },
          system,
          messages: [{ role: "user", content: data.text }],
        })
        if (response.stop_reason === "refusal") throw new Error("Le modèle a refusé de traiter ce texte.")
        text = response.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim()
      } catch (error) {
        claudeError(error)
      }
    }
    if (!text) throw new Error("Réponse vide du modèle.")
    return { text, words: wordCount(text) }
  })

/* ---------------------------------------------------------------- detect */

const DetectInput = z.object({ text: z.string().min(1) })

function normalize(parsed: DetectionResult): DetectionResult {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)))
  return {
    ...parsed,
    ai_score: clamp(parsed.ai_score),
    sentences: parsed.sentences.map((s) => ({ ...s, ai_probability: clamp(s.ai_probability) })),
  }
}

export const detectAI = createServerFn({ method: "POST" })
  .validator((data: unknown) => DetectInput.parse(data))
  .handler(async ({ data }) => {
    const words = wordCount(data.text)
    if (words > MAX_WORDS) throw new Error(`Texte trop long (${words} mots, maximum ${MAX_WORDS}).`)
    const user = `Texte à analyser :\n\n${data.text}`

    if (provider() === "ollama") {
      const raw = await ollamaChat(DETECT_SYSTEM, user, z.toJSONSchema(DetectionSchema))
      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)
      let value: unknown = null
      try {
        value = JSON.parse(json)
      } catch {
        /* traité juste en dessous */
      }
      const parsed = DetectionSchema.safeParse(value)
      if (!parsed.success) throw new Error("Le modèle local a renvoyé une analyse illisible, réessaie.")
      return normalize(parsed.data)
    }

    try {
      const response = await new Anthropic().beta.messages.parse({
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium", format: betaZodOutputFormat(DetectionSchema) },
        system: DETECT_SYSTEM,
        messages: [{ role: "user", content: user }],
      })
      if (response.stop_reason === "refusal") throw new Error("Le modèle a refusé d'analyser ce texte.")
      if (!response.parsed_output) throw new Error("Analyse illisible, réessaie.")
      return normalize(response.parsed_output)
    } catch (error) {
      claudeError(error)
    }
  })
