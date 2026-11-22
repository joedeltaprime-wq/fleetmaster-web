'use client'

export const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 11 }
export const GRID_STROKE = 'var(--border)'

interface TooltipRow {
  label: string
  value: string
  color?: string
  emphasis?: boolean
}

export function TooltipCard({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <div className="min-w-44 rounded-lg border bg-popover/95 px-3 py-2.5 text-xs shadow-xl shadow-black/20 backdrop-blur-sm">
      <p className="mb-1.5 font-medium text-popover-foreground">{title}</p>
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={r.label} className={r.emphasis ? 'mt-1 flex items-center gap-2 border-t pt-1.5' : 'flex items-center gap-2'}>
            {r.color && <span className="size-2 rounded-sm" style={{ background: r.color }} aria-hidden="true" />}
            <span className="text-muted-foreground">{r.label}</span>
            <span className="ml-auto pl-4 font-medium text-popover-foreground tabular">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
