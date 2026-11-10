import { useMemo, useState } from 'react'
import { Boxes, History, Search, ShoppingCart } from 'lucide-react'
import { Modal } from '@/components/ui/dialog'
import { Input } from '@/components/ui/field'
import { NamaBarang } from '@/components/ui/nama-barang'
import { useAsync } from '@/hooks/use-async'
import { formatAngka } from '@/lib/format'
import { kirimPencarian } from '@/lib/pencarian-awal'
import { getStockData } from '@/services/queries'

const MAX_ITEMS = 8

/** Isi jendela pencarian; dipasang hanya saat jendela terbuka sehingga data barang baru dimuat saat dibutuhkan. */
function Isi({ onClose }) {
  const stock = useAsync(getStockData, [])
  const [text, setText] = useState('')
  const q = text.trim()

  const matches = useMemo(() => {
    if (!q || !stock.data) return []
    const words = q.toLowerCase().split(/\s+/)
    return stock.data.items.filter((item) => {
      const hay = `${item.name} ${item.brand}`.toLowerCase()
      return words.every((word) => hay.includes(word))
    })
  }, [q, stock.data])

  function go(page, value) {
    onClose()
    kirimPencarian(page, value)
  }

  const rowClass = 'flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-garis-halus focus-visible:bg-garis-halus focus-visible:outline-none'

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-redup" aria-hidden="true" />
        <Input
          autoFocus
          type="search"
          autoComplete="off"
          aria-label="Cari di seluruh aplikasi"
          placeholder="Ketik nama barang atau brand…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="h-11 pl-9"
        />
      </div>

      {!q ? (
        <p className="px-1 text-xs text-tinta-redup">Cari barang, lalu buka di Stok, atau lihat penjualan dan riwayat mutasinya.</p>
      ) : (
        <>
          <section aria-label="Barang">
            <h3 className="mb-1 px-1 text-[11px] font-bold tracking-wide text-tinta-redup uppercase">Barang{stock.data ? ` (${matches.length})` : ''}</h3>
            {stock.error ? <p className="px-1 text-sm text-bahaya">Data barang gagal dimuat.</p> : null}
            {!stock.data && !stock.error ? <p className="px-1 text-sm text-tinta-redup">Memuat data…</p> : null}
            {stock.data && matches.length === 0 ? <p className="px-1 text-sm text-tinta-redup">Tidak ada barang yang cocok.</p> : null}
            <ul>
              {matches.slice(0, MAX_ITEMS).map((item) => (
                <li key={item.id}>
                  <button type="button" className={rowClass} onClick={() => go('stok', item.name)}>
                    <Boxes className="size-4 shrink-0 text-tinta-redup" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block break-words font-medium"><NamaBarang name={item.name} /></span>
                      <span className="block truncate text-[11px] text-tinta-redup">{item.brand}</span>
                    </span>
                    <span className={`shrink-0 text-xs tabular-nums ${item.stock < 0 ? 'text-bahaya' : 'text-tinta-redup'}`}>Stok {formatAngka(item.stock)}</span>
                  </button>
                </li>
              ))}
            </ul>
            {matches.length > MAX_ITEMS ? <p className="px-1 pt-1 text-[11px] text-tinta-redup">Menampilkan {MAX_ITEMS} dari {matches.length}. Persempit kata pencarian.</p> : null}
          </section>

          <section aria-label="Cari di halaman lain" className="border-t border-garis-halus pt-2">
            <h3 className="mb-1 px-1 text-[11px] font-bold tracking-wide text-tinta-redup uppercase">Cari “{q}” di</h3>
            <button type="button" className={rowClass} onClick={() => go('stok', q)}>
              <Boxes className="size-4 shrink-0 text-tinta-redup" aria-hidden="true" />
              Stok barang
            </button>
            <button type="button" className={rowClass} onClick={() => go('penjualan', q)}>
              <ShoppingCart className="size-4 shrink-0 text-tinta-redup" aria-hidden="true" />
              Penjualan
            </button>
            <button type="button" className={rowClass} onClick={() => go('riwayat', q)}>
              <History className="size-4 shrink-0 text-tinta-redup" aria-hidden="true" />
              Riwayat mutasi
            </button>
          </section>
        </>
      )}
    </div>
  )
}

export function PencarianGlobal({ open, onOpenChange }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Cari" description="Pencarian cepat di seluruh aplikasi">
      <Isi onClose={() => onOpenChange(false)} />
    </Modal>
  )
}
