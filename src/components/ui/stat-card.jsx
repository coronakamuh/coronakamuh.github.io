import { cn } from '@/lib/cn'

/** Kartu angka ringkas. Tanpa nilai, tampil "—" karena belum ada data. */
export function StatCard({ label, value, hint = 'Belum ada data', icon: Icon, tone = 'default', className }) {
  return (
    <div className={cn('rounded-xl border border-garis bg-lembar p-4 shadow-[0_1px_3px_rgb(15_23_42/0.045)] sm:p-5', className)}>
      <div className="flex items-center justify-between gap-2 text-sm font-medium text-tinta-redup">
        <span>{label}</span>
        {Icon ? (
          <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', tone === 'danger' ? 'bg-bahaya/8 text-bahaya' : 'bg-pena/8 text-pena')}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-tinta tabular-nums">
        {value ?? '—'}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-tinta-redup">{hint}</p>
    </div>
  )
}
