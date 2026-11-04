import { useState } from 'react'
import { Banknote, Boxes, Package, Tags, TriangleAlert } from 'lucide-react'
import { BarChart } from '@/components/charts/bar-chart'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
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
  { key: 'name', label: 'Barang' },
  { key: 'brand', label: 'Brand' },
  { key: 'stock', label: 'Stok', align: 'right', render: (row) => <span className="text-bahaya">{formatAngka(row.stock)}</span> },
]

function BrandRow({ brand }) {
  const hasTarget = brand.target !== null && brand.target > 0
  const percent = hasTarget ? Math.min(100, Math.round((brand.total / brand.target) * 100)) : 0
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium">{brand.name}</span>
        <span className="shrink-0 tabular-nums">{formatRupiah(brand.total)}</span>
      </div>
      {hasTarget ? (
        <>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-garis-halus" role="presentation">
            <div className="h-full rounded-full bg-pena" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-tinta-redup">
            {Math.round((brand.total / brand.target) * 100)}% dari target {formatRupiah(brand.target)}
          </p>
        </>
      ) : (
        <p className="mt-1 text-xs text-tinta-redup">Target belum diatur</p>
      )}
    </li>
  )
}

export function DashboardPage() {
  const [period, setPeriod] = useState('minggu')
  const { data, error, loading, reload } = useAsync(getDashboard, [])
  const waiting = loading && !data

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={data ? `Ringkasan stok dan penjualan, ${formatDisplay(data.today)}.` : 'Ringkasan stok dan penjualan.'}
      />

      {error ? (
        <div className="mb-6">
          <ErrorNotice error={error} onRetry={reload} />
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 lg:grid-cols-4">
        <StatCard label="Total Barang" icon={Package} value={waiting ? '…' : data ? formatAngka(data.totalBarang) : undefined} hint="Barang terdaftar" />
        <StatCard label="Total Stok" icon={Boxes} value={waiting ? '…' : data ? formatAngka(data.totalStok) : undefined} hint="Unit, tanpa stok minus" />
        <StatCard label="Omzet Hari Ini" icon={Banknote} value={waiting ? '…' : data ? formatRupiah(data.omzetHariIni) : undefined} hint="Jumlah × harga penjualan" />
        <StatCard
          label="Barang Minus"
          icon={TriangleAlert}
          tone="danger"
          value={waiting ? '…' : data ? formatAngka(data.minusItems.length) : undefined}
          hint="Stok di bawah nol"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Ringkasan Penjualan"
            description={period === 'minggu' ? 'Per hari, 7 hari terakhir.' : 'Per pekan, 4 pekan terakhir (tanggal = awal pekan).'}
            action={<Segmented label="Periode grafik" value={period} onValueChange={setPeriod} options={periodOptions} />}
          />
          <CardBody>
            <BarChart
              data={data ? data.sales[period] : []}
              formatValue={formatRupiah}
              emptyTitle={waiting ? 'Memuat data' : 'Belum ada penjualan'}
              emptyDescription={waiting ? '' : `Belum ada penjualan pada periode ${period} ini.`}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Performa Brand" description="Penjualan bulan ini terhadap target." />
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
      </div>

      <Card className="mt-6">
        <CardHeader title="Daftar Barang Minus" description="Barang dengan stok di bawah nol (kekurangan pre-order)." />
        <DataTable
          caption="Daftar barang minus"
          columns={minusColumns}
          rows={data ? data.minusItems : []}
          empty={{
            icon: TriangleAlert,
            title: waiting ? 'Memuat data' : 'Tidak ada barang minus',
            description: waiting ? '' : 'Barang yang stoknya minus akan tercantum di sini.',
          }}
        />
      </Card>
    </>
  )
}
