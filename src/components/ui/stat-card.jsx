import { cn } from '@/lib/cn'

/** Kartu angka ringkas. Tanpa nilai, tampil "—" karena belum ada data. */
export function StatCard({ label, value, hint = 'Belum ada data', icon: Icon, tone = 'default', className }) {
  return (
    <div className={cn('min-w-0 rounded-xl border border-garis bg-lembar p-3 shadow-[0_1px_3px_rgb(15_23_42/0.045)] sm:p-4', className)}>
      <div className="flex min-w-0 items-center justify-between gap-2 text-xs font-medium text-tinta-redup">
        <span className="min-w-0">{label}</span>
        {Icon ? (
          <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', tone === 'danger' ? 'bg-bahaya/8 text-bahaya' : 'bg-pena/8 text-pena')}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xl leading-tight font-semibold tracking-tight text-tinta tabular-nums break-words sm:text-2xl">
        {value ?? '—'}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-tinta-redup">{hint}</p>
    </div>
  )
}
