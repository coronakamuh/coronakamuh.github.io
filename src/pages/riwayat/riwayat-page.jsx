import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, History, Plus, RotateCcw, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { NamaBarang } from '@/components/ui/nama-barang'
import { DatePicker } from '@/components/ui/date-picker'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { Select } from '@/components/ui/select'
import { useAsync } from '@/hooks/use-async'
import { formatAngka } from '@/lib/format'
import { formatDisplay } from '@/lib/date'
import { DetailMutasiDialog } from '@/features/riwayat/detail-mutasi-dialog'
import { MutasiDialog } from '@/features/stok/mutasi-dialog'
import { usePageSize } from '@/lib/preferences'
import { getMovementsPage, getStockData } from '@/services/queries'

const DEFAULT_PAGE_SIZE = 20

const makeColumns = (onDetail) => [
  {
    key: 'date',
    label: 'Tanggal',
    className: 'w-[12%] whitespace-nowrap',
    render: (row) => <span className="whitespace-nowrap font-medium text-tinta">{formatDisplay(row.date)}</span>,
  },
  {
    key: 'item',
    label: 'Produk',
    className: 'w-[32%] min-w-0',
    render: (row) => (
      <button type="button" className="text-left font-semibold underline-offset-2 hover:underline" onClick={() => onDetail(row.id)}>
        <NamaBarang name={row.item} />
      </button>
    ),
  },
  {
    key: 'label',
    label: 'Jenis transaksi',
    className: 'w-[20%]',
    render: (row) => <span className="inline-flex rounded-full bg-garis-halus px-2 py-1 text-xs font-medium text-tinta">{row.label}</span>,
  },
  {
    key: 'delta',
    label: 'Jumlah',
    align: 'right',
    className: 'w-[12%] whitespace-nowrap',
    render: (row) => (
      <span className={row.delta < 0 ? 'inline-flex items-center gap-1 font-semibold text-bahaya' : 'inline-flex items-center gap-1 font-semibold text-sukses'}>
        {row.delta < 0 ? <ArrowDownLeft className="size-3.5" aria-hidden="true" /> : <ArrowUpRight className="size-3.5" aria-hidden="true" />}
        {row.delta > 0 ? '+' : ''}
        {formatAngka(row.delta)}
      </span>
    ),
  },
  { key: 'note', label: 'Keterangan', className: 'w-[24%]' },
]

const typeOptions = [
  { value: '', label: 'Semua jenis' },
  { value: 'masuk', label: 'Barang masuk' },
  { value: 'terjual', label: 'Terjual (dari penjualan)' },
  { value: 'keluar', label: 'Barang keluar (manual)' },
  { value: 'koreksi', label: 'Koreksi stok' },
]

export function RiwayatPage() {
  const PAGE_SIZE = usePageSize(DEFAULT_PAGE_SIZE)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [group, setGroup] = useState('')
  const [page, setPage] = useState(1)
  const { data, error, loading, reload } = useAsync(
    () => getMovementsPage({ page, pageSize: PAGE_SIZE, from, to, group }),
    [page, from, to, group, PAGE_SIZE],
  )
  const stock = useAsync(() => getStockData(), [])
  const [detailId, setDetailId] = useState(null)
  const [catat, setCatat] = useState(false)
  const columns = makeColumns(setDetailId)
  const waiting = loading && !data
  const filtering = Boolean(from || to || group)

  useEffect(() => setPage(1), [from, to, group])

  function resetFilters() {
    setFrom('')
    setTo('')
    setGroup('')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Riwayat Transaksi"
        description="Pantau barang masuk, keluar, dan penyesuaian stok."
        actions={
          <Button onClick={() => setCatat(true)} disabled={!stock.data} className="w-full sm:w-auto">
            <Plus />
            Catat Mutasi
          </Button>
        }
      />

      <Card className="min-w-0">
        <CardHeader
          title="Riwayat Mutasi"
          description={data ? `${formatAngka(data.total)} catatan transaksi` : 'Daftar seluruh pergerakan stok.'}
        />

        <div className="space-y-2.5 px-3 pb-4 sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-tinta-redup">Filter transaksi</p>
            {filtering ? (
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={resetFilters}>
                <X className="size-3.5" />
                Reset filter
              </Button>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(11rem,0.9fr)]">
            <div className="min-w-0 space-y-1">
              <label htmlFor="riwayat-dari" className="text-xs font-medium text-tinta-redup">Dari tanggal</label>
              <DatePicker id="riwayat-dari" aria-label="Dari tanggal" placeholder="Pilih tanggal awal" value={from} onChange={setFrom} max={to || undefined} />
            </div>
            <div className="min-w-0 space-y-1">
              <label htmlFor="riwayat-sampai" className="text-xs font-medium text-tinta-redup">Sampai tanggal</label>
              <DatePicker id="riwayat-sampai" aria-label="Sampai tanggal" placeholder="Pilih tanggal akhir" value={to} onChange={setTo} min={from || undefined} />
            </div>
            <div className="min-w-0 space-y-1">
              <label htmlFor="riwayat-jenis" className="text-xs font-medium text-tinta-redup">Jenis transaksi</label>
              <Select id="riwayat-jenis" aria-label="Jenis mutasi" value={group} onValueChange={setGroup} options={typeOptions} className="w-full" />
            </div>
          </div>
        </div>

        {error ? (
          <div className="px-3 pb-4 sm:px-5">
            <ErrorNotice error={error} onRetry={reload} />
          </div>
        ) : null}
        <DataTable
          caption="Riwayat barang masuk dan keluar"
          columns={columns}
          rows={data ? data.rows : []}
          empty={{
            icon: History,
            title: waiting ? 'Memuat data' : filtering ? 'Tidak ada riwayat yang cocok' : 'Belum ada riwayat',
            description: waiting ? '' : filtering ? 'Ubah tanggal atau jenis transaksi.' : 'Barang masuk dan keluar akan tercatat di sini.',
          }}
        />
        <Pager page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setPage} />
      </Card>

      <DetailMutasiDialog id={detailId} onOpenChange={(open) => !open && setDetailId(null)} />
      <MutasiDialog
        open={catat}
        items={stock.data?.items}
        onOpenChange={setCatat}
        onDone={() => {
          reload()
          stock.reload()
        }}
      />
    </div>
  )
}
