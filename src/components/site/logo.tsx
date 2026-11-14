import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-11 w-11", className)} aria-hidden>
      <defs>
        <linearGradient id="hz-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* feuille */}
      <path
        d="M12 5h17l9 9v26a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z"
        fill="#fff"
        stroke="url(#hz-g)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M29 5v7a2 2 0 0 0 2 2h7" fill="none" stroke="url(#hz-g)" strokeWidth="2.5" strokeLinejoin="round" />
      {/* lignes de texte */}
      <path d="M14 22h13M14 28h17M14 34h9" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" />
      {/* étincelle */}
      <path
        d="M34 26c.6 3.4 2.6 5.4 6 6-3.4.6-5.4 2.6-6 6-.6-3.4-2.6-5.4-6-6 3.4-.6 5.4-2.6 6-6Z"
        fill="url(#hz-g)"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#top" className={cn("group flex items-center", className)}>
      <LogoMark className="transition-transform duration-300 group-hover:scale-110" />
      <span className="ml-2 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-bold text-transparent">
        Humanization
      </span>
    </a>
  )
}
