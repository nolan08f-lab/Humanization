import { useEffect, useRef, useState } from "react"
import { ChevronDownIcon, UploadCloudIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTool } from "@/components/tool/tool-context"

const STEPS = [
  { h: "Dépose ton PDF", d: "Glisse ton document dans la zone.", side: "left" },
  { h: "On lit le texte", d: "Directement dans ton navigateur.", side: "right" },
  { h: "Claude l'analyse", d: "Chaque phrase reçoit un score.", side: "left" },
  { h: "Ton score détaillé", d: "Score global et passages surlignés.", side: "right", green: true },
] as const

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
/** progression locale d'une étape (0 → 1) */
const seg = (p: number, from: number, to: number) => clamp((p - from) / (to - from))

function StepText({ i, active }: { i: number; active: boolean }) {
  const s = STEPS[i]
  const right = s.side === "right"
  const green = "green" in s && s.green
  return (
    <div
      className={cn(
        "absolute top-1/2 z-[7] flex w-[min(300px,21vw)] flex-col transition-all duration-500",
        right ? "right-[clamp(28px,5vw,72px)] items-end text-right" : "left-[clamp(28px,5vw,72px)] items-start text-left",
        active ? "-translate-y-1/2 opacity-100" : "pointer-events-none -translate-y-[calc(50%-26px)] opacity-0",
      )}
    >
      <span
        className={cn(
          "font-bricolage pointer-events-none absolute -top-[62px] z-0 text-[clamp(72px,7vw,116px)] leading-none font-extrabold tracking-[-0.04em] select-none",
          right ? "-right-1.5" : "-left-1.5",
          green ? "text-[rgba(15,163,113,0.1)]" : "text-[rgba(94,71,230,0.09)]",
        )}
      >
        0{i + 1}
      </span>
      <div
        className={cn(
          "relative z-[1] mb-3.5 h-1 w-[46px] rounded-full transition-transform delay-150 duration-700",
          right ? "origin-right" : "origin-left",
          active ? "scale-x-100" : "scale-x-0",
          green ? "bg-gradient-to-r from-[#0fa371] to-[#34d399]" : "bg-gradient-to-r from-[#6e57f0] to-[#a855f7]",
        )}
      />
      <div
        className={cn(
          "font-jakarta relative z-[1] text-[13px] font-extrabold tracking-[0.18em] uppercase",
          green ? "text-[#0b7d56]" : "text-[#5e47e6]",
        )}
      >
        Étape 0{i + 1}
      </div>
      <h3 className="font-jakarta relative z-[1] mt-4 text-[clamp(32px,4vw,54px)] leading-[1.05] font-extrabold tracking-[-0.03em] text-[#181226]">
        {s.h}
      </h3>
      <p className="font-jakarta relative z-[1] mt-[18px] text-[17px] leading-[1.55] text-[#6b6478]">{s.d}</p>
    </div>
  )
}

