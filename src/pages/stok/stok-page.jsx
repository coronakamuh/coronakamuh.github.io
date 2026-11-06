import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Package, Plus, Search, TriangleAlert, Boxes, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { NamaBarang } from '@/components/ui/nama-barang'
import { Input } from '@/components/ui/field'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { Select } from '@/components/ui/select'
import { StatCard } from '@/components/ui/stat-card'
import { useAsync } from '@/hooks/use-async'
import { BarangDialog } from '@/features/stok/barang-dialog'
import { DetailBarangDialog } from '@/features/stok/detail-barang-dialog'
import { MutasiDialog } from '@/features/stok/mutasi-dialog'
import { downloadFile } from '@/lib/download'
import { buildPdf } from '@/lib/export-pdf'
import { buildXlsx } from '@/lib/export-xlsx'
import { formatAngka, formatRupiah } from '@/lib/format'
import { todayISO } from '@/lib/date'
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
    render: (row) => <span className={row.stock < 0 ? 'text-bahaya' : undefined}>{formatAngka(row.stock)}</span>,
  },
  { key: 'need', label: 'Kebutuhan PO', align: 'right', render: (row) => (need(row) > 0 ? formatAngka(need(row)) : '—') },
  { key: 'price', label: 'Harga terakhir', align: 'right', render: (row) => (row.price === null ? '—' : formatRupiah(row.price)) },
]

const exportColumns = [
  { label: 'Barang', width: 44, pdf: 230, value: (row) => row.name },
  { label: 'Brand', width: 18, pdf: 90, value: (row) => row.brand },
  { label: 'Stok', width: 10, pdf: 50, type: 'number', align: 'right', value: (row) => row.stock },
  { label: 'Kebutuhan PO', width: 14, pdf: 70, type: 'number', align: 'right', value: need },
  { label: 'Harga terakhir', width: 16, pdf: 90, type: 'rupiah', align: 'right', value: (row) => row.price },
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

  function filterNote() {
    const parts = []
    if (brand) parts.push(`Brand: ${brand}`)
    if (query.trim()) parts.push(`Cari: "${query.trim()}"`)
    return parts.length ? parts.join(' · ') : 'Semua barang'
  }

  function exportExcel() {
    const bytes = buildXlsx({
      sheetName: 'Stok Barang',
      rows: filtered,
      columns: exportColumns.map((c) => ({ label: c.label, width: c.width, type: c.type, value: c.value })),
    })
    downloadFile(`stok-barang-${todayISO()}.xlsx`, bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }

  function exportPdf() {
    const bytes = buildPdf({
      title: 'Stok Barang',
      subtitle: `Dhouse Digital · ${todayISO()} · ${filterNote()}`,
      summary: [
        `${formatAngka(filtered.length)} barang · Total stok ${formatAngka(filtered.reduce((t, r) => t + Math.max(r.stock, 0), 0))} · ${formatAngka(filtered.filter((r) => r.stock < 0).length)} barang minus · Kebutuhan PO ${formatAngka(filtered.reduce((t, r) => t + need(r), 0))} unit`,
      ],
      footer: 'Dhouse Digital',
      rows: filtered,
      columns: exportColumns.map((c) => ({
        label: c.label,
        width: c.pdf,
        align: c.align,
        value: (row) => (c.type === 'rupiah' ? (row.price === null ? '-' : formatRupiah(row.price)) : c.type === 'number' ? String(c.value(row)) : c.value(row) ?? ''),
      })),
    })
    downloadFile(`stok-barang-${todayISO()}.pdf`, bytes, 'application/pdf')
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

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:grid-cols-4">
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

      <Card className="mt-6">
        <CardHeader
          title="Tabel Stok"
          description={data ? `${formatAngka(filtered.length)} dari ${formatAngka(items.length)} barang.` : undefined}
          action={
            <span className="inline-flex gap-2">
              <Button variant="outline" size="sm" onClick={exportExcel} disabled={filtered.length === 0}>
                <Download />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={exportPdf} disabled={filtered.length === 0}>
                <FileText />
                PDF
              </Button>
            </span>
          }
        />
        <div className="filter-bar">
          <div className="filter-grow relative">
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
      <DetailBarangDialog
        item={dialog?.kind === 'detail' ? dialog.item : null}
        onOpenChange={(open) => !open && setDialog(null)}
        onMutasi={(item) => setDialog({ kind: 'mutasi', item })}
        onUbah={(item) => setDialog({ kind: 'ubah', item })}
      />
      <MutasiDialog item={dialog?.kind === 'mutasi' ? dialog.item : null} onOpenChange={(open) => !open && setDialog(null)} onDone={reload} />
    </>
  )
}
