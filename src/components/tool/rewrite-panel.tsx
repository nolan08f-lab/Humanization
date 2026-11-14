import { useEffect, useRef, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"
import { CheckIcon, CopyIcon, DownloadIcon, ScanSearchIcon } from "lucide-react"
import { rewriteText } from "@/server/ai"
import {
  ActionButton,
  Chip,
  HelpBubble,
  InputBox,
  LoadingState,
  OptionGroup,
  OutputBox,
  Segmented,
  SmallAction,
} from "./parts"
import { MAX_WORDS, countWords, useTool } from "./tool-context"

type Tone = "naturel" | "academique" | "simple" | "formel"
type Intensity = "legere" | "moyenne" | "forte"

const TONES: { value: Tone; label: string }[] = [
  { value: "naturel", label: "Naturel" },
  { value: "academique", label: "Académique" },
  { value: "simple", label: "Simple" },
  { value: "formel", label: "Formel" },
]

export function RewritePanel() {
  const { injection, sendTo } = useTool()
  const rewrite = useServerFn(rewriteText)
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [tone, setTone] = useState<Tone>("naturel")
  const [intensity, setIntensity] = useState<Intensity>("moyenne")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const lastInjection = useRef(0)

  const words = countWords(input)
  const canRun = words > 0 && words <= MAX_WORDS && !loading

  async function run(text = input) {
    if (!text.trim() || loading) return
    setLoading(true)
    setOutput("")
    try {
      const res = await rewrite({ data: { text, tone, intensity } })
      setOutput(res.text)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "La réécriture a échoué.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (injection?.tab === "rewrite" && injection.id !== lastInjection.current) {
      lastInjection.current = injection.id
      setInput(injection.text)
      setOutput("")
      if (injection.run) void run(injection.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injection])

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success("Texte copié")
    setTimeout(() => setCopied(false), 1500)
  }

  function download() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "texte-reecrit.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
      <div className="flex flex-col">
        <InputBox
          value={input}
          onChange={setInput}
          disabled={loading}
          placeholder="Colle ton texte ici..."
          footer={
            <>
              <OptionGroup label="Quel ton veux-tu donner ?" shortLabel="Ton">
                {TONES.map((t) => (
                  <Chip key={t.value} active={tone === t.value} onClick={() => setTone(t.value)}>
                    {t.label}
                  </Chip>
                ))}
              </OptionGroup>
              <div className="hidden w-px self-stretch bg-gray-200 sm:block" />
              <OptionGroup label="Intensité" shortLabel="Intensité">
                <div className="flex items-center gap-1.5">
                  <Segmented
                    value={intensity}
                    onChange={setIntensity}
                    options={[
                      { value: "legere", label: "Légère" },
                      { value: "moyenne", label: "Moyenne" },
                      { value: "forte", label: "Forte" },
                    ]}
                  />
                  <HelpBubble>
                    <b>Légère</b> : corrige et fluidifie. <b>Moyenne</b> : reformule les passages lourds.{" "}
                    <b>Forte</b> : réécrit entièrement avec de nouvelles tournures, sans changer le sens.
                  </HelpBubble>
                </div>
              </OptionGroup>
            </>
          }
        />
      </div>

      <div className="flex h-full flex-col">
        <OutputBox className="flex-1">
          {loading ? (
            <LoadingState label="Réécriture en cours…" />
          ) : output ? (
            <div className="space-y-4">
              <div className="text-sm whitespace-pre-wrap text-gray-800 sm:text-base">{output}</div>
              <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-gray-100 bg-white/90 pt-3 backdrop-blur">
                <SmallAction onClick={copy} icon={copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}>
                  {copied ? "Copié" : "Copier"}
                </SmallAction>
                <SmallAction onClick={download} icon={<DownloadIcon className="size-3.5" />}>
                  Télécharger
                </SmallAction>
                <SmallAction onClick={() => sendTo("detect", output, true)} icon={<ScanSearchIcon className="size-3.5" />}>
                  Analyser ce texte
                </SmallAction>
                <span className="ml-auto self-center text-[11px] text-gray-400">{countWords(output)} mots</span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400 sm:text-base">Le texte transformé apparaîtra ici...</span>
          )}
        </OutputBox>
        <ActionButton disabled={!canRun} onClick={() => run()}>
          {loading ? "Transformation…" : "Transformer"}
        </ActionButton>
      </div>
    </div>
  )
}
