import { ChartColumn } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { formatRingkas } from '@/lib/format'

/**
 * Grafik batang sederhana. data: [{ label, value }].
 * Tanpa data (atau semua nol), tampil empty state.
 */
export function BarChart({ data, emptyTitle, emptyDescription, formatValue = String }) {
  const max = Math.max(...data.map((item) => item.value), 0)
  if (data.length === 0 || max === 0) {
    return <EmptyState icon={ChartColumn} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <ul className="flex items-end gap-2" aria-label="Grafik batang">
      {data.map((item) => (
        <li key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
          <span className="h-3.5 text-[10px] leading-none text-tinta-redup tabular-nums">
            {item.value > 0 ? formatRingkas(item.value) : ''}
          </span>
          <div className="flex h-40 w-full items-end">
            <div
              className="w-full rounded-sm bg-pena"
              style={{ height: item.value > 0 ? `max(${(item.value / max) * 100}%, 2px)` : '0' }}
              title={`${item.label}: ${formatValue(item.value)}`}
            />
          </div>
          <span className="max-w-full truncate text-xs text-tinta-redup">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
