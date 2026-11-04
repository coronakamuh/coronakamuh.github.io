import { useEffect, useMemo, useState } from 'react'
import { Download, Package, Plus, Search, TriangleAlert, Boxes } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/field'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { Select } from '@/components/ui/select'
import { StatCard } from '@/components/ui/stat-card'
import { useAsync } from '@/hooks/use-async'
import { BarangDialog } from '@/features/stok/barang-dialog'
import { MutasiDialog } from '@/features/stok/mutasi-dialog'
import { downloadCsv } from '@/lib/export'
import { formatAngka, formatRupiah } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { getStockData } from '@/services/queries'

const PAGE_SIZE = 50

const baseColumns = [
  { key: 'name', label: 'Barang' },
  { key: 'brand', label: 'Brand' },
  {
    key: 'stock',
    label: 'Stok',
    align: 'right',
    render: (row) => <span className={row.stock < 0 ? 'text-bahaya' : undefined}>{formatAngka(row.stock)}</span>,
  },
  { key: 'price', label: 'Harga terakhir', align: 'right', render: (row) => (row.price === null ? '—' : formatRupiah(row.price)) },
]

const csvColumns = [
  { label: 'Barang', value: (row) => row.name },
  { label: 'Brand', value: (row) => row.brand },
  { label: 'Stok', value: (row) => row.stock },
  { label: 'Harga terakhir', value: (row) => row.price ?? '' },
]

export function StokPage() {
  const { data, error, loading, reload } = useAsync(getStockData, [])
  const [dialog, setDialog] = useState(null) // { kind: 'tambah' | 'ubah' | 'mutasi', item? }
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')
  const [page, setPage] = useState(1)
  const waiting = loading && !data

  useEffect(() => setPage(1), [query, brand])

  const items = data?.items ?? []
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => (!brand || item.brand === brand) && item.name.toLowerCase().includes(needle))
  }, [items, query, brand])
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalStock = items.reduce((total, item) => total + Math.max(item.stock, 0), 0)
  const minusCount = items.filter((item) => item.stock < 0).length
  const brandOptions = [{ value: '', label: 'Semua brand' }, ...(data?.brandNames ?? []).map((name) => ({ value: name, label: name }))]

  const columns = [
    ...baseColumns,
    {
      key: 'actions',
      label: 'Aksi',
      align: 'right',
      render: (row) => (
        <span className="inline-flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setDialog({ kind: 'mutasi', item: row })}>
            Mutasi
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDialog({ kind: 'ubah', item: row })}>
            Ubah
          </Button>
        </span>
      ),
    },
  ]

  function handleExport() {
    downloadCsv(`stok-barang-${todayISO()}.csv`, csvColumns, filtered)
  }

  return (
    <>
      <PageHeader
        title="Stok Barang"
        description="Daftar barang dan jumlah stoknya."
        actions={
          <Button onClick={() => setDialog({ kind: 'tambah' })}>
            <Plus />
            Tambah Barang
          </Button>
        }
      />

      {error ? (
        <div className="mb-6">
          <ErrorNotice error={error} onRetry={reload} />
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:grid-cols-3">
        <StatCard label="Total Barang" icon={Package} value={waiting ? '…' : data ? formatAngka(items.length) : undefined} hint="Barang terdaftar" />
        <StatCard label="Total Stok" icon={Boxes} value={waiting ? '…' : data ? formatAngka(totalStock) : undefined} hint="Unit, tanpa stok minus" />
        <StatCard
          label="Barang Minus"
          icon={TriangleAlert}
          tone="danger"
          value={waiting ? '…' : data ? formatAngka(minusCount) : undefined}
          hint="Stok di bawah nol"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Tabel Stok"
          description={data ? `${formatAngka(filtered.length)} dari ${formatAngka(items.length)} barang.` : undefined}
          action={
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
              <Download />
              Ekspor CSV
            </Button>
          }
        />
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:px-5 sm:pb-5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
            <Input type="search" aria-label="Cari barang" placeholder="Cari nama barang" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <Select aria-label="Filter brand" value={brand} onValueChange={setBrand} options={brandOptions} />
        </div>
        <DataTable
          caption="Tabel stok barang"
          columns={columns}
          rows={pageRows}
          empty={{
            icon: Package,
            title: waiting ? 'Memuat data' : items.length === 0 ? 'Belum ada barang' : 'Barang tidak ditemukan',
            description: waiting ? '' : items.length === 0 ? 'Belum ada barang di database.' : 'Coba kata kunci atau brand yang lain.',
          }}
        />
        <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      </Card>

      <BarangDialog
        open={dialog?.kind === 'tambah' || dialog?.kind === 'ubah'}
        item={dialog?.kind === 'ubah' ? dialog.item : null}
        brands={data?.brands ?? []}
        existingNames={items.map((item) => item.name)}
        onOpenChange={(open) => !open && setDialog(null)}
        onDone={reload}
      />
      <MutasiDialog item={dialog?.kind === 'mutasi' ? dialog.item : null} onOpenChange={(open) => !open && setDialog(null)} onDone={reload} />
    </>
  )
}
