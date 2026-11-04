import { cn } from '@/lib/cn'

/** Kartu angka ringkas. Tanpa nilai, tampil "—" karena belum ada data. */
export function StatCard({ label, value, hint = 'Belum ada data', icon: Icon, tone = 'default', className }) {
  return (
    <div className={cn('rounded-lg border border-garis bg-lembar p-4', className)}>
      <div className="flex items-center justify-between gap-2 text-sm text-tinta-redup">
        <span>{label}</span>
        {Icon ? (
          <Icon
            className={cn('size-4 shrink-0', tone === 'danger' ? 'text-bahaya' : 'text-pena')}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight tabular-nums">
        {value ?? '—'}
      </p>
      <p className="mt-1 text-xs text-tinta-redup">{hint}</p>
    </div>
  )
}
