import { useEffect } from "react"
import { ArrowRightIcon, ScanSearchIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTool } from "@/components/tool/tool-context"
import { Logo } from "./logo"

/** Ajoute .is-visible aux éléments [data-reveal] quand ils entrent dans l'écran. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]")
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const delay = Number((e.target as HTMLElement).dataset.revealDelay || 0)
            setTimeout(() => e.target.classList.add("is-visible"), delay)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ------------------------------------------------------------------ hero */

export function Hero() {
  return (
    <div className="animate-zoom-out relative flex items-center">
      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 lg:px-8">
        <div className="flex justify-center">
          <div className="relative z-10 max-w-5xl space-y-12 text-center">
            <h1 className="text-5xl leading-tight font-bold tracking-tight sm:text-6xl sm:leading-none lg:text-7xl">
              <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 bg-clip-text text-transparent lg:whitespace-nowrap">
                Réussissez vos écrits
              </span>
              <span className="block text-gray-900"> sans stress</span>
            </h1>
            <div className="mx-auto max-w-3xl">
              <div className="text-xl leading-relaxed text-gray-600 sm:text-2xl">
                Transformez vos textes rigides en contenus{" "}
                <span className="relative inline-block -rotate-1 transform">
                  <span className="font-marker relative z-10 px-2 py-1 font-bold text-emerald-700">naturels</span>
                  <span
                    className="absolute inset-0 rounded-lg opacity-70"
                    style={{
                      background:
                        "linear-gradient(45deg, rgb(16,185,129) 0%, rgb(52,211,153) 25%, rgb(110,231,183) 50%, rgb(52,211,153) 75%, rgb(16,185,129) 100%)",
                      filter: "blur(0.5px)",
                      transform: "rotate(-0.5deg) scaleY(1.2)",
                    }}
                  />
                  <span
                    className="absolute right-1 -bottom-1 left-1 h-2 -rotate-1 rounded-full opacity-60"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, rgb(110,231,183) 0px, rgb(52,211,153) 3px, rgb(16,185,129) 6px, rgb(52,211,153) 9px)",
                      filter: "blur(0.3px)",
                    }}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- marquee */

const USES = ["Dissertations", "Mémoires", "Rapports de stage", "Lettres de motivation", "E-mails", "Articles"]

