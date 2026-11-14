import { useEffect, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { getEngineStatus } from "@/server/ai"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useTool, type ToolTab } from "./tool-context"
import { RewritePanel } from "./rewrite-panel"
import { DetectPanel } from "./detect-panel"
import { PdfPanel } from "./pdf-panel"

const TABS: { id: ToolTab; label: string; badge?: string }[] = [
  { id: "rewrite", label: "Humaniser le texte" },
  { id: "detect", label: "Détecteur IA" },
  { id: "pdf", label: "PDF", badge: "Nouveau" },
]

function EngineStatus() {
  const status = useServerFn(getEngineStatus)
  const [state, setState] = useState<{ configured: boolean; model: string } | null>(null)
  useEffect(() => {
    status().then(setState).catch(() => setState({ configured: false, model: "" }))
  }, [status])

  const ok = state?.configured
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="État du moteur"
            className="inline-flex shrink-0 cursor-help items-center gap-2 rounded-full bg-white p-2.5 sm:px-3 sm:py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-indigo-100 sm:px-4 sm:py-2 sm:text-sm"
          />
        }
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full sm:h-1.5 sm:w-1.5",
            state === null ? "bg-gray-300" : ok ? "bg-indigo-600" : "animate-pulse bg-rose-500",
          )}
        />
        <span className="hidden sm:inline">Moteur :</span>
        <span className={cn("hidden font-semibold sm:inline", ok ? "text-indigo-600" : "text-rose-600")}>
          {state === null ? "…" : ok ? "Claude" : "Clé manquante"}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-left leading-relaxed">
        {ok
          ? `Connecté à l'API Anthropic (modèle ${state?.model}).`
          : "Ajoute ANTHROPIC_API_KEY=... dans le fichier .env à la racine du projet, puis relance npm run dev."}
      </TooltipContent>
    </Tooltip>
  )
}

export function ToolCard() {
  const { tab, setTab } = useTool()

  return (
    <div id="outil" className="relative scroll-mt-20">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-indigo-50 p-3 shadow-sm ring-1 ring-indigo-200 sm:p-4">
          <div className="mb-3 flex flex-row items-center justify-between gap-2 sm:mb-4 sm:gap-3">
            <div role="tablist" className="-mx-1 flex min-w-0 items-center gap-1 overflow-x-auto px-1 sm:gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-all sm:px-4 sm:py-2.5 sm:text-sm",
                    tab === t.id ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  {t.label}
                  {t.badge && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase sm:text-[10px]">
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <EngineStatus />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            {/* Les panneaux restent montés pour conserver leur état entre les onglets */}
            <div hidden={tab !== "rewrite"}>
              <RewritePanel />
            </div>
            <div hidden={tab !== "detect"}>
              <DetectPanel />
            </div>
            <div hidden={tab !== "pdf"}>
              <PdfPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
