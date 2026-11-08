import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Package, Plus, Search, TriangleAlert, Boxes, ShoppingCart, Pencil, ArrowLeftRight } from 'lucide-react'
import { PageTitle } from '@/components/layout/page-title'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { NamaBarang } from '@/components/ui/nama-barang'
import { Input } from '@/components/ui/field'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { Select } from '@/components/ui/select'
import { StatCard } from '@/components/ui/stat-card'
import { toast } from 'sonner'
import { useAsync } from '@/hooks/use-async'
import { useMutation } from '@/hooks/use-mutation'
import { BarangDialog } from '@/features/stok/barang-dialog'
import { DetailBarangDialog } from '@/features/stok/detail-barang-dialog'
import { MutasiDialog } from '@/features/stok/mutasi-dialog'
import { formatAngka, formatRupiah } from '@/lib/format'
import { usePageSize } from '@/lib/preferences'
import { getStockData } from '@/services/queries'

const DEFAULT_PAGE_SIZE = 50

const need = (row) => Math.max(0, -row.stock)

const baseColumns = [
  { key: 'brand', label: 'Brand' },
  {
    key: 'stock',
    label: 'Stok',
    align: 'right',
    render: (row) => (
      <span className={row.stock < 0
        ? 'inline-flex min-w-12 justify-end rounded-md bg-bahaya/10 px-2 py-1 font-semibold text-bahaya'
        : row.stock === 0
          ? 'inline-flex min-w-12 justify-end rounded-md bg-amber-50 px-2 py-1 font-semibold text-amber-700'
          : 'inline-flex min-w-12 justify-end rounded-md bg-sukses/10 px-2 py-1 font-semibold text-sukses'
      }>
        {formatAngka(row.stock)}
      </span>
    ),
  },
  { key: 'need', label: 'Kebutuhan PO', align: 'right', render: (row) => (need(row) > 0 ? formatAngka(need(row)) : '—') },
  { key: 'price', label: 'Harga terakhir', align: 'right', render: (row) => (row.price === null ? '—' : formatRupiah(row.price)) },
]

export function StokPage() {
  const PAGE_SIZE = usePageSize(DEFAULT_PAGE_SIZE)
  const { data, error, loading, reload } = useAsync(getStockData, [])
  const [dialog, setDialog] = useState(null) // { kind: 'tambah' | 'ubah' | 'mutasi' | 'detail', item? }
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')
  const [page, setPage] = useState(1)
  const waiting = loading && !data

  useEffect(() => setPage(1), [query, brand, PAGE_SIZE])

  const items = data?.items ?? []
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => (!brand || item.brand === brand) && item.name.toLowerCase().includes(needle))
  }, [items, query, brand])
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalStock = items.reduce((total, item) => total + Math.max(item.stock, 0), 0)
  const minusCount = items.filter((item) => item.stock < 0).length
  const poTotal = items.reduce((total, item) => total + need(item), 0)
  const brandOptions = [{ value: '', label: 'Semua brand' }, ...(data?.brandNames ?? []).map((name) => ({ value: name, label: name }))]

  const columns = [
    {
      key: 'name',
      label: 'Barang',
      render: (row) => (
        <button type="button" className="text-left font-medium underline-offset-2 hover:underline" onClick={() => setDialog({ kind: 'detail', item: row })}>
          <NamaBarang name={row.name} />
        </button>
      ),
    },
    ...baseColumns,
    {
      key: 'actions',
      label: 'Aksi',
      align: 'right',
      render: (row) => (
        <span className="inline-flex items-center justify-end gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => setDialog({ kind: 'mutasi', item: row })} aria-label={`Mutasi stok ${row.name}`} title="Mutasi stok">
            <ArrowLeftRight />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setDialog({ kind: 'ubah', item: row })} aria-label={`Ubah ${row.name}`} title="Ubah barang">
            <Pencil />
          </Button>
        </span>
      ),
    },
  ]

  const { run: runRecap, pending: recapPending } = useMutation(async (format) => {
    try {
      const { loadRecap, exportRecapPdf, exportRecapExcel } = await import('@/features/stok/export-rekap')
      const recap = await loadRecap()
      if (!recap) {
        toast.info('Tidak ada barang dengan stok pada periode ini')
        return
      }
      if (format === 'pdf') exportRecapPdf(recap)
      else exportRecapExcel(recap)
    } catch (failure) {
      toast.error('Rekap stok gagal dibuat', { description: failure.message })
    }
  })

  return (
    <div className="space-y-3">
      <PageTitle
        icon={Boxes}
        title="Produk & Stok"
        description="Kelola barang, merek, dan jumlah stok."
        actions={
          <Button onClick={() => setDialog({ kind: 'tambah' })} className="w-full sm:w-auto">
            <Plus />
            Tambah Barang
          </Button>
        }
      />

      {error ? <ErrorNotice error={error} onRetry={reload} /> : null}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <StatCard label="Total Barang" icon={Package} value={waiting ? '…' : data ? formatAngka(items.length) : undefined} hint="Barang terdaftar" />
        <StatCard label="Total Stok" icon={Boxes} value={waiting ? '…' : data ? formatAngka(totalStock) : undefined} hint="Unit, tanpa stok minus" />
        <StatCard
          label="Barang Minus"
          icon={TriangleAlert}
          tone="danger"
          value={waiting ? '…' : data ? formatAngka(minusCount) : undefined}
          hint="Stok di bawah nol"
        />
        <StatCard label="Kebutuhan PO" icon={ShoppingCart} value={waiting ? '…' : data ? formatAngka(poTotal) : undefined} hint="Unit untuk menutup stok minus" />
      </div>

      <Card className="min-w-0">
        <CardHeader
          title="Daftar Produk"
          description={data ? `${formatAngka(filtered.length)} dari ${formatAngka(items.length)} barang.` : 'Cari barang dan kelola stok.'}
          action={
            <span className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => runRecap('xlsx')} disabled={recapPending} title="Rekap stok harian, 30 hari terakhir">
                <Download />
                Excel
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => runRecap('pdf')} disabled={recapPending} title="Rekap stok harian, 30 hari terakhir">
                <FileText />
                PDF
              </Button>
            </span>
          }
        />
        <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-[minmax(0,1fr)_13rem] sm:px-5">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
            <Input type="search" aria-label="Cari barang" placeholder="Cari nama barang…" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <Select aria-label="Filter brand" value={brand} onValueChange={setBrand} options={brandOptions} className="h-11 w-full sm:w-52" />
        </div>
        <DataTable
          caption="Daftar produk dan stok"
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
      <DetailBarangDialog
        item={dialog?.kind === 'detail' ? dialog.item : null}
        onOpenChange={(open) => !open && setDialog(null)}
        onMutasi={(item) => setDialog({ kind: 'mutasi', item })}
        onUbah={(item) => setDialog({ kind: 'ubah', item })}
      />
      <MutasiDialog item={dialog?.kind === 'mutasi' ? dialog.item : null} onOpenChange={(open) => !open && setDialog(null)} onDone={reload} />
    </div>
  )
}
