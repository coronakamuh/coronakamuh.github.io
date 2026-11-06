import { useEffect, useState } from 'react'
import { History, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
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
  { key: 'date', label: 'Tanggal', render: (row) => formatDisplay(row.date) },
  {
    key: 'item',
    label: 'Barang',
    render: (row) => (
      <button type="button" className="text-left font-medium underline-offset-2 hover:underline" onClick={() => onDetail(row.id)}>
        {row.item}
      </button>
    ),
  },
  { key: 'label', label: 'Jenis' },
  {
    key: 'delta',
    label: 'Jumlah',
    align: 'right',
    render: (row) => (
      <span className={row.delta < 0 ? 'text-bahaya' : undefined}>
        {row.delta > 0 ? '+' : ''}
        {formatAngka(row.delta)}
      </span>
    ),
  },
  { key: 'note', label: 'Keterangan' },
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

  return (
    <>
      <PageHeader
        title="Riwayat In/Out"
        description="Catatan barang masuk, keluar, dan penyesuaian stok."
        actions={
          <Button onClick={() => setCatat(true)} disabled={!stock.data}>
            <Plus />
            Catat Mutasi
          </Button>
        }
      />

      <Card>
        <CardHeader title="Riwayat Mutasi" description={data ? `${formatAngka(data.total)} catatan.` : undefined} />
        <div className="filter-bar">
          <div className="filter-dates">
            <DatePicker id="riwayat-dari" aria-label="Dari tanggal" placeholder="Dari" value={from} onChange={setFrom} max={to || undefined} />
            <span aria-hidden="true">—</span>
            <DatePicker id="riwayat-sampai" aria-label="Sampai tanggal" placeholder="Sampai" value={to} onChange={setTo} min={from || undefined} />
          </div>
          <Select id="riwayat-jenis" aria-label="Jenis mutasi" value={group} onValueChange={setGroup} options={typeOptions} />
        </div>
        {error ? (
          <div className="px-4 pb-4 sm:px-5">
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
            description: waiting ? '' : filtering ? 'Ubah tanggal atau jenis mutasi.' : 'Barang masuk dan keluar akan tercatat di sini.',
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
    </>
  )
}
