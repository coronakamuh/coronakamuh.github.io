import { useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { controlClass } from '@/components/ui/field'
import { formatDisplay, formatLong, monthGrid, monthNames, parseISO, toISO, weekdayLabels } from '@/lib/date'
import { cn } from '@/lib/cn'

/**
 * Pemilih tanggal buatan sendiri (bukan bawaan peramban).
 * value dan onChange memakai teks "YYYY-MM-DD"; teks kosong berarti belum dipilih.
 * min dan max (opsional) membatasi tanggal yang bisa dipilih.
 */
export function DatePicker({ id, value, onChange, min, max, placeholder = 'Pilih tanggal', disabled, ...rest }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const base = parseISO(value) ?? new Date()
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  const todayISO = toISO(new Date())
  const isBlocked = (iso) => Boolean((min && iso < min) || (max && iso > max))

  function handleOpenChange(next) {
    if (next) {
      const base = parseISO(value) ?? new Date()
      setView({ year: base.getFullYear(), month: base.getMonth() })
    }
    setOpen(next)
  }

  function shiftMonth(delta) {
    setView((current) => {
      const date = new Date(current.year, current.month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  function pick(iso) {
    onChange(iso)
    setOpen(false)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger
        id={id}
        type="button"
        disabled={disabled}
        className={cn(controlClass, 'flex items-center justify-between gap-2 text-left')}
        {...rest}
      >
        <span className={cn('min-w-0 flex-1 truncate', !value && 'text-tinta-redup')}>
          {formatDisplay(value) || placeholder}
        </span>
        <CalendarDays className="size-4 shrink-0 text-tinta-redup" aria-hidden="true" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-[60] w-[17.5rem] rounded-xl border border-garis bg-lembar p-3 shadow-pop"
        >
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon-sm" aria-label="Bulan sebelumnya" onClick={() => shiftMonth(-1)}>
              <ChevronLeft />
            </Button>
            <p className="text-sm font-medium" aria-live="polite">
              {monthNames[view.month]} {view.year}
            </p>
            <Button variant="ghost" size="icon-sm" aria-label="Bulan berikutnya" onClick={() => shiftMonth(1)}>
              <ChevronRight />
            </Button>
          </div>

          <div className="mt-2 grid grid-cols-7 text-center text-xs text-tinta-redup">
            {weekdayLabels.map((label) => (
              <span key={label} className="py-1">
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {monthGrid(view.year, view.month).map((date) => {
              const iso = toISO(date)
              const selected = iso === value
              const inMonth = date.getMonth() === view.month
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isBlocked(iso)}
                  aria-label={formatLong(date)}
                  aria-pressed={selected}
                  onClick={() => pick(iso)}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg text-sm tabular-nums disabled:pointer-events-none disabled:opacity-30',
                    selected
                      ? 'bg-pena font-medium text-white'
                      : 'hover:bg-garis-halus',
                    !selected && !inMonth && 'text-tinta-redup/60',
                    !selected && iso === todayISO && 'font-semibold text-pena ring-1 ring-pena/40 ring-inset',
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-garis pt-2">
            <Button variant="ghost" size="sm" disabled={isBlocked(todayISO)} onClick={() => pick(todayISO)}>
              Hari ini
            </Button>
            <Button variant="ghost" size="sm" disabled={!value} onClick={() => pick('')}>
              Hapus
            </Button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
