import { useId, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Kelompok pengaturan: judul kecil huruf kapital di atas satu kartu berisi baris-baris. */
export function SettingGroup({ title, action, children }) {
  return (
    <section aria-label={title}>
      <div className="mb-1.5 flex min-h-6 items-center justify-between gap-2 px-1">
        <h2 className="text-[11px] font-bold tracking-wide text-tinta-redup uppercase">{title}</h2>
        {action}
      </div>
      <div className="dh-card divide-y divide-garis-halus overflow-hidden">{children}</div>
    </section>
  )
}

/** Satu baris pengaturan: label di kiri, kontrol di kanan (turun ke bawah bila layar terlalu sempit). */
export function SettingRow({ label, hint, children }) {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-3.5 py-2">
      <span className="text-sm font-medium" title={hint}>
        {label}
      </span>
      {children}
    </div>
  )
}

/** Baris yang membuka isinya di tempat saat diketuk. */
export function Disclosure({ title, children }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 text-left text-sm font-medium transition-colors hover:bg-garis-halus/60"
      >
        <span>{title}</span>
        <ChevronRight className={cn('size-4 text-tinta-redup transition-transform', open && 'rotate-90')} aria-hidden="true" />
      </button>
      {open ? (
        <div id={id} className="px-3.5 pt-1 pb-3.5">
          {children}
        </div>
      ) : null}
    </div>
  )
}
