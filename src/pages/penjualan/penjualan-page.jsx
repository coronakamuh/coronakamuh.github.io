import { useEffect, useState } from 'react'
import { Boxes, CalendarDays, Download, FileText, Pencil, Receipt, Search, ShoppingCart, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { PageTitle } from '@/components/layout/page-title'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/field'
import { NamaBarang } from '@/components/ui/nama-barang'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { Select } from '@/components/ui/select'
import { EditPenjualanDialog } from '@/features/penjualan/edit-penjualan-dialog'
import { PenjualanForm } from '@/features/penjualan/penjualan-form'
import { useAsync } from '@/hooks/use-async'
import { cn } from '@/lib/cn'
import { formatAngka, formatRupiah } from '@/lib/format'
import { addDaysISO, monthNames, monthRange, todayISO } from '@/lib/date'
import { usePageSize } from '@/lib/preferences'
import { getSalesExport, getSalesPage, getSalesStartMonth, getSalesSummary, getStockData } from '@/services/queries'

const DEFAULT_PAGE_SIZE = 20

function buildMonthOptions(startMonth, currentMonth) {
  const first = startMonth && startMonth <= currentMonth ? startMonth : currentMonth
  const options = []
  let [year, month] = first.split('-').map(Number)
  const [endYear, endMonth] = currentMonth.split('-').map(Number)

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const value = `${year}-${String(month).padStart(2, '0')}`
    options.push({ value, label: `${monthNames[month - 1]} ${year}` })
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return options
}

export function PenjualanPage() {
  const PAGE_SIZE = usePageSize(DEFAULT_PAGE_SIZE)
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const currentMonth = todayISO().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = useState(() => todayISO().slice(0, 7))
  const [brand, setBrand] = useState('')
  // Pencarian nama barang: `query` mengikuti ketikan, `search` dipakai untuk mengambil data (jeda 0,3 detik).
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const salesStart = useAsync(getSalesStartMonth, [])
  const { start: from, next } = monthRange(`${selectedMonth}-01`)
  const to = addDaysISO(next, -1)
  const filter = { from, to, brand }
  const sales = useAsync(
    () => getSalesPage({ page, pageSize: PAGE_SIZE, ...filter, q: search }),
    [page, filter.from, filter.to, filter.brand, search, PAGE_SIZE],
  )
  useEffect(() => setPage(1), [selectedMonth, brand, search, PAGE_SIZE])
  const todaySummary = useAsync(() => getSalesSummary({ from: todayISO(), to: todayISO() }), [])

  const [exporting, setExporting] = useState('')
  async function handleExport(kind) {
    if (exporting) return
    setExporting(kind)
    try {
      const rows = await getSalesExport(filter) // semua halaman sesuai bulan dan brand yang sedang dipakai
      if (rows.length === 0) toast.info('Tidak ada penjualan untuk diekspor')
      else {
        const { exportSalesExcel, exportSalesPdf } = await import('@/features/penjualan/export-penjualan')
        if (kind === 'xlsx') exportSalesExcel(rows, filter)
        else exportSalesPdf(rows, filter)
      }
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

  // Rincian qty × harga = total ditempatkan di sisi kanan, tepat di bawah tombol edit.
  const columns = [
    { key: 'date', label: 'Tgl', className: 'w-[8%] whitespace-nowrap', render: (row) => <span className="whitespace-nowrap">{row.date.slice(8, 10)}/{row.date.slice(5, 7)}</span> },
    {
      key: 'item',
      label: 'Barang',
      className: 'w-[57%] min-w-0',
      render: (row) => (
        <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap @xl:overflow-visible @xl:whitespace-normal @xl:break-words" title={row.item}><NamaBarang name={row.item} /></span>
      ),
    },
    {
      key: 'stock',
      label: 'Sisa',
      align: 'right',
      className: 'w-[8%] whitespace-nowrap hidden sm:table-cell',
      mobileHidden: true,
      render: (row) => <span className={row.stock < 0 ? 'text-bahaya' : undefined}>{formatAngka(row.stock)}</span>,
    },
    {
      key: 'actions',
      label: 'Rincian / Aksi',
      align: 'right',
      className: 'w-[27%]',
      render: (row) => (
        <div className="flex flex-col items-end gap-0.5">
          <Button variant="ghost" size="icon-sm" className="-my-1" onClick={() => setEditing(row)} disabled={items.length === 0} aria-label="Ubah penjualan" title="Ubah penjualan">
            <Pencil size={15} />
          </Button>
          <span className="whitespace-nowrap text-xs font-semibold tabular-nums">{formatAngka(row.qty)} × {formatRupiah(row.price)} = {formatRupiah(row.total)}</span>
        </div>
      ),
    },
  ]

  function refresh() {
    sales.reload()
    stock.reload()
    todaySummary.reload()
  }

  const todayText = todaySummary.error ? '—' : todaySummary.data ? formatRupiah(todaySummary.data.revenue) : '…'
  const emptyDescription = search ? 'Tidak ada barang yang cocok dengan pencarian pada bulan dan brand yang dipilih.' : 'Belum ada penjualan pada bulan dan brand yang dipilih.'

  return (
    <div className="space-y-3">
      {/* Judul + ringkasan hari ini */}
      <PageTitle
        icon={ShoppingCart}
        title="Penjualan"
        description="Pencatatan transaksi dengan stok yang diperbarui otomatis"
        inlineActions
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-garis bg-lembar px-3 py-1.5">
            <TrendingUp className="size-4 text-pena" aria-hidden="true" />
            <div className="leading-tight">
              <div className="text-[11px] text-tinta-redup">Hari ini</div>
              <div className="text-sm font-semibold tabular-nums" aria-live="polite">{todayText}</div>
            </div>
          </div>
        }
      />

      {/* Form ringkas */}
      <Card className="p-3">
        {stock.error ? (
          <ErrorNotice error={stock.error} onRetry={refresh} />
        ) : (
          <PenjualanForm items={items} onSaved={refresh} />
        )}
      </Card>

      {/* Transaksi terbaru */}
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-1.5">
              <Receipt className="size-4 text-tinta-redup" aria-hidden="true" />
              Transaksi terbaru
            </span>
          }
          action={
            <span className="inline-flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')} disabled={Boolean(exporting) || sales.data?.total === 0}>
                <Download />
                {exporting === 'xlsx' ? 'Menyiapkan…' : 'Excel'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={Boolean(exporting) || sales.data?.total === 0}>
                <FileText />
                {exporting === 'pdf' ? 'Menyiapkan…' : 'PDF'}
              </Button>
            </span>
          }
        />
        <div className="filter-bar sales-filter-bar">
          <div className="filter-grow sales-search relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
            <Input
              id="cari-penjualan"
              type="text"
              autoComplete="off"
              aria-label="Cari barang"
              placeholder="Cari barang…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            id="filter-bulan"
            aria-label="Filter bulan dan tahun"
            value={selectedMonth}
            onValueChange={setSelectedMonth}
            options={buildMonthOptions(salesStart.data, currentMonth)}
            className="sales-month-filter"
            disabled={salesStart.loading}
          />
          <Select id="filter-brand" aria-label="Filter brand" value={brand} onValueChange={setBrand} options={brandOptions} className="sales-brand-filter" />
        </div>
        {salesStart.error ? (
          <div className="px-4 pb-3 sm:px-5">
            <ErrorNotice error={salesStart.error} onRetry={salesStart.reload} />
          </div>
        ) : null}
        {sales.error ? (
          <div className="px-4 pb-4 sm:px-5">
            <ErrorNotice error={sales.error} onRetry={refresh} />
          </div>
        ) : null}
        <DataTable
          caption="Transaksi terbaru"
          columns={columns}
          rows={sales.data ? sales.data.rows : []}
          striped
          mobileRow={(row) => (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-snug font-medium break-words">
                  <NamaBarang name={row.item} />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-tinta-redup tabular-nums">
                  <span className="inline-flex items-center gap-1" title="Tanggal">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Tanggal</span>
                    {row.date.slice(8, 10)}/{row.date.slice(5, 7)}
                  </span>
                  <span className={cn('inline-flex items-center gap-1', row.stock < 0 && 'text-bahaya')} title="Sisa stok">
                    <Boxes className="size-3.5" aria-hidden="true" />
                    Sisa: {formatAngka(row.stock)}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <Button variant="ghost" size="icon-sm" className="-my-1" onClick={() => setEditing(row)} disabled={items.length === 0} aria-label="Ubah penjualan" title="Ubah penjualan">
                  <Pencil size={15} />
                </Button>
                <span className="whitespace-nowrap text-xs font-semibold text-tinta tabular-nums">{formatAngka(row.qty)} × {formatRupiah(row.price)} = {formatRupiah(row.total)}</span>
              </div>
            </div>
          )}
          empty={{
            icon: Receipt,
            title: waiting ? 'Memuat data' : 'Belum ada transaksi',
            description: waiting ? '' : emptyDescription,
          }}
        />
        <Pager page={page} pageSize={PAGE_SIZE} total={sales.data?.total ?? 0} onPageChange={setPage} />
      </Card>

      <EditPenjualanDialog sale={editing} items={items} onOpenChange={(open) => !open && setEditing(null)} onDone={refresh} />
    </div>
  )
}
