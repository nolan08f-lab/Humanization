import { useEffect, useRef, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"
import { FileUpIcon, WandSparklesIcon } from "lucide-react"
import { detectAI, type DetectionResult } from "@/server/ai"
import { cn } from "@/lib/utils"
import { ActionButton, HelpBubble, InputBox, LoadingState, OutputBox, SmallAction } from "./parts"
import { MAX_WORDS, countWords, useTool } from "./tool-context"

const VERDICT = {
  humain: { label: "Probablement humain", color: "text-emerald-600", ring: "#10b981" },
  mixte: { label: "Mixte / incertain", color: "text-amber-600", ring: "#f59e0b" },
  ia: { label: "Probablement généré par IA", color: "text-rose-600", ring: "#e11d48" },
} as const

function sentenceClass(p: number) {
  if (p >= 67) return "bg-rose-100 decoration-rose-300"
  if (p >= 34) return "bg-amber-100 decoration-amber-300"
  return ""
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#eef2ff" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bricolage text-3xl font-extrabold text-gray-900">{score}%</span>
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">IA</span>
      </div>
    </div>
  )
}

export function DetectPanel() {
  const { injection, sendTo, open } = useTool()
  const detect = useServerFn(detectAI)
  const [input, setInput] = useState("")
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const lastInjection = useRef(0)

  const words = countWords(input)
  const canRun = words > 0 && words <= MAX_WORDS && !loading

  async function run(text = input) {
    if (!text.trim() || loading) return
    setLoading(true)
    setResult(null)
    try {
      setResult(await detect({ data: { text } }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "L'analyse a échoué.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (injection?.tab === "detect" && injection.id !== lastInjection.current) {
      lastInjection.current = injection.id
      setInput(injection.text)
      setResult(null)
      if (injection.run) void run(injection.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injection])

  const verdict = result ? VERDICT[result.verdict] : null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
      <div className="flex flex-col">
        <InputBox
          value={input}
          onChange={setInput}
          disabled={loading}
          placeholder="Colle le texte à analyser ici..."
          footer={
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                Analyse stylométrique par Claude
                <HelpBubble>
                  Le score est une estimation basée sur le style (rythme, tournures, vocabulaire). Aucun détecteur n'est
                  fiable à 100 % : ne l'utilise jamais comme preuve.
                </HelpBubble>
              </div>
              <SmallAction onClick={() => open("pdf")} icon={<FileUpIcon className="size-3.5" />}>
                Importer un PDF
              </SmallAction>
            </div>
          }
        />
      </div>

      <div className="flex h-full flex-col">
        <OutputBox className="flex-1">
          {loading ? (
            <LoadingState label="Analyse de chaque phrase…" />
          ) : result && verdict ? (
            <div className="animate-fade-up space-y-5">
              <div className="flex items-center gap-5">
                <ScoreRing score={result.ai_score} color={verdict.ring} />
                <div className="min-w-0">
                  <div className={cn("text-lg font-bold", verdict.color)}>{verdict.label}</div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{result.summary}</p>
                </div>
              </div>

              {result.signals.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {result.signals.map((s) => (
                    <li key={s} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
                      {s}
                    </li>
                  ))}
                </ul>
              )}

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-rose-200" /> Très probablement IA
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-200" /> Douteux
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-gray-200" /> Humain
                  </span>
                </div>
                <p className="text-sm leading-7 text-gray-800 sm:text-base">
                  {result.sentences.map((s, i) => (
                    <span
                      key={i}
                      title={`${s.ai_probability} % IA`}
                      className={cn("rounded px-0.5 box-decoration-clone", sentenceClass(s.ai_probability))}
                    >
                      {s.text}{" "}
                    </span>
                  ))}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                <SmallAction onClick={() => sendTo("rewrite", input)} icon={<WandSparklesIcon className="size-3.5" />}>
                  Réécrire ce texte
                </SmallAction>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400 sm:text-base">Le score et les passages détectés apparaîtront ici...</span>
          )}
        </OutputBox>
        <ActionButton disabled={!canRun} onClick={() => run()}>
          {loading ? "Analyse…" : "Analyser"}
        </ActionButton>
      </div>
    </div>
  )
}
