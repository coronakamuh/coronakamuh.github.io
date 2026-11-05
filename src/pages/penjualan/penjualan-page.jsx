import { useEffect, useState } from 'react'
import { Receipt, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { DatePicker } from '@/components/ui/date-picker'
import { Field } from '@/components/ui/field'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { Select } from '@/components/ui/select'
import { EditPenjualanDialog } from '@/features/penjualan/edit-penjualan-dialog'
import { PenjualanForm } from '@/features/penjualan/penjualan-form'
import { useAsync } from '@/hooks/use-async'
import { formatAngka, formatRupiah } from '@/lib/format'
import { formatDisplay, todayISO } from '@/lib/date'
import { getSalesPage, getSalesSummary, getStockData } from '@/services/queries'

const PAGE_SIZE = 20

export function PenjualanPage() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [brand, setBrand] = useState('')
  const rangeError = from && to && from > to ? 'Tanggal "Dari" tidak boleh setelah "Sampai".' : ''
  const filter = rangeError ? { from: '', to: '', brand } : { from, to, brand }
  const sales = useAsync(() => getSalesPage({ page, pageSize: PAGE_SIZE, ...filter }), [page, filter.from, filter.to, filter.brand])
  const summary = useAsync(() => getSalesSummary(filter), [filter.from, filter.to, filter.brand])
  useEffect(() => setPage(1), [from, to, brand])
  const stock = useAsync(getStockData, [])
  const items = stock.data?.items ?? []
  const waiting = sales.loading && !sales.data

  const brandOptions = [{ value: '', label: 'Semua brand' }, ...(stock.data?.brands ?? []).map((entry) => ({ value: entry.name, label: entry.name }))]
  const filtered = Boolean(from || to || brand)

  const columns = [
    { key: 'date', label: 'Tanggal', render: (row) => <span className="whitespace-nowrap">{formatDisplay(row.date)}</span> },
    { key: 'item', label: 'Nama Barang' },
    { key: 'qty', label: 'Qty', align: 'right', render: (row) => formatAngka(row.qty) },
    { key: 'price', label: 'Harga', align: 'right', render: (row) => <span className="whitespace-nowrap">{formatRupiah(row.price)}</span> },
    { key: 'total', label: 'Total', align: 'right', render: (row) => <span className="whitespace-nowrap">{formatRupiah(row.total)}</span> },
    { key: 'brand', label: 'Brand' },
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
    summary.reload()
    stock.reload()
  }

  return (
    <>
      <PageHeader title="Penjualan" description="Catat penjualan dan lihat transaksi terbaru." />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] 2xl:items-start">
        <Card className="max-w-xl 2xl:max-w-none">
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
          <CardHeader title="Penjualan Terbaru" 
            description={
              summary.data
                ? `${formatAngka(summary.data.count)} penjualan · ${formatAngka(summary.data.units)} unit · ${formatRupiah(summary.data.revenue)}${filtered ? ' (sesuai filter)' : ''}`
                : undefined
            }
          />
          <div className="grid gap-3 px-4 pb-4 sm:grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,1fr)_auto] sm:items-end sm:px-5">
            <Field label="Dari tanggal" htmlFor="filter-dari">
              <DatePicker id="filter-dari" value={from} onChange={setFrom} max={todayISO()} />
            </Field>
            <Field label="Sampai tanggal" htmlFor="filter-sampai">
              <DatePicker id="filter-sampai" value={to} onChange={setTo} max={todayISO()} />
            </Field>
            <Field label="Brand" htmlFor="filter-brand">
              <Select id="filter-brand" aria-label="Filter brand" value={brand} onValueChange={setBrand} options={brandOptions} />
            </Field>
            <Button variant="ghost" onClick={() => { setFrom(''); setTo(''); setBrand('') }} disabled={!filtered}>
              <X />
              Reset
            </Button>
          </div>
          {rangeError ? <p role="alert" className="px-4 pb-3 text-sm text-bahaya sm:px-5">{rangeError}</p> : null}
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
              title: waiting ? 'Memuat data' : filtered ? 'Tidak ada penjualan' : 'Belum ada penjualan',
              description: waiting ? '' : filtered ? 'Coba ubah tanggal atau brand.' : 'Penjualan yang dicatat akan tampil di sini, yang terbaru paling atas.',
            }}
          />
          <Pager page={page} pageSize={PAGE_SIZE} total={sales.data?.total ?? 0} onPageChange={setPage} />
        </Card>
      </div>

      <EditPenjualanDialog sale={editing} items={items} onOpenChange={(open) => !open && setEditing(null)} onDone={refresh} />
    </>
  )
}
