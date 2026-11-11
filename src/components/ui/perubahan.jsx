import { cn } from '@/lib/cn'

/** Selisih terhadap periode pembanding, mis. ▲ 12%. Kosong bila periode pembanding belum punya penjualan. */
export function Perubahan({ now, before }) {
  if (!before) return null
  const change = Math.round(((now - before) / before) * 100)
  const tone = change > 0 ? 'bg-sukses/15 text-sukses' : change < 0 ? 'bg-bahaya/10 text-bahaya' : 'bg-garis-halus text-tinta-redup'
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums', tone)}>
      <span aria-hidden="true">{change > 0 ? '▲' : change < 0 ? '▼' : '•'}</span>
      <span className="sr-only">{change > 0 ? 'Naik' : change < 0 ? 'Turun' : 'Sama'}</span>
      {Math.abs(change)}%
    </span>
  )
}
