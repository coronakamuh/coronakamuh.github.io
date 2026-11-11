import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, History, Plus, RotateCcw, Search, X } from 'lucide-react'
import { PageTitle } from '@/components/layout/page-title'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { NamaBarang } from '@/components/ui/nama-barang'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/field'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { useAsync } from '@/hooks/use-async'
import { formatAngka } from '@/lib/format'
import { cn } from '@/lib/cn'
import { formatDisplay, monthNames, todayISO } from '@/lib/date'
import { DetailMutasiDialog } from '@/features/riwayat/detail-mutasi-dialog'
import { MutasiDialog } from '@/features/stok/mutasi-dialog'
import { usePencarianAwal } from '@/lib/pencarian-awal'
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
  { value: '', label: 'Semua' },
  { value: 'masuk', label: 'Masuk' },
  { value: 'terjual', label: 'Terjual' },
  { value: 'keluar', label: 'Keluar' },
  { value: 'koreksi', label: 'Koreksi' },
]

const toneOf = (label) => (label === 'Masuk' ? 'sukses' : label === 'Terjual' ? 'info' : label === 'Keluar' ? 'peringatan' : 'netral')

/** "2026-11-09" menjadi "9 Nov"; tahun ditambahkan bila bukan tahun ini. */
function shortDate(text) {
  const [year, month, day] = text.split('-').map(Number)
  return `${day} ${monthNames[month - 1].slice(0, 3)}${String(year) === todayISO().slice(0, 4) ? '' : ` ${year}`}`
}

export function RiwayatPage() {
  const PAGE_SIZE = usePageSize(DEFAULT_PAGE_SIZE)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [group, setGroup] = useState('')
  const [page, setPage] = useState(1)
  // Pencarian nama barang: `query` mengikuti ketikan, `search` dipakai untuk mengambil data (jeda 0,3 detik).
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  usePencarianAwal('riwayat', setQuery)
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])
  const { data, error, loading, reload } = useAsync(
    () => getMovementsPage({ page, pageSize: PAGE_SIZE, from, to, group, q: search }),
    [page, from, to, group, search, PAGE_SIZE],
  )
  const stock = useAsync(() => getStockData({ termasukArsip: true }), [])
  const [detailId, setDetailId] = useState(null)
  const [catat, setCatat] = useState(false)
  const columns = makeColumns(setDetailId)
  const waiting = loading && !data
  const filtering = Boolean(from || to || group || search)

  useEffect(() => setPage(1), [from, to, group, search])

  function resetFilters() {
    setFrom('')
    setTo('')
    setGroup('')
    setQuery('')
    setSearch('')
  }

  return (
    <div className="space-y-4">
      <PageTitle
        icon={History}
        title="Riwayat Transaksi"
        description="Telusuri pergerakan stok dan pantau setiap aktivitas transaksi dengan lebih mudah."
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
          action={
            filtering ? (
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                <X />
                Reset
              </Button>
            ) : null
          }
        />

        <div className="space-y-2 px-3 pb-3 sm:px-5">
          <div className="relative sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
            <Input id="cari-riwayat" type="text" autoComplete="off" aria-label="Cari barang" placeholder="Cari barang…" value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 pl-8" />
            {query ? (
              <button
                type="button"
                aria-label="Hapus pencarian"
                title="Hapus"
                onClick={() => setQuery('')}
                className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-tinta-redup transition-colors hover:bg-garis-halus hover:text-tinta"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:max-w-md">
            <DatePicker id="riwayat-dari" aria-label="Dari tanggal" placeholder="Dari tanggal" value={from} onChange={setFrom} max={to || undefined} />
            <DatePicker id="riwayat-sampai" aria-label="Sampai tanggal" placeholder="Sampai tanggal" value={to} onChange={setTo} min={from || undefined} />
          </div>
          <div role="radiogroup" aria-label="Jenis transaksi" className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {typeOptions.map((option) => {
              const active = group === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setGroup(option.value)}
                  className={cn(
                    'h-8 shrink-0 rounded-full border px-3.5 text-xs font-semibold transition-colors',
                    active ? 'border-tombol bg-tombol text-white' : 'border-garis bg-lembar text-tinta-redup hover:bg-garis-halus hover:text-tinta',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
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
          mobileCards
          mobileRow={(row) => (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <button type="button" className="min-w-0 text-left text-[13px] leading-snug font-semibold break-words" onClick={() => setDetailId(row.id)}>
                  <NamaBarang name={row.item} />
                </button>
                <span className={cn('shrink-0 text-sm font-bold tabular-nums', row.delta < 0 ? 'text-bahaya' : 'text-sukses')}>
                  {row.delta > 0 ? '+' : ''}
                  {formatAngka(row.delta)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-tinta-redup">
                <Badge tone={toneOf(row.label)} className="rounded-md px-1.5 text-[11px] font-semibold">
                  {row.label}
                </Badge>
                {row.note !== '—' ? <span>{row.note.replace('Penjualan ', '')}</span> : null}
                <span className="ml-auto">{shortDate(row.date)}</span>
              </div>
            </>
          )}
          empty={{
            icon: History,
            title: waiting ? 'Memuat data' : filtering ? 'Tidak ada riwayat yang cocok' : 'Belum ada riwayat',
            description: waiting ? '' : filtering ? 'Ubah kata pencarian, tanggal, atau jenis transaksi.' : 'Barang masuk dan keluar akan tercatat di sini.',
          }}
        />
        <Pager page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setPage} />
      </Card>

      <DetailMutasiDialog id={detailId} onOpenChange={(open) => !open && setDetailId(null)} />
      <MutasiDialog
        open={catat}
        items={stock.data?.items.filter((item) => !item.archived)}
        onOpenChange={setCatat}
        onDone={() => {
          reload()
          stock.reload()
        }}
      />
    </div>
  )
}
