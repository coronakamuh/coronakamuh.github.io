import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { EditPenjualanDialog } from '@/features/penjualan/edit-penjualan-dialog'
import { PenjualanForm } from '@/features/penjualan/penjualan-form'
import { useAsync } from '@/hooks/use-async'
import { formatAngka, formatRupiah } from '@/lib/format'
import { formatDisplay } from '@/lib/date'
import { getSalesPage, getStockData } from '@/services/queries'

const PAGE_SIZE = 20

export function PenjualanPage() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const sales = useAsync(() => getSalesPage({ page, pageSize: PAGE_SIZE }), [page])
  const stock = useAsync(getStockData, [])
  const items = stock.data?.items ?? []
  const waiting = sales.loading && !sales.data

  const columns = [
    { key: 'date', label: 'Tanggal', render: (row) => formatDisplay(row.date) },
    { key: 'item', label: 'Barang' },
    { key: 'brand', label: 'Brand' },
    { key: 'qty', label: 'Jumlah', align: 'right', render: (row) => formatAngka(row.qty) },
    { key: 'total', label: 'Total', align: 'right', render: (row) => formatRupiah(row.total) },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'right',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setEditing(row)} disabled={items.length === 0}>
          Ubah
        </Button>
      ),
    },
  ]

  function refresh() {
    sales.reload()
    stock.reload()
  }

  return (
    <>
      <PageHeader title="Penjualan" description="Catat penjualan dan lihat transaksi terbaru." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader
            title="Catat Penjualan"
            description="Penjualan otomatis mengurangi stok. Stok yang kurang dicatat sebagai pre-order (minus)."
          />
          {stock.error ? (
            <div className="px-4 pb-4 sm:px-5">
              <ErrorNotice error={stock.error} onRetry={stock.reload} />
            </div>
          ) : (
            <PenjualanForm items={items} onSaved={refresh} />
          )}
        </Card>

        <Card>
          <CardHeader title="Penjualan Terbaru" description={sales.data ? `${formatAngka(sales.data.total)} penjualan tercatat.` : undefined} />
          {sales.error ? (
            <div className="px-4 pb-4 sm:px-5">
              <ErrorNotice error={sales.error} onRetry={sales.reload} />
            </div>
          ) : null}
          <DataTable
            caption="Penjualan terbaru"
            columns={columns}
            rows={sales.data ? sales.data.rows : []}
            empty={{
              icon: Receipt,
              title: waiting ? 'Memuat data' : 'Belum ada penjualan',
              description: waiting ? '' : 'Penjualan yang dicatat akan tampil di sini, yang terbaru paling atas.',
            }}
          />
          <Pager page={page} pageSize={PAGE_SIZE} total={sales.data?.total ?? 0} onPageChange={setPage} />
        </Card>
      </div>

      <EditPenjualanDialog sale={editing} items={items} onOpenChange={(open) => !open && setEditing(null)} onDone={refresh} />
    </>
  )
}
