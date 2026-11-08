import { useMemo, useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown, Search } from 'lucide-react'
import { controlClass } from '@/components/ui/field'
import { cn } from '@/lib/cn'

const MAX_SHOWN = 50

/**
 * Pilihan dengan kolom cari, buatan sendiri (untuk daftar panjang seperti 1.000+ barang).
 * options: [{ value, label, hint? }]. Hanya 50 hasil pertama yang ditampilkan; ketik untuk mempersempit.
 */
export function Combobox({ id, value, onValueChange, options, placeholder = 'Pilih', searchLabel = 'Cari', disabled }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = options.find((option) => option.value === value)

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options
    return { rows: matches.slice(0, MAX_SHOWN), total: matches.length }
  }, [options, query])

  function handleOpenChange(next) {
    setOpen(next)
    if (next) setQuery('')
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger
        id={id}
        type="button"
        disabled={disabled}
        className={cn(controlClass, 'flex items-center justify-between gap-2 text-left')}
      >
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-tinta-redup')}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="size-4 shrink-0 text-tinta-redup" aria-hidden="true" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-[60] w-[var(--radix-popover-trigger-width)] min-w-56 rounded-xl border border-garis bg-lembar shadow-pop"
        >
          <div className="relative border-b border-garis-halus p-2">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
            <input
              type="search"
              aria-label={searchLabel}
              placeholder="Ketik untuk mencari"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={cn(controlClass, 'pl-9')}
              autoFocus
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto p-1">
            {shown.rows.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-garis-halus',
                    option.value === value && 'bg-garis-halus font-medium',
                  )}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {option.hint ? <span className="shrink-0 text-xs text-tinta-redup">{option.hint}</span> : null}
                </button>
              </li>
            ))}
            {shown.rows.length === 0 ? <li className="px-3 py-3 text-sm text-tinta-redup">Tidak ditemukan.</li> : null}
          </ul>
          {shown.total > MAX_SHOWN ? (
            <p className="border-t border-garis-halus px-3 py-2 text-xs text-tinta-redup">
              Menampilkan {MAX_SHOWN} dari {shown.total}. Ketik untuk mempersempit.
            </p>
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
