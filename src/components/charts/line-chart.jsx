import { useId, useState } from 'react'
import { ChartLine } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { niceMax, tickIndexes } from '@/lib/chart'
import { formatRingkas } from '@/lib/format'

/**
 * Grafik garis dengan ruas lurus (bukan kurva halus) dan tanpa titik di tiap tanggal.
 * Titik hanya muncul untuk tanggal yang sedang disorot (arahkan penunjuk atau panah kiri/kanan).
 * data: [{ label, date, value }]
 */
export function LineChart({ data, emptyTitle, emptyDescription, formatValue = String, label = 'Grafik garis' }) {
  const id = useId()
  const [active, setActive] = useState(null)
  const max = Math.max(...data.map((item) => item.value), 0)
  if (data.length === 0 || max === 0) {
    return <EmptyState icon={ChartLine} title={emptyTitle} description={emptyDescription} />
  }

  const top = niceMax(max)
  const last = data.length - 1
  const xPct = (index) => (last === 0 ? 50 : (index / last) * 100)
  const yPct = (value) => 100 - (value / top) * 100
  const points = data.map((item, index) => `${xPct(index)},${yPct(item.value)}`).join(' ')
  const point = active === null ? null : data[active]

  function move(event) {
    const box = event.currentTarget.getBoundingClientRect()
    const fraction = box.width === 0 ? 0 : (event.clientX - box.left) / box.width
    setActive(Math.min(last, Math.max(0, Math.round(fraction * last))))
  }

  function key(event) {
    if (event.key === 'ArrowRight') setActive((current) => Math.min(last, (current ?? -1) + 1))
    else if (event.key === 'ArrowLeft') setActive((current) => Math.max(0, (current ?? 1) - 1))
    else if (event.key === 'Escape') setActive(null)
    else return
    event.preventDefault()
  }

  return (
    <figure className="m-0">
      <div className="relative h-52 pr-2 pb-6 pl-11">
        {[0, 0.5, 1].map((fraction) => (
          <div key={fraction} className="pointer-events-none absolute right-2 left-11 border-t border-garis-halus" style={{ top: `calc(${(1 - fraction) * 100}% * (1 - 1.5rem / 13rem))` }}>
            <span className="absolute -top-2 right-full pr-2 text-[10px] leading-4 text-tinta-redup tabular-nums">{formatRingkas(top * fraction)}</span>
          </div>
        ))}
        <div
          className="relative h-full w-full touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-pena/40"
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
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={points} fill="none" stroke="currentColor" className="text-pena" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="butt" vectorEffect="non-scaling-stroke" />
          </svg>
          {last === 0 ? (
            <span className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pena" style={{ left: '50%', top: `${yPct(data[0].value)}%` }} />
          ) : null}
          {point ? (
            <>
              <span className="pointer-events-none absolute top-0 bottom-0 w-px bg-garis" style={{ left: `${xPct(active)}%` }} />
              <span className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lembar bg-pena" style={{ left: `${xPct(active)}%`, top: `${yPct(point.value)}%` }} />
              <div
                role="status"
                className="pointer-events-none absolute z-10 -translate-y-full rounded-md border border-garis bg-lembar px-2 py-1 text-xs whitespace-nowrap shadow-sm"
                style={{ left: `clamp(3.5rem, ${xPct(active)}%, calc(100% - 3.5rem))`, top: `max(${yPct(point.value)}%, 2rem)`, transform: 'translate(-50%, -125%)' }}
              >
                <span className="text-tinta-redup">{point.label}</span> <strong className="tabular-nums">{formatValue(point.value)}</strong>
              </div>
            </>
          ) : null}
        </div>
        <div className="pointer-events-none absolute right-2 bottom-0 left-11 h-5 text-[11px] text-tinta-redup" aria-hidden="true">
          {tickIndexes(data.length).map((index) => (
            <span key={index} className="absolute top-0 -translate-x-1/2 tabular-nums" style={{ left: `${xPct(index)}%` }}>
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
