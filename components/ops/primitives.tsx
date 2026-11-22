import { ArrowDownRight, ArrowUpRight, Info, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fmtPct } from '@/lib/format'

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-balance text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('flex min-w-0 flex-col rounded-xl border bg-card', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="text-sm font-medium">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className={cn('flex-1 px-5 pb-5 pt-4', bodyClassName)}>{children}</div>
    </section>
  )
}

export function Delta({ value, invert = false, className }: { value: number | null; invert?: boolean; className?: string }) {
  if (value === null || !Number.isFinite(value)) {
    return <span className={cn('inline-flex items-center gap-0.5 text-xs text-muted-foreground', className)}>—</span>
  }
  const flat = Math.abs(value) < 0.005
  const good = invert ? value < 0 : value > 0
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular',
        flat ? 'bg-muted text-muted-foreground' : good ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative',
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {fmtPct(value)}
    </span>
  )
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  invertDelta = true,
  hint,
  accent,
}: {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  delta?: number | null
  invertDelta?: boolean
  hint?: React.ReactNode
  accent?: 'truck' | 'trailer' | 'primary'
}) {
  return (
    <div className="group relative flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-ring/30">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {accent && (
          <span
            className={cn('size-2 rounded-full', accent === 'truck' ? 'bg-truck' : accent === 'trailer' ? 'bg-trailer' : 'bg-primary')}
            aria-hidden="true"
          />
        )}
        {Icon && !accent && <Icon className="size-3.5" aria-hidden="true" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="truncate text-2xl font-semibold tracking-tight tabular">{value}</div>
      <div className="flex min-h-5 flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        {delta !== undefined && <Delta value={delta} invert={invertDelta} />}
        {hint && <span className="truncate">{hint}</span>}
      </div>
    </div>
  )
}

export function SampleNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning/[0.06] px-3.5 py-2.5 text-xs text-muted-foreground">
      <Info className="mt-px size-3.5 shrink-0 text-warning" aria-hidden="true" />
      <p className="text-pretty">{children}</p>
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon = Info }: { title: string; description?: string; icon?: LucideIcon }) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
      <div className="flex size-9 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-xs text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}

export function Legend({ items }: { items: { label: string; color: string; muted?: boolean; onClick?: () => void }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => {
        const content = (
          <>
            <span className="size-2 rounded-sm" style={{ background: item.color }} aria-hidden="true" />
            {item.label}
          </>
        )
        return item.onClick ? (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            aria-pressed={!item.muted}
            className={cn('flex items-center gap-1.5 text-xs transition-opacity hover:text-foreground', item.muted ? 'text-muted-foreground opacity-50' : 'text-muted-foreground')}
          >
            {content}
          </button>
        ) : (
          <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {content}
          </span>
        )
      })}
    </div>
  )
}

export function ActionButton({ icon: Icon, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50',
        props.className,
      )}
    >
      {Icon && <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function NativeSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <label className={cn('relative inline-flex items-center', className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full appearance-none rounded-lg border bg-card pl-2.5 pr-7 text-xs text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2 size-3 text-muted-foreground" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  )
}