function PdfCard({ p, compact = false }: { p: number; compact?: boolean }) {
  // 0 → 0.25 : la carte tombe dans la zone ; 0.5 → 0.75 : marquage ; 0.75 → 1 : score
  const drop = compact ? 1 : seg(p, 0.02, 0.22)
  const mark = compact ? 1 : seg(p, 0.5, 0.7)
  const score = compact ? 1 : seg(p, 0.75, 0.9)
  const tx = 110 * (1 - drop)
  const ty = 70 * (1 - drop) - 10 * drop
  const rot = 6 * (1 - drop)
  const lines = ["100%", "92%", "97%", "64%", "88%", "78%", "54%"]
  const flagged = [0, 1, 3, 5]
  return (
    <div
      className="absolute top-1/2 left-1/2 z-30 w-[300px] max-w-[80vw]"
      style={{
        transform: `perspective(1000px) translate(-50%, -50%) translate3d(${tx}px, ${ty}px, ${40 * (1 - drop)}px) rotate(${rot}deg) rotateY(${-8 * (1 - drop)}deg) rotateX(${6 * (1 - drop)}deg)`,
      }}
    >
      <div className="relative rounded-[18px] border border-[#ece8f7] bg-white px-[22px] pt-[22px] pb-[26px] shadow-[0_44px_84px_-30px_rgba(24,18,38,0.42)]">
        <div
          className="absolute -top-[18px] left-1/2 z-40 -translate-x-1/2 rounded-full px-4 py-1.5 text-[15px] font-extrabold whitespace-nowrap shadow-[0_8px_20px_-8px_rgba(192,57,74,0.5)] ring-1 transition-all duration-300"
          style={{
            opacity: compact ? 1 : seg(p, 0.55, 0.65),
            background: "#fdecee",
            color: "#c0394a",
            borderColor: "#f7c9cf",
          }}
        >
          {Math.round(86 * (compact ? 1 : Math.max(mark * 0.6, score)))} % IA
        </div>
        <div className="flex items-center gap-3">
          <div className="font-bricolage flex h-12 w-10 items-center justify-center rounded-[7px] bg-gradient-to-br from-[#6e57f0] to-[#4a35c9] text-[11px] font-extrabold tracking-wide text-white shadow-[0_8px_16px_-8px_rgba(94,71,230,0.7)]">
            PDF
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold text-[#181226]">rapport-final.pdf</div>
            <div className="text-[12.5px] text-[#9a93a8]">312 Ko · 24 pages</div>
          </div>
        </div>
        <div className="relative mt-[18px] flex flex-col gap-[9px]">
          {lines.map((w, i) => (
            <div key={i} className="relative">
              <div
                className={cn("h-[9px] rounded-[5px]", i >= 4 ? "mt-0" : "", i === 4 ? "mt-1.5" : "")}
                style={{
                  width: w,
                  background: flagged.includes(i)
                    ? `color-mix(in oklab, #e5394a ${Math.round(mark * 28)}%, ${i < 4 ? "#efebf8" : "#f4f1fb"})`
                    : i < 4
                      ? "#efebf8"
                      : "#f4f1fb",
                }}
              />
              {flagged.includes(i) && (
                <span
                  className="absolute top-1/2 -right-3 inline-flex items-center rounded-full bg-[#c0394a] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-white shadow-[0_6px_14px_-6px_rgba(192,57,74,0.75)]"
                  style={{
                    opacity: mark,
                    transform: `translateY(-50%) scale(${0.5 + 0.5 * mark})`,
                  }}
                >
                  IA
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DropZone({ p, compact = false }: { p: number; compact?: boolean }) {
  const scan = compact ? 0 : seg(p, 0.27, 0.48)
  const scanning = !compact && p > 0.26 && p < 0.49
  return (
    <div className="absolute inset-0 rounded-[26px] border-2 border-dashed border-[#cdc4e8] bg-white/35">
      <div
        className="absolute top-1/2 right-0 left-0 flex -translate-y-1/2 flex-col items-center gap-3.5 px-6 text-center transition-opacity duration-500"
        style={{ opacity: compact ? 0 : 1 - seg(p, 0.05, 0.18) }}
      >
        <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[17px] border border-[#ece8f7] bg-white text-[#5e47e6] shadow-[0_10px_22px_-12px_rgba(94,71,230,0.4)]">
          <UploadCloudIcon className="size-7" />
        </div>
        <div className="text-base font-semibold text-[#6b6478]">Glisse ton PDF ici</div>
        <div className="text-xs font-bold tracking-[0.1em] text-[#b6afc4]">PDF · 24 PAGES · 312 KO</div>
      </div>
      <div
        className="absolute right-[18px] left-[18px] h-[3px] rounded-[3px] bg-gradient-to-r from-transparent via-[#5e47e6] to-transparent shadow-[0_0_22px_5px_rgba(94,71,230,0.6)]"
        style={{ top: `${8 + scan * 84}%`, opacity: scanning ? 1 : 0 }}
      />
    </div>
  )
}

export function PdfStory() {
  const { open } = useTool()
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      setP(total > 0 ? clamp(-r.top / total) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const step = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3
  const title = seg(p, 0, 0.06)

  return (
    <div id="comment" className="scroll-mt-16">
      {/* Version bureau : section épinglée pilotée par le scroll */}
      <div ref={ref} className="relative hidden h-[400vh] md:block">
        <section className="bg-grid font-hanken sticky top-0 h-screen min-h-[640px] overflow-hidden bg-[#fbfafe]">
          <div className="pointer-events-none absolute -top-[140px] -left-20 h-[520px] w-[560px] bg-[radial-gradient(circle,rgba(110,87,240,0.13),transparent_65%)] blur-[8px]" />
          <div className="pointer-events-none absolute -right-[60px] -bottom-[160px] h-[480px] w-[480px] bg-[radial-gradient(circle,rgba(15,163,113,0.12),transparent_65%)] blur-[8px]" />
          <div className="relative mx-auto h-full max-w-[1240px] px-[clamp(28px,5vw,72px)]">
            <h2 className="font-bricolage pointer-events-none absolute top-[104px] right-0 left-0 z-[8] text-center text-[clamp(18px,2.4vw,32px)] leading-none font-extrabold tracking-[-0.02em] whitespace-nowrap">
              <span
                className="inline-block text-[#181226]"
                style={{ clipPath: `inset(0 ${100 - Math.max(title, 0.001) * 100}% 0 0)` }}
              >
                <span className="text-[#5e47e6]">Nouveau</span> Analyse de PDF
              </span>
            </h2>

            {STEPS.map((_, i) => (
              <StepText key={i} i={i} active={step === i && p > 0.01} />
            ))}

            <div
              className={cn(
                "absolute right-[clamp(28px,5vw,72px)] bottom-[14%] z-[7] transition-all duration-500",
                step === 3 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <button
                type="button"
                onClick={() => open("pdf")}
                className="inline-flex cursor-pointer items-center gap-2.5 rounded-[14px] bg-gradient-to-br from-[#6e57f0] to-[#4a35c9] px-[26px] py-[15px] text-base font-bold whitespace-nowrap text-white shadow-[0_16px_32px_-14px_rgba(94,71,230,0.85)] transition-transform hover:scale-105"
              >
                Essayer l'analyse PDF <span className="text-[17px]">→</span>
              </button>
            </div>

            <div className="absolute top-1/2 left-1/2 z-[5] h-[520px] max-h-[62vh] w-[min(440px,40vw)] -translate-x-1/2 -translate-y-1/2">
              <DropZone p={p} />
              <PdfCard p={p} />
            </div>

            <div
              className="pointer-events-none absolute right-0 bottom-[30px] left-0 z-[9] flex flex-col items-center gap-1.5 transition-opacity"
              style={{ opacity: 1 - seg(p, 0.85, 0.95) }}
            >
              <span className="font-jakarta text-xs font-extrabold tracking-[0.2em] text-[#8b83a0] uppercase">Scroll</span>
              <span className="animate-bounce-arrow inline-flex text-[#5e47e6]">
                <ChevronDownIcon className="size-5" />
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Version mobile : étapes empilées */}
      <section className="bg-grid font-hanken relative overflow-hidden bg-[#fbfafe] px-6 py-16 md:hidden">
        <h2 className="font-bricolage text-center text-2xl font-extrabold tracking-tight text-[#181226]">
          <span className="text-[#5e47e6]">Nouveau</span> Analyse de PDF
        </h2>
        <div className="relative mx-auto mt-10 h-[300px] max-w-[340px]">
          <DropZone p={1} compact />
          <PdfCard p={1} compact />
        </div>
        <ol className="mt-12 space-y-8">
          {STEPS.map((s, i) => (
            <li key={s.h} data-reveal>
              <div className={cn("font-jakarta text-xs font-extrabold tracking-[0.18em] uppercase", "green" in s ? "text-[#0b7d56]" : "text-[#5e47e6]")}>
                Étape 0{i + 1}
              </div>
              <h3 className="font-jakarta mt-2 text-3xl font-extrabold tracking-tight text-[#181226]">{s.h}</h3>
              <p className="font-jakarta mt-2 text-base text-[#6b6478]">{s.d}</p>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => open("pdf")}
          className="mt-10 inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[14px] bg-gradient-to-br from-[#6e57f0] to-[#4a35c9] px-6 py-4 text-base font-bold text-white shadow-[0_16px_32px_-14px_rgba(94,71,230,0.85)]"
        >
          Essayer l'analyse PDF →
        </button>
      </section>
    </div>
  )
}
