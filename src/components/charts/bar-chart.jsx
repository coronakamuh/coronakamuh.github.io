import { useId, useState } from 'react'
import { ChartColumn } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { niceMax, tickIndexes } from '@/lib/chart'
import { formatRingkas } from '@/lib/format'

/**
 * Grafik batang total per hari. Batang terakhir (hari ini) berwarna penuh, yang lain lebih lembut;
 * ada garis rata-rata dan label di puncak. Arahkan penunjuk/ketuk, atau panah kiri/kanan, untuk melihat nilai.
 * data: [{ label, date, value }]
 */
export function BarChart({ data, emptyTitle, emptyDescription, formatValue = String, label = 'Grafik batang' }) {
  const id = useId()
  const [active, setActive] = useState(null)
  const max = Math.max(...data.map((item) => item.value), 0)
  if (data.length === 0 || max === 0) {
    return <EmptyState icon={ChartColumn} title={emptyTitle} description={emptyDescription} />
  }

  const count = data.length
  const top = niceMax(max)
  const pct = (value) => (value / top) * 100
  const center = (index) => ((index + 0.5) / count) * 100
  const average = data.reduce((total, item) => total + item.value, 0) / count
  const peak = data.reduce((best, item, index) => (item.value > data[best].value ? index : best), 0)
  const point = active === null ? null : data[active]
  const dense = count > 12

  function move(event) {
    const box = event.currentTarget.getBoundingClientRect()
    const fraction = box.width === 0 ? 0 : (event.clientX - box.left) / box.width
    setActive(Math.min(count - 1, Math.max(0, Math.floor(fraction * count))))
  }

  function key(event) {
    if (event.key === 'ArrowRight') setActive((current) => Math.min(count - 1, (current ?? -1) + 1))
    else if (event.key === 'ArrowLeft') setActive((current) => Math.max(0, (current ?? 1) - 1))
    else if (event.key === 'Escape') setActive(null)
    else return
    event.preventDefault()
  }

  return (
    <figure className="m-0">
      <div className="relative h-56">
        <div className="absolute top-4 right-2 bottom-6 left-11">
          {[0, 0.5, 1].map((fraction) => (
            <div key={fraction} className={`pointer-events-none absolute right-0 left-0 border-t ${fraction === 0 ? 'border-garis' : 'border-garis-halus'}`} style={{ top: `${(1 - fraction) * 100}%` }}>
              <span className="absolute -top-2 right-full pr-2 text-[10px] leading-4 text-tinta-redup tabular-nums">{formatRingkas(top * fraction)}</span>
            </div>
          ))}
          <div className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-tinta-redup/70" style={{ top: `${100 - pct(average)}%` }}>
            <span className="absolute bottom-0.5 left-1 rounded bg-lembar/85 px-1 text-[10px] leading-4 text-tinta-redup tabular-nums">rata-rata {formatRingkas(average)}</span>
          </div>

          <div
            className="relative flex h-full w-full touch-pan-y items-end outline-none focus-visible:ring-2 focus-visible:ring-pena/40"
            style={{ gap: dense ? '2px' : '6px' }}
            role="img"
            tabIndex={0}
            aria-label={`${label}. Gunakan panah kiri dan kanan untuk melihat nilai per tanggal.`}
            aria-describedby={`${id}-tabel`}
            onPointerMove={move}
            onPointerDown={move}
            onPointerLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
            onKeyDown={key}
          >
            {data.map((item, index) => {
              const today = index === count - 1
              const on = active === index
              return (
                <div key={item.date ?? item.label} className="flex h-full min-w-0 flex-1 items-end justify-center">
                  <div
                    className={`w-full max-w-9 transition-colors ${dense ? 'rounded-t-[3px]' : 'rounded-t-[6px]'} ${today || on ? 'bg-pena' : 'bg-pena/30'}`}
                    style={{ height: item.value > 0 ? `max(${pct(item.value)}%, 2px)` : '0' }}
                  />
                </div>
              )
            })}
            {point === null ? (
              <span
                className="pointer-events-none absolute -translate-x-1/2 text-[10.5px] leading-4 font-bold whitespace-nowrap text-tinta tabular-nums"
                style={{ left: `clamp(1.25rem, ${center(peak)}%, calc(100% - 1.25rem))`, bottom: `calc(${pct(data[peak].value)}% + 4px)` }}
              >
                {formatRingkas(data[peak].value)}
              </span>
            ) : (
              <div
                role="status"
                className="pointer-events-none absolute z-10 rounded-md border border-garis bg-lembar px-2 py-1 text-xs whitespace-nowrap shadow-sm"
                style={{ left: `clamp(3.5rem, ${center(active)}%, calc(100% - 3.5rem))`, bottom: `calc(${pct(point.value)}% + 8px)`, transform: 'translateX(-50%)' }}
              >
                <span className="text-tinta-redup">{point.label}</span> <strong className="tabular-nums">{formatValue(point.value)}</strong>
              </div>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute right-2 bottom-0 left-11 h-5 text-[11px] text-tinta-redup" aria-hidden="true">
          {(dense ? tickIndexes(count) : data.map((_, index) => index)).map((index) => (
            <span key={index} className={`absolute top-0 -translate-x-1/2 tabular-nums ${index === count - 1 ? 'font-bold text-tinta' : ''}`} style={{ left: `${center(index)}%` }}>
              {data[index].label}
            </span>
          ))}
        </div>
      </div>
      <table id={`${id}-tabel`} className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr><th>Tanggal</th><th>Nilai</th></tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date ?? item.label}><td>{item.label}</td><td>{formatValue(item.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
