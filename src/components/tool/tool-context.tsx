import { createContext, useCallback, useContext, useMemo, useState } from "react"

export type ToolTab = "rewrite" | "detect" | "pdf"

type Injection = { tab: ToolTab; text: string; run: boolean; id: number }

type ToolContextValue = {
  tab: ToolTab
  setTab: (tab: ToolTab) => void
  /** Change d'onglet et fait défiler jusqu'à l'outil. */
  open: (tab: ToolTab) => void
  /** Envoie un texte vers un onglet (et lance éventuellement le traitement). */
  sendTo: (tab: ToolTab, text: string, run?: boolean) => void
  injection: Injection | null
}

const ToolContext = createContext<ToolContextValue | null>(null)

export function ToolProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<ToolTab>("rewrite")
  const [injection, setInjection] = useState<Injection | null>(null)

  const scrollToTool = useCallback(() => {
    document.getElementById("outil")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const open = useCallback(
    (next: ToolTab) => {
      setTab(next)
      scrollToTool()
    },
    [scrollToTool],
  )

  const sendTo = useCallback(
    (next: ToolTab, text: string, run = false) => {
      setInjection({ tab: next, text, run, id: Date.now() })
      setTab(next)
      scrollToTool()
    },
    [scrollToTool],
  )

  const value = useMemo(() => ({ tab, setTab, open, sendTo, injection }), [tab, open, sendTo, injection])
  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>
}

export function useTool() {
  const ctx = useContext(ToolContext)
  if (!ctx) throw new Error("useTool doit être utilisé dans <ToolProvider>")
  return ctx
}

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export const MAX_WORDS = 2000
