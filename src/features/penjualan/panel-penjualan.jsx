import { useSyncExternalStore } from 'react'
import { Card } from '@/components/ui/card'
import { Perubahan } from '@/components/ui/perubahan'
import { useAsync } from '@/hooks/use-async'
import { formatAngka, formatRupiah } from '@/lib/format'
import { getPanelPenjualan } from '@/services/queries'

const query = '(min-width: 1280px)'
const subscribe = (callback) => {
  const media = window.matchMedia(query)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

/** Panel ringkasan di sisi kanan halaman Penjualan (hanya di layar lebar; tidak memuat data di HP). */
export function PanelPenjualan({ version }) {
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
  if (!wide) return null
  return <Isi version={version} />
}

function Isi({ version }) {
  const { data, error } = useAsync(getPanelPenjualan, [version])
  const max = data ? Math.max(...data.days.map((day) => day.value), 1) : 1

  return (
    <aside aria-label="Ringkasan penjualan" className="sticky top-6 min-w-0">
      <Card className="p-4">
        <h2 className="text-[11px] font-bold tracking-wide text-tinta-redup uppercase">Hari ini</h2>
        {error ? <p className="mt-2 text-sm text-bahaya">Ringkasan gagal dimuat.</p> : null}
        {!data && !error ? <p className="mt-2 text-sm text-tinta-redup">Memuat data…</p> : null}
        {data ? (
          <>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums">{formatRupiah(data.today.total)}</span>
              <Perubahan now={data.today.total} before={data.yesterday} />
            </p>
            {data.yesterday ? <p className="mt-0.5 text-xs text-tinta-redup">dibanding kemarin</p> : null}

            <div className="mt-3 flex h-14 items-end gap-1.5" role="img" aria-label="Penjualan 7 hari terakhir">
              {data.days.map((day, index) => (
                <div
                  key={day.date}
                  title={`${day.label}: ${formatRupiah(day.value)}`}
                  className={`min-w-0 flex-1 rounded-t-[4px] ${index === data.days.length - 1 ? 'bg-pena' : 'bg-pena/30'}`}
                  style={{ height: day.value > 0 ? `max(${(day.value / max) * 100}%, 3px)` : '0' }}
                />
              ))}
            </div>
            <p className="mt-1 text-[10px] text-tinta-redup">7 hari terakhir</p>

            <dl className="mt-3 text-sm">
              {[
                ['Transaksi', formatAngka(data.today.count)],
                ['Unit terjual', formatAngka(data.today.units)],
                ['Rata-rata / hari', formatRupiah(Math.round(data.average))],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 border-t border-garis-halus py-1.5">
                  <dt className="text-tinta-redup">{label}</dt>
                  <dd className="font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-4 text-[11px] font-bold tracking-wide text-tinta-redup uppercase">Terlaris bulan ini</h2>
            {data.top.length === 0 ? (
              <p className="mt-1.5 text-sm text-tinta-redup">Belum ada penjualan bulan ini.</p>
            ) : (
              <ol className="mt-1.5 text-sm">
                {data.top.map((item, index) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-3 py-1">
                    <span className="min-w-0 truncate">
                      <span className="mr-1.5 text-tinta-redup tabular-nums">{index + 1}.</span>
                      {item.name}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatAngka(item.qty)}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : null}
      </Card>
    </aside>
  )
}
