import { ChartColumn } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

/**
 * Grafik batang sederhana. data: [{ label, value }].
 * Tanpa data, tampil empty state. Tidak ada angka contoh di sini.
 */
export function BarChart({ data, emptyTitle, emptyDescription, formatValue = String }) {
  if (data.length === 0) {
    return <EmptyState icon={ChartColumn} title={emptyTitle} description={emptyDescription} />
  }

  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <ul className="flex h-56 items-end gap-2" aria-label="Grafik batang">
      {data.map((item) => (
        <li key={item.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center">
          <div
            className="w-full rounded-sm bg-pena"
            style={{ height: `${(item.value / max) * 100}%` }}
            title={`${item.label}: ${formatValue(item.value)}`}
          />
          <span className="truncate text-xs text-tinta-redup">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
