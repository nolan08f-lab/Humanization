import { ChevronDownIcon, FileTextIcon, MenuIcon, ScanSearchIcon, SparklesIcon, WandSparklesIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTool, type ToolTab } from "@/components/tool/tool-context"
import { Logo } from "./logo"

const TOOLS: { tab: ToolTab; label: string; desc: string; icon: React.ReactNode }[] = [
  { tab: "rewrite", label: "Humaniser le texte", desc: "Réécriture naturelle", icon: <WandSparklesIcon /> },
  { tab: "detect", label: "Détecteur IA", desc: "Score et passages surlignés", icon: <ScanSearchIcon /> },
  { tab: "pdf", label: "PDF", desc: "Importer et traiter un PDF", icon: <FileTextIcon /> },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

const linkClass =
  "inline-flex cursor-pointer items-center px-1 pt-1 text-sm font-medium text-gray-800 transition-colors hover:text-indigo-600"

export function Navbar() {
  const { open } = useTool()

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200/20 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <div className="hidden items-center space-x-8 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger className={`${linkClass} group gap-1 outline-none`}>
                Outils
                <ChevronDownIcon className="size-4 transition-transform group-data-[popup-open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" sideOffset={10} className="w-64 rounded-xl p-1.5">
                {TOOLS.map((t) => (
                  <DropdownMenuItem
                    key={t.tab}
                    onClick={() => open(t.tab)}
                    className="cursor-pointer gap-3 rounded-lg px-2.5 py-2 [&_svg]:size-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      {t.icon}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{t.label}</span>
                      <span className="text-xs text-gray-500">{t.desc}</span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button type="button" className={linkClass} onClick={() => scrollTo("comment")}>
              Comment ça marche
            </button>
            <button type="button" className={linkClass} onClick={() => scrollTo("faq")}>
              FAQ
            </button>

            <button
              type="button"
              onClick={() => open("rewrite")}
              className="relative inline-flex h-10 cursor-pointer overflow-hidden rounded-full p-[1px] transition-transform hover:scale-105 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:outline-none"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1d4ed8_0%,#3b82f6_50%,#1d4ed8_100%)]" />
              <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                <SparklesIcon className="size-4" />
                Essayer
              </span>
            </button>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex transform cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:from-indigo-700 hover:to-violet-700 focus:outline-none">
                <MenuIcon className="size-4" />
                Menu
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="w-60 rounded-xl p-1.5">
                {TOOLS.map((t) => (
                  <DropdownMenuItem key={t.tab} onClick={() => open(t.tab)} className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-indigo-600 [&_svg]:size-4">
                    {t.icon}
                    <span className="text-sm font-medium text-gray-900">{t.label}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => scrollTo("comment")} className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium">
                  Comment ça marche
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollTo("faq")} className="cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium">
                  FAQ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
