'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, CornerDownLeft, Search, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Unit } from '@/lib/data/types'
import { Segmented } from '@/components/ops/segmented'

type Filter = 'all' | 'truck' | 'trailer'

export function UnitSearchDialog({
  units,
  open,
  onOpenChange,
  currentId,
  title = 'Jump to unit',
}: {
  units: Unit[]
  open: boolean
  onOpenChange: (open: boolean) => void
  currentId?: string
  title?: string
}) {
  if (!open) return null
  return <DialogBody units={units} onClose={() => onOpenChange(false)} currentId={currentId} title={title} />
}

function DialogBody({ units, onClose, currentId, title }: { units: Unit[]; onClose: () => void; currentId?: string; title: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [active, setActive] = useState(0)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, '')
    return units.filter(
      (u) =>
        (filter === 'all' || u.type === filter) &&
        (!q || u.number.toLowerCase().includes(q) || u.label.toLowerCase().includes(q) || u.make.toLowerCase().includes(q)),
    )
  }, [units, query, filter])

  const go = (unit: Unit | undefined) => {
    if (!unit) return
    onClose()
    router.push(`/units/${unit.id}`)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      go(results[active])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl shadow-black/30 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2.5 border-b px-4">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder="Search by unit number, e.g. 3004 or H16840"
            aria-label="Search units"
            role="combobox"
            aria-expanded="true"
            aria-controls="unit-search-results"
            aria-activedescendant={results[active] ? `unit-opt-${results[active].id}` : undefined}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="flex items-center justify-between border-b px-3 py-2">
          <Segmented
            size="sm"
            label="Unit type"
            value={filter}
            onChange={(v) => {
              setFilter(v)
              setActive(0)
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'truck', label: 'Trucks' },
              { value: 'trailer', label: 'Trailers' },
            ]}
          />
          <span className="text-[11px] text-muted-foreground tabular">{results.length} units</span>
        </div>
        <ul id="unit-search-results" role="listbox" aria-label="Units" className="scrollbar-thin max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted-foreground">No units match “{query}”.</li>}
          {results.map((u, i) => {
            const Icon = u.type === 'truck' ? Truck : Container
            return (
              <li
                key={u.id}
                id={`unit-opt-${u.id}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(u)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm',
                  i === active ? 'bg-accent text-accent-foreground' : 'text-foreground/90',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-md border',
                    u.type === 'truck' ? 'text-truck' : 'text-trailer',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <span className="flex-1 truncate">
                  <span className="font-medium">{u.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {u.make} · {u.year}
                  </span>
                </span>
                {u.id === currentId && <span className="text-[11px] text-primary">Current</span>}
                {i === active && <CornerDownLeft className="size-3.5 text-muted-foreground" aria-hidden="true" />}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