export function Marquee() {
  const group = (
    <div className="flex items-center gap-x-[38px] px-[19px]">
      <span className="text-[13px] font-semibold whitespace-nowrap text-[#9a93a8]">Idéal pour&nbsp;:</span>
      {USES.map((u) => (
        <span key={u} className="text-[19px] font-bold whitespace-nowrap text-[#b7b0c6]">
          {u}
        </span>
      ))}
    </div>
  )
  return (
    <div className="mt-16 sm:mt-24">
      <div className="relative overflow-hidden border-y border-[#f1eef9] bg-white py-[22px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[90px] bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[90px] bg-gradient-to-l from-white to-transparent" />
        <div className="animate-marquee flex w-max hover:[animation-play-state:paused]" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>{group}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- features */

function ReportMock() {
  const lines = [
    { w: "100%", c: "bg-rose-100" },
    { w: "92%", c: "bg-rose-100" },
    { w: "97%", c: "bg-gray-100" },
    { w: "64%", c: "bg-amber-100" },
    { w: "88%", c: "bg-gray-100" },
    { w: "78%", c: "bg-rose-100" },
    { w: "54%", c: "bg-gray-100" },
  ]
  return (
    <div className="relative mx-auto max-w-xl">
      <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-tr from-indigo-200/60 via-violet-200/40 to-cyan-100/50 blur-2xl" />
      <div className="relative rounded-[22px] border border-[#eeebf8] bg-white p-6 shadow-[0_26px_55px_-20px_rgba(94,71,230,0.45)] sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-bricolage flex h-12 w-10 items-center justify-center rounded-[7px] bg-gradient-to-br from-[#6e57f0] to-[#4a35c9] text-[11px] font-extrabold text-white">
              PDF
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#181226]">memoire-master.pdf</div>
              <div className="text-[12.5px] text-[#9a93a8]">48 pages · 9 812 mots</div>
            </div>
          </div>
          <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600 ring-1 ring-rose-100">41 % IA</div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ["Phrases", "312"],
            ["Signalées", "74"],
            ["Douteuses", "39"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-indigo-50/70 p-3 text-center">
              <div className="font-bricolage text-2xl font-extrabold text-indigo-700">{v}</div>
              <div className="text-[11px] font-semibold tracking-wide text-indigo-400 uppercase">{k}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-[9px]">
          {lines.map((l, i) => (
            <div key={i} className={`h-[9px] rounded-[5px] ${l.c}`} style={{ width: l.w }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Features() {
  const { open } = useTool()
  return (
    <section id="rapports" className="relative overflow-hidden py-20 sm:py-16">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-7" data-reveal="left">
            <ReportMock />
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => open("detect")}
                className="group animate-float relative inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <ScanSearchIcon className="relative size-5" />
                <span className="relative font-semibold">Analyser mon texte</span>
                <span className="absolute -top-2 -right-2 h-4 w-4 animate-pulse rounded-full bg-emerald-400" />
              </button>
            </div>
          </div>

          <div className="order-1 space-y-8 lg:order-2 lg:col-span-5" data-reveal="right">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-5 py-2.5 shadow-md ring-1 ring-indigo-100 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">Nos rapports d'analyse</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                Comprenez ce que voient les détecteurs
              </span>
            </h2>
            <div className="grid gap-4">
              {[
                {
                  t: "Analyse phrase par phrase",
                  d: "Un score global, les phrases surlignées selon leur probabilité et les indices de style relevés par Claude.",
                },
                {
                  t: "Tranquillité d'esprit",
                  d: "Vérifiez votre propre travail avant de le rendre : les détecteurs se trompent souvent, mieux vaut savoir à quoi s'attendre.",
                },
              ].map((c) => (
                <div
                  key={c.t}
                  className="group relative overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.d}</p>
                  <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- faq */

const FAQ = [
  {
    q: "Comment fonctionne l'humanisation ?",
    a: "Ton texte est envoyé à Claude (Anthropic) avec des consignes d'écriture : varier le rythme des phrases, supprimer les tournures stéréotypées et le vocabulaire pompeux, tout en gardant exactement le sens, les faits et les chiffres. Tu choisis le ton et l'intensité de la réécriture.",
  },
  {
    q: "Le détecteur IA est-il fiable ?",
    a: "Non, et aucun ne l'est à 100 %. Le score est une estimation stylométrique (rythme, transitions, vocabulaire générique…). Un texte humain formel peut obtenir un score élevé. Sers-t'en comme indicateur, jamais comme preuve.",
  },
  {
    q: "Mes textes et mes PDF sont-ils stockés ?",
    a: "Non. L'application tourne sur ton ordinateur et ne garde rien. Les PDF sont lus directement dans ton navigateur ; seul le texte que tu choisis d'analyser ou de réécrire est envoyé à l'API Anthropic.",
  },
  {
    q: "Quelles langues sont prises en charge ?",
    a: "Toutes les langues courantes. La réécriture est toujours rendue dans la langue du texte d'origine, et l'analyse est rédigée en français.",
  },
  {
    q: "Pourquoi une limite de 2 000 mots ?",
    a: "Pour garder des réponses rapides et un coût maîtrisé par requête. Pour un long document, traite-le section par section.",
  },
  {
    q: "Comment configurer la clé API ?",
    a: "Crée un fichier .env à la racine du projet avec la ligne ANTHROPIC_API_KEY=ta_clé, puis relance npm run dev. L'indicateur « Moteur » en haut de l'outil passe alors à « Claude ».",
  },
]

export function Faq() {
  return (
    <section id="faq" className="relative scroll-mt-20 py-24 sm:py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center" data-reveal>
          <h2 className="text-lg leading-8 font-semibold tracking-tight text-indigo-600">FAQ</h2>
          <p className="mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Questions fréquentes
          </p>
        </div>
        <div className="mt-12" data-reveal data-reveal-delay="120">
          <Accordion className="gap-3">
            {FAQ.map((f) => (
              <AccordionItem
                key={f.q}
                value={f.q}
                className="rounded-[18px] border border-[#eeebf8] bg-white px-5 shadow-[0_14px_40px_-18px_rgba(94,71,230,0.25)] not-last:border-b"
              >
                <AccordionTrigger className="items-center py-4 text-base font-semibold text-[#181226] hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[15px] leading-relaxed text-slate-600">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- cta */

export function Cta() {
  const { open } = useTool()
  return (
    <div className="relative">
      <div className="relative mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8" data-reveal>
        <div className="relative isolate mx-2 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-24 text-center shadow-2xl sm:px-16">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ne laissez pas un texte maladroit gâcher vos efforts
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
            Tout fonctionne en local, avec ta propre clé API. Aucun compte, aucune carte bancaire.
          </p>
          <div className="relative mt-10 flex items-center justify-center gap-x-6">
            <button
              type="button"
              onClick={() => open("rewrite")}
              className="inline-flex h-12 transform cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-6 py-2 text-sm font-semibold text-indigo-600 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-50 hover:shadow-xl"
            >
              Commencer maintenant
              <ArrowRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- footer */

export function Footer() {
  const { open } = useTool()
  const link = "cursor-pointer text-sm text-gray-600 transition-colors hover:text-indigo-600"
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  return (
    <footer className="relative mt-auto bg-white/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-gray-500">Réécriture naturelle et analyse IA de vos textes, en local.</p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">Navigation</h3>
            <ul className="space-y-3">
              <li><button type="button" className={link} onClick={() => go("top")}>Accueil</button></li>
              <li><button type="button" className={link} onClick={() => go("comment")}>Comment ça marche</button></li>
              <li><button type="button" className={link} onClick={() => go("faq")}>FAQ</button></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">Outils</h3>
            <ul className="space-y-3">
              <li><button type="button" className={link} onClick={() => open("rewrite")}>Humaniser le texte</button></li>
              <li><button type="button" className={link} onClick={() => open("detect")}>Détecteur IA</button></li>
              <li><button type="button" className={link} onClick={() => open("pdf")}>PDF</button></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">Technique</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>Propulsé par Claude (Anthropic)</li>
              <li>PDF lus dans le navigateur</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 space-y-2 border-t border-gray-200 pt-8">
          <p className="text-center text-xs text-gray-400 italic">Fait avec le ❤️ pour mieux écrire</p>
          <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} Humanization. Usage personnel.</p>
        </div>
      </div>
    </footer>
  )
}
