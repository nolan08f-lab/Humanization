import { useRef, useState } from "react"
import { toast } from "sonner"
import { FileTextIcon, RefreshCwIcon, ScanSearchIcon, UploadCloudIcon, WandSparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { extractPdfText, formatSize, type ExtractedPdf } from "@/lib/pdf"
import { LoadingState, boxShadow } from "./parts"
import { MAX_WORDS, countWords, useTool } from "./tool-context"

export function PdfPanel() {
  const { sendTo } = useTool()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pdf, setPdf] = useState<ExtractedPdf | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Seuls les fichiers PDF sont acceptés.")
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (25 Mo maximum).")
      return
    }
    setLoading(true)
    setPdf(null)
    try {
      const res = await extractPdfText(file)
      if (!res.text) {
        toast.error("Aucun texte trouvé dans ce PDF (document scanné ou image ?).")
        return
      }
      setPdf(res)
    } catch (e) {
      console.error(e)
      toast.error("Impossible de lire ce PDF (fichier protégé ou corrompu ?).")
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const words = pdf ? countWords(pdf.text) : 0
  const tooLong = words > MAX_WORDS

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void handleFile(e.dataTransfer.files?.[0])
        }}
        className={cn(
          "group flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[26px] border-2 border-dashed p-6 text-center transition-all md:min-h-[400px]",
          dragging ? "border-indigo-500 bg-indigo-50/70" : "border-[#cdc4e8] bg-white/35 hover:border-indigo-400 hover:bg-indigo-50/40",
        )}
      >
        <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[17px] border border-[#ece8f7] bg-white text-indigo-600 shadow-[0_10px_22px_-12px_rgba(94,71,230,0.4)] transition-transform group-hover:-translate-y-1">
          <UploadCloudIcon className="size-7" />
        </div>
        <div className="text-base font-semibold text-[#6b6478]">Glisse ton PDF ici ou clique pour choisir</div>
        <div className="text-xs font-bold tracking-[0.1em] text-[#b6afc4] uppercase">PDF · 25 Mo max · traité localement</div>
      </button>

      <div
        className={cn(
          "flex min-h-[320px] flex-col rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm md:min-h-[400px]",
          boxShadow,
        )}
      >
        {loading ? (
          <LoadingState label="Extraction du texte…" />
        ) : pdf ? (
          <div className="animate-fade-up flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="font-bricolage flex h-12 w-10 shrink-0 items-center justify-center rounded-[7px] bg-gradient-to-br from-[#6e57f0] to-[#4a35c9] text-[11px] font-extrabold tracking-wide text-white shadow-[0_8px_16px_-8px_rgba(94,71,230,0.7)]">
                PDF
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold text-[#181226]">{pdf.name}</div>
                <div className="text-[12.5px] text-[#9a93a8]">
                  {formatSize(pdf.size)} · {pdf.pages} page{pdf.pages > 1 ? "s" : ""} · {words} mots
                </div>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                aria-label="Changer de fichier"
                className="ml-auto cursor-pointer rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <RefreshCwIcon className="size-4" />
              </button>
            </div>

            <div className="max-h-[220px] min-h-0 flex-1 overflow-auto rounded-lg bg-gray-50/80 p-3 text-xs leading-relaxed whitespace-pre-wrap text-gray-600 ring-1 ring-gray-100">
              {pdf.text}
            </div>

            {tooLong && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-100">
                Ce document dépasse {MAX_WORDS} mots : il sera ouvert dans l'éditeur, où tu pourras ne garder qu'une partie.
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => sendTo("detect", pdf.text, !tooLong)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:from-indigo-700 hover:to-violet-700"
              >
                <ScanSearchIcon className="size-4" />
                Analyser le PDF
              </button>
              <button
                type="button"
                onClick={() => sendTo("rewrite", pdf.text)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-indigo-700 shadow-sm transition-all hover:scale-[1.02] hover:bg-indigo-50"
              >
                <WandSparklesIcon className="size-4" />
                Réécrire le texte
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <FileTextIcon className="size-8 text-gray-300" />
            <span className="max-w-xs text-sm text-gray-400 sm:text-base">
              Le contenu de ton PDF apparaîtra ici. Le fichier ne quitte pas ton ordinateur : seul le texte est envoyé à
              Claude quand tu lances une analyse.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
