import { useEffect, useState } from 'react'
import { Banknote, Boxes, LayoutDashboard, Package, RefreshCw, Tags, TriangleAlert } from 'lucide-react'
import { LineChart } from '@/components/charts/line-chart'
import { PageTitle } from '@/components/layout/page-title'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { NamaBarang } from '@/components/ui/nama-barang'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorNotice } from '@/components/ui/notice'
import { Segmented } from '@/components/ui/segmented'
import { StatCard } from '@/components/ui/stat-card'
import { useAsync } from '@/hooks/use-async'
import { formatAngka, formatRupiah } from '@/lib/format'
import { formatDisplay } from '@/lib/date'
import { getDashboard } from '@/services/queries'

const periodOptions = [
  { value: 'minggu', label: 'Minggu' },
  { value: 'bulan', label: 'Bulan' },
]

const minusColumns = [
  { key: 'name', label: 'Barang', render: (row) => <NamaBarang name={row.name} /> },
  { key: 'brand', label: 'Brand' },
  { key: 'stock', label: 'Stok', align: 'right', render: (row) => <span className="font-semibold text-bahaya">{formatAngka(row.stock)}</span> },
  { key: 'need', label: 'Kebutuhan PO', align: 'right', render: (row) => `${formatAngka(row.need)} unit` },
]

const REFRESH_AFTER_MS = 30_000

const clock = (date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })

function BrandRow({ brand }) {
  const hasTarget = brand.target !== null && brand.target > 0
  const percent = hasTarget ? Math.min(100, Math.round((brand.total / brand.target) * 100)) : 0
  return (
    <li className="py-2.5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium text-tinta">{brand.name}</span>
        <span className="shrink-0 font-semibold tabular-nums text-tinta">{formatRupiah(brand.total)}</span>
      </div>
      {hasTarget ? (
        <>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-garis-halus" role="presentation">
            <div className="h-full rounded-full bg-pena" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-tinta-redup">
            {percent}% dari target {formatRupiah(brand.target)}
          </p>
        </>
      ) : (
        <p className="mt-1 text-[11px] text-tinta-redup">Target belum diatur</p>
      )}
    </li>
  )
}

export function DashboardPage() {
  const [period, setPeriod] = useState('minggu')
  const { data, error, loading, reload } = useAsync(getDashboard, [])
  const waiting = loading && !data
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    if (data) setUpdatedAt(new Date())
  }, [data])

  // Perbarui otomatis saat tab/jendela kembali aktif.
  useEffect(() => {
    let last = Date.now()
    const refresh = () => {
      if (document.visibilityState === 'hidden' || Date.now() - last < REFRESH_AFTER_MS) return
      last = Date.now()
      reload()
    }
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [reload])

  const series = data ? data.sales[period] : []
  const periodTotal = series.reduce((total, point) => total + point.value, 0)
  const minusCount = data?.minusItems.length ?? 0
  const minusNeed = data?.minusItems.reduce((total, row) => total + row.need, 0) ?? 0

  return (
    <>
      <PageTitle
        icon={LayoutDashboard}
        title="Dashboard"
        description={data ? `Pantau performa penjualan dan kondisi stok, ${formatDisplay(data.today)}.` : 'Pantau performa penjualan dan kondisi stok dalam satu ringkasan.'}
        inlineActions
        actions={
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
            {loading ? 'Memuat…' : updatedAt ? `Perbarui · ${clock(updatedAt)}` : 'Perbarui'}
          </Button>
        }
      />

      {error ? (
        <div className="mb-4">
          <ErrorNotice error={error} onRetry={reload} />
        </div>
      ) : null}

      <section aria-label="Ringkasan utama" className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total Barang" icon={Package} value={waiting ? '…' : data ? formatAngka(data.totalBarang) : undefined} hint="Barang terdaftar" />
        <StatCard label="Total Stok" icon={Boxes} value={waiting ? '…' : data ? formatAngka(data.totalStok) : undefined} hint="Unit, tanpa stok minus" />
        <StatCard label="Omzet Hari Ini" icon={Banknote} value={waiting ? '…' : data ? formatRupiah(data.omzetHariIni) : undefined} hint="Penjualan hari ini" />
        <StatCard
          label="Barang Minus"
          icon={TriangleAlert}
          tone="danger"
          value={waiting ? '…' : data ? formatAngka(minusCount) : undefined}
          hint="Perlu ditindaklanjuti"
        />
      </section>

      <section aria-label="Analisis penjualan dan brand" className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-3">
          <CardHeader
            className="gap-2"
            title="Ringkasan Penjualan"
            description={`${period === 'minggu' ? '7 hari terakhir' : 'Bulan ini'} · Total ${data ? formatRupiah(periodTotal) : '—'}`}
            action={<Segmented label="Periode grafik" value={period} onValueChange={setPeriod} options={periodOptions} />}
          />
          <CardBody className="min-w-0">
            <LineChart
              label={`Penjualan per hari, ${period === 'minggu' ? '7 hari terakhir' : 'bulan ini'}`}
              data={series}
              formatValue={formatRupiah}
              emptyTitle={waiting ? 'Memuat data' : 'Belum ada penjualan'}
              emptyDescription={waiting ? '' : `Belum ada penjualan pada periode ${period} ini.`}
            />
          </CardBody>
        </Card>

        <Card className="min-w-0 lg:col-span-2">
          <CardHeader
            title="Performa Brand"
            description="Penjualan bulan ini terhadap target."
          />
          <CardBody>
            {data && data.brandPerformance.length > 0 ? (
              <ul className="divide-y divide-garis-halus">
                {data.brandPerformance.map((brand) => (
                  <BrandRow key={brand.name} brand={brand} />
                ))}
              </ul>
            ) : (
              <EmptyState icon={Tags} title={waiting ? 'Memuat data' : 'Belum ada brand aktif'} />
            )}
          </CardBody>
        </Card>
      </section>

      <Card className="mt-4 min-w-0">
        <CardHeader
          title="Perhatian Stok"
          description={
            data && minusCount > 0
              ? `${formatAngka(minusCount)} barang minus · Kebutuhan PO ${formatAngka(minusNeed)} unit.`
              : 'Daftar barang dengan stok di bawah nol.'
          }
        />
        <DataTable
          caption="Daftar barang minus"
          columns={minusColumns}
          rows={data ? data.minusItems : []}
          empty={{
            icon: TriangleAlert,
            title: waiting ? 'Memuat data' : 'Stok dalam kondisi aman',
            description: waiting ? '' : 'Tidak ada barang dengan stok di bawah nol.',
          }}
        />
      </Card>
    </>
  )
}
