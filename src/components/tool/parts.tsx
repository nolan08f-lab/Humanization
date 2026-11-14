import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MAX_WORDS, countWords } from "./tool-context"

export const boxShadow =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]"

export function InputBox({
  value,
  onChange,
  placeholder,
  footer,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  footer?: React.ReactNode
  disabled?: boolean
}) {
  const words = countWords(value)
  const over = words > MAX_WORDS
  return (
    <div
      className={cn(
        "flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm",
        boxShadow,
      )}
    >
      <div className="relative flex flex-1 flex-col">
        <div
          className={cn(
            "pointer-events-none absolute right-3 bottom-3 z-20 inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium shadow-sm ring-1 backdrop-blur-sm sm:text-[11px]",
            over ? "text-red-600 ring-red-200" : "text-gray-500 ring-gray-200",
          )}
        >
          <span>{words}</span>/{MAX_WORDS} mots
        </div>
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-3 right-3 z-20 rounded-full px-2 py-0.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            Effacer
          </button>
        )}
        <textarea
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[280px] w-full flex-1 resize-none border-0 bg-transparent p-4 pr-16 pb-12 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none sm:pb-4 sm:text-base"
        />
      </div>
      {footer && (
        <div className="flex flex-col gap-2.5 border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-3 sm:gap-y-3">
          {footer}
        </div>
      )}
    </div>
  )
}

export function OptionGroup({
  label,
  shortLabel,
  children,
}: {
  label: string
  shortLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 sm:block">
      <div className="min-w-[68px] shrink-0 text-xs font-semibold text-gray-500 sm:mb-2 sm:min-w-0">
        <span className="sm:hidden">{shortLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium whitespace-nowrap transition-all",
        active
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
          : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/60",
      )}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="inline-flex items-center rounded-full bg-gray-100 p-0.5 ring-1 ring-gray-200">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "cursor-pointer rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap transition-all",
            value === o.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function HelpBubble({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="Aide"
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-[11px] font-bold text-gray-500 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
          />
        }
      >
        ?
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left leading-relaxed">{children}</TooltipContent>
    </Tooltip>
  )
}

export function OutputBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative min-h-[320px] w-full overflow-auto rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm md:min-h-[400px]",
        boxShadow,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 text-center">
      <div className="relative h-1.5 w-48 overflow-hidden rounded-full bg-indigo-100">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-[indeterminate_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" />
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  )
}

export function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <div className="mt-4">
      <div aria-hidden="true" className="invisible mb-2 hidden text-xs font-semibold select-none md:block">
        &nbsp;
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="w-full transform cursor-pointer rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:from-indigo-700 hover:to-violet-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {children}
      </button>
    </div>
  )
}

export function SmallAction({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition-all hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700"
    >
      {icon}
      {children}
    </button>
  )
}
