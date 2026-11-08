import { useEffect, useState } from 'react'
import { Download, FileText, Pencil, Receipt, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { NamaBarang } from '@/components/ui/nama-barang'
import { DatePicker } from '@/components/ui/date-picker'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { Select } from '@/components/ui/select'
import { EditPenjualanDialog } from '@/features/penjualan/edit-penjualan-dialog'
import { PenjualanForm } from '@/features/penjualan/penjualan-form'
import { useAsync } from '@/hooks/use-async'
import { formatAngka } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { usePageSize } from '@/lib/preferences'
import { exportSalesExcel, exportSalesPdf } from '@/features/penjualan/export-penjualan'
import { getSalesExport, getSalesPage, getStockData } from '@/services/queries'

const DEFAULT_PAGE_SIZE = 20

export function PenjualanPage() {
  const PAGE_SIZE = usePageSize(DEFAULT_PAGE_SIZE)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [brand, setBrand] = useState('')
  const rangeError = from && to && from > to ? 'Tanggal "Dari" tidak boleh setelah "Sampai".' : ''
  const filter = rangeError ? { from: '', to: '', brand } : { from, to, brand }
  const sales = useAsync(() => getSalesPage({ page, pageSize: PAGE_SIZE, ...filter }), [page, filter.from, filter.to, filter.brand, PAGE_SIZE])
  useEffect(() => setPage(1), [from, to, brand, PAGE_SIZE])

  const [exporting, setExporting] = useState('')
  async function handleExport(kind) {
    if (exporting) return
    setExporting(kind)
    try {
      const rows = await getSalesExport(filter) // semua halaman sesuai filter yang sedang dipakai
      if (rows.length === 0) toast.info('Tidak ada penjualan untuk diekspor')
      else if (kind === 'xlsx') exportSalesExcel(rows, filter)
      else exportSalesPdf(rows, filter)
    } catch (failure) {
      toast.error('Ekspor gagal', { description: failure.message })
    } finally {
      setExporting('')
    }
  }
  const stock = useAsync(getStockData, [])
  const items = stock.data?.items ?? []
  const waiting = sales.loading && !sales.data

  const brandOptions = [{ value: '', label: 'Semua brand' }, ...(stock.data?.brands ?? []).map((entry) => ({ value: entry.name, label: entry.name }))]
  const filtered = Boolean(from || to || brand)

  const columns = [
    { key: 'date', label: 'Tgl', render: (row) => <span className="whitespace-nowrap">{row.date.slice(8, 10)}/{row.date.slice(5, 7)}</span> },
    { key: 'item', label: 'Barang', render: (row) => <NamaBarang name={row.item} /> },
    { key: 'qty', label: 'Qty', align: 'right', render: (row) => formatAngka(row.qty) },
    { key: 'stock', label: 'Sisa', align: 'right', render: (row) => formatAngka(row.stock) },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'right',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setEditing(row)} disabled={items.length === 0} aria-label="Ubah penjualan" title="Ubah penjualan">
          <Pencil size={15} />
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

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] 2xl:items-start">
        <Card className="max-w-xl 2xl:max-w-none">
          <CardHeader
            title="Catat Penjualan"
            description="Penjualan otomatis mengurangi stok. Stok yang kurang dicatat sebagai pre-order (minus)."
          />
          {stock.error ? (
            <div className="px-4 pb-4 sm:px-5">
              <ErrorNotice error={stock.error} onRetry={refresh} />
            </div>
          ) : (
            <PenjualanForm items={items} onSaved={refresh} />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Penjualan Terbaru"
            action={
              <span className="inline-flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')} disabled={Boolean(exporting) || Boolean(rangeError) || sales.data?.total === 0}>
                  <Download />
                  {exporting === 'xlsx' ? 'Menyiapkan…' : 'Excel'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={Boolean(exporting) || Boolean(rangeError) || sales.data?.total === 0}>
                  <FileText />
                  {exporting === 'pdf' ? 'Menyiapkan…' : 'PDF'}
                </Button>
              </span>
            }
          />
          <div className="filter-bar sales-filter-bar">
            <div className="filter-dates">
              <DatePicker id="filter-dari" aria-label="Dari tanggal" placeholder="Dari" value={from} onChange={setFrom} max={todayISO()} />
              <span aria-hidden="true">—</span>
              <DatePicker id="filter-sampai" aria-label="Sampai tanggal" placeholder="Sampai" value={to} onChange={setTo} max={todayISO()} />
            </div>
            <Select id="filter-brand" aria-label="Filter brand" value={brand} onValueChange={setBrand} options={brandOptions} className="sales-brand-filter" />
            <Button variant="ghost" size="sm" className="filter-reset" onClick={() => { setFrom(''); setTo(''); setBrand('') }} disabled={!filtered}>
              <X />
              Reset
            </Button>
          </div>
          {rangeError ? <p role="alert" className="px-4 pb-3 text-sm text-bahaya sm:px-5">{rangeError}</p> : null}
          {sales.error ? (
            <div className="px-4 pb-4 sm:px-5">
              <ErrorNotice error={sales.error} onRetry={refresh} />
            </div>
          ) : null}
          <DataTable
            caption="Penjualan terbaru"
            columns={columns}
            rows={sales.data ? sales.data.rows : []}
            tableOnMobile
            tableClassName="sales-history-table"
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
