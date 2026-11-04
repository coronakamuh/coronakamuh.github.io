import { useState } from 'react'
import { TriangleAlert, Banknote, Boxes, Package, Tags } from 'lucide-react'
import { BarChart } from '@/components/charts/bar-chart'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Segmented } from '@/components/ui/segmented'
import { StatCard } from '@/components/ui/stat-card'

const periodOptions = [
  { value: 'minggu', label: 'Minggu' },
  { value: 'bulan', label: 'Bulan' },
]

const minusColumns = [
  { key: 'name', label: 'Barang' },
  { key: 'brand', label: 'Brand' },
  { key: 'stock', label: 'Stok', align: 'right' },
]

// Belum ada database, jadi semua daftar kosong. Jangan isi dengan data contoh.
const salesSeries = []
const minusItems = []

export function DashboardPage() {
  const [period, setPeriod] = useState('minggu')

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan stok dan penjualan." />

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 lg:grid-cols-4">
        <StatCard label="Total Barang" icon={Package} />
        <StatCard label="Total Stok" icon={Boxes} />
        <StatCard label="Omzet Hari Ini" icon={Banknote} />
        <StatCard label="Barang Minus" icon={TriangleAlert} tone="danger" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Ringkasan Penjualan"
            description={period === 'minggu' ? 'Per hari, 7 hari terakhir.' : 'Per minggu, 1 bulan terakhir.'}
            action={
              <Segmented
                label="Periode grafik"
                value={period}
                onValueChange={setPeriod}
                options={periodOptions}
              />
            }
          />
          <CardBody>
            <BarChart
              data={salesSeries}
              emptyTitle="Belum ada penjualan"
              emptyDescription={`Grafik ${period} ini terisi setelah penjualan dicatat.`}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Performa Brand" description="Penjualan per brand." />
          <CardBody>
            <EmptyState
              icon={Tags}
              title="Belum ada brand"
              description="Performa muncul setelah ada barang dan penjualan."
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Daftar Barang Minus" description="Barang dengan stok di bawah nol." />
        <DataTable
          caption="Daftar barang minus"
          columns={minusColumns}
          rows={minusItems}
          empty={{
            icon: TriangleAlert,
            title: 'Tidak ada barang minus',
            description: 'Barang yang stoknya minus akan tercantum di sini.',
          }}
        />
      </Card>
    </>
  )
}
