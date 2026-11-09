import { Download, FileText, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { NamaBarang } from '@/components/ui/nama-barang'
import { ErrorNotice } from '@/components/ui/notice'
import { Select } from '@/components/ui/select'
import { useAsync } from '@/hooks/use-async'
import { addDaysISO, dayMonthLabel, monthNames, monthRange, todayISO } from '@/lib/date'
import { formatAngka, formatRupiah } from '@/lib/format'
import { getSalesExport, getTargets } from '@/services/queries'

const pad = (n) => String(n).padStart(2, '0')
const NO_BRAND = 'Tanpa brand'

function previousMonth(month) {
  const [year, number] = month.split('-').map(Number)
  return number === 1 ? `${year - 1}-12` : `${year}-${pad(number - 1)}`
}

/** Rentang bulan sebelumnya yang adil: bulan berjalan dibandingkan dengan tanggal yang sama bulan lalu. */
function comparisonRange(month) {
  const prev = previousMonth(month)
  const { start, next } = monthRange(`${prev}-01`)
  const lastDay = Number(addDaysISO(next, -1).slice(8, 10))
  const name = monthNames[Number(prev.slice(5, 7)) - 1]
  if (month === todayISO().slice(0, 7)) {
    const endDay = Math.min(Number(todayISO().slice(8, 10)), lastDay)
    return { prev, from: start, to: `${prev}-${pad(endDay)}`, label: `1-${endDay} ${name.slice(0, 3)}` }
  }
  return { prev, from: start, to: `${prev}-${pad(lastDay)}`, label: name }
}

function totalsOf(rows) {
  return rows.reduce(
    (sum, row) => ({ revenue: sum.revenue + row.total, count: sum.count + 1, units: sum.units + row.qty }),
    { revenue: 0, count: 0, units: 0 },
  )
}

function Delta({ now, before, label }) {
  if (!before) return <span className="text-tinta-redup">Belum ada pembanding</span>
  const percent = Math.round(((now - before) / before) * 100)
  if (percent === 0) return <span className="text-tinta-redup">Sama dengan {label}</span>
  const up = percent > 0
  return (
    <span className={up ? 'text-sukses' : 'text-bahaya'}>
      {up ? '▲' : '▼'} {Math.abs(percent)}% dari {label}
    </span>
  )
}

function Stat({ label, value, hint }) {
  return (
    <div className="dh-card min-w-0 p-3 sm:p-4">
      <p className="text-xs text-tinta-redup">{label}</p>
      <p className="mt-1 text-base font-semibold tracking-tight tabular-nums sm:text-xl">{value}</p>
      <p className="mt-1 text-[11px] font-semibold">{hint}</p>
    </div>
  )
}

/**
 * Rekap penjualan satu bulan: ringkasan, grafik per hari, per brand terhadap target, barang terlaris.
 * Semua angka dihitung dari data penjualan yang sudah ada (hanya membaca).
 */
export function RekapBulanan({ month, onMonthChange, monthOptions, startMonth, onExport, exporting }) {
  const { start, next } = monthRange(`${month}-01`)
  const to = addDaysISO(next, -1)
  const compare = comparisonRange(month)
  const hasPrevious = !startMonth || compare.prev >= startMonth

  const current = useAsync(() => getSalesExport({ from: start, to }), [start, to])
  const previous = useAsync(() => (hasPrevious ? getSalesExport({ from: compare.from, to: compare.to }) : Promise.resolve([])), [compare.from, compare.to, hasPrevious])
  const targets = useAsync(getTargets, [])

  const rows = current.data ?? []
  const waiting = current.loading && !current.data
  const today = todayISO()
  const inProgress = month === today.slice(0, 7)
  const daysInMonth = Number(to.slice(8, 10))
  const daysShown = inProgress ? Number(today.slice(8, 10)) : daysInMonth

  const totals = totalsOf(rows)
  const before = totalsOf(previous.data ?? [])
  const average = daysShown > 0 ? Math.round(totals.revenue / daysShown) : 0

  const perDay = Array.from({ length: daysShown }, () => 0)
  for (const row of rows) perDay[Number(row.date.slice(8, 10)) - 1] += row.total
  const peak = perDay.reduce((best, value, index) => (value > perDay[best] ? index : best), 0)
  const maxDay = perDay[peak] || 0
  const peakDate = `${month}-${pad(peak + 1)}`

  const brands = new Map()
  for (const row of rows) {
    const name = row.brand || NO_BRAND
    const entry = brands.get(name) ?? { name, revenue: 0, units: 0 }
    entry.revenue += row.total
    entry.units += row.qty
    brands.set(name, entry)
  }
  const targetOf = new Map((targets.data ?? []).map((entry) => [entry.brand, entry.target]))
  const brandList = [...brands.values()].sort((a, b) => b.revenue - a.revenue)

  const items = new Map()
  for (const row of rows) {
    const entry = items.get(row.item) ?? { name: row.item, units: 0, revenue: 0 }
    entry.units += row.qty
    entry.revenue += row.total
    items.set(row.item, entry)
  }
  const topItems = [...items.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, 5)

  const monthName = monthNames[Number(month.slice(5, 7)) - 1]
  const axis = [1, 5, 10, 15, 20, 25, 30].filter((day) => day <= daysInMonth)

  return (
    <div className="space-y-3">
      <Select id="rekap-bulan" aria-label="Pilih bulan rekap" value={month} onValueChange={onMonthChange} options={monthOptions} />

      {current.error ? <ErrorNotice error={current.error} onRetry={current.reload} /> : null}

      {!waiting && !current.error && rows.length === 0 ? (
        <Card>
          <EmptyState icon={Receipt} title="Belum ada penjualan" description={`Tidak ada penjualan pada ${monthName} ${month.slice(0, 4)}.`} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 sm:grid-cols-4">
            <Stat label="Omzet" value={waiting ? '…' : formatRupiah(totals.revenue)} hint={<Delta now={totals.revenue} before={before.revenue} label={compare.label} />} />
            <Stat label="Transaksi" value={waiting ? '…' : formatAngka(totals.count)} hint={<Delta now={totals.count} before={before.count} label={compare.label} />} />
            <Stat label="Unit terjual" value={waiting ? '…' : `${formatAngka(totals.units)} pcs`} hint={<Delta now={totals.units} before={before.units} label={compare.label} />} />
            <Stat
              label="Rata-rata per hari"
              value={waiting ? '…' : formatRupiah(average)}
              hint={<span className="text-tinta-redup">{inProgress ? `${daysShown} hari berjalan` : `${daysInMonth} hari`}</span>}
            />
          </div>

          <Card>
            <CardHeader
              title="Penjualan per hari"
              description={maxDay > 0 ? `Hari tertinggi: ${dayMonthLabel(peakDate)} · ${formatRupiah(maxDay)}` : 'Belum ada penjualan.'}
            />
            <CardBody>
              <div role="img" aria-label={`Grafik penjualan per hari, ${monthName} ${month.slice(0, 4)}`} className="flex h-24 items-end gap-[3px] border-b border-garis">
                {perDay.map((value, index) => (
                  <span
                    key={index}
                    title={`${index + 1} ${monthName.slice(0, 3)}: ${formatRupiah(value)}`}
                    className={index === peak && value > 0 ? 'min-w-0 flex-1 rounded-t-sm bg-tombol' : 'min-w-0 flex-1 rounded-t-sm bg-pena/30'}
                    style={{ height: value > 0 ? `${Math.max(4, (value / maxDay) * 100)}%` : '2px', opacity: value > 0 ? 1 : 0.5 }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-tinta-redup tabular-nums" aria-hidden="true">
                {axis.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Total penjualan per brand" description="Omzet dan jumlah unit terjual per brand bulan ini." />
            <CardBody>
              {brandList.length === 0 ? (
                <p className="text-sm text-tinta-redup">{waiting ? 'Memuat data' : 'Belum ada penjualan.'}</p>
              ) : (
                <ul className="divide-y divide-garis-halus">
                  {brandList.map((brand) => {
                    const target = targetOf.get(brand.name)
                    const hasTarget = target !== null && target !== undefined && target > 0
                    const reach = hasTarget ? Math.round((brand.revenue / target) * 100) : 0
                    return (
                      <li key={brand.name} className="py-2">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate font-semibold">{brand.name}</span>
                          <span className="shrink-0 font-semibold tabular-nums">{formatRupiah(brand.revenue)}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-tinta-redup tabular-nums">
                          {formatAngka(brand.units)} pcs
                        </p>
                        {hasTarget ? (
                          <>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-garis-halus" role="presentation">
                              <div className="h-full rounded-full bg-pena" style={{ width: `${Math.min(100, reach)}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-tinta-redup tabular-nums">
                              {reach}% dari target {formatRupiah(target)}
                            </p>
                          </>
                        ) : targets.data ? (
                          <p className="mt-1 text-xs text-tinta-redup">Target belum diatur</p>
                        ) : null}
                      </li>
                    )
                  })}
                  <li className="flex items-baseline justify-between gap-3 pt-2 text-sm font-semibold">
                    <span>Total semua brand</span>
                    <span className="tabular-nums">{formatRupiah(totals.revenue)}</span>
                  </li>
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Barang terlaris" description="5 teratas berdasarkan jumlah terjual." />
            <CardBody>
              {topItems.length === 0 ? (
                <p className="text-sm text-tinta-redup">{waiting ? 'Memuat data' : 'Belum ada penjualan.'}</p>
              ) : (
                <ol className="divide-y divide-garis-halus">
                  {topItems.map((item, index) => (
                    <li key={item.name} className="flex items-center gap-3 py-2 text-sm">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-pena/10 text-[11px] font-bold text-pena">{index + 1}</span>
                      <span className="min-w-0 flex-1 font-medium break-words">
                        <NamaBarang name={item.name} />
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{formatAngka(item.units)} pcs</span>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onExport('xlsx')} disabled={Boolean(exporting) || rows.length === 0}>
              <Download />
              {exporting === 'xlsx' ? 'Menyiapkan…' : 'Ekspor Excel'}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onExport('pdf')} disabled={Boolean(exporting) || rows.length === 0}>
              <FileText />
              {exporting === 'pdf' ? 'Menyiapkan…' : 'Ekspor PDF'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
