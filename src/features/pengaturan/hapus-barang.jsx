import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { controlClass, Input } from '@/components/ui/field'
import { FormMessage } from '@/components/ui/form-error'
import { useAsync } from '@/hooks/use-async'
import { useMutation } from '@/hooks/use-mutation'
import { SettingRow } from '@/features/pengaturan/setting-ui'
import { hapusBarang } from '@/services/items'
import { getRiwayatBarang, getStockData } from '@/services/queries'

const MAKS = 200
const AMBANG_KONFIRMASI = 10

async function muat() {
  const [stok, riwayat] = await Promise.all([getStockData(), getRiwayatBarang()])
  const items = stok.items.map((item) => ({ ...item, riwayat: riwayat.get(item.id) ?? null }))
  return { items, brandNames: stok.brandNames }
}

/** Baris pengaturan untuk membuka dialog hapus barang. */
export function HapusBarang() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <SettingRow label="Hapus barang" hint="Hapus barang yang belum punya penjualan maupun mutasi, bisa banyak sekaligus.">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Trash2 />
          Buka
        </Button>
      </SettingRow>
      {open ? <HapusBarangDialog open={open} onOpenChange={setOpen} /> : null}
    </>
  )
}

function HapusBarangDialog({ open, onOpenChange }) {
  const { data, error, loading, reload } = useAsync(muat, [])
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('')
  const [stokFilter, setStokFilter] = useState('semua')
  const [urut, setUrut] = useState('nama')
  const [tampilBerriwayat, setTampilBerriwayat] = useState(false)
  const [dipilih, setDipilih] = useState(() => new Set())
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [ketik, setKetik] = useState('')
  const [pesan, setPesan] = useState('')
  const { run, pending } = useMutation(hapusBarang)

  const hasil = useMemo(() => {
    if (!data) return []
    const kata = q.trim().toLowerCase()
    let rows = data.items.filter((item) => {
      if (!tampilBerriwayat && item.riwayat) return false
      if (kata && !item.name.toLowerCase().includes(kata)) return false
      if (brand && item.brand !== brand) return false
      if (stokFilter === 'nol' && item.stock !== 0) return false
      if (stokFilter === 'ada' && !(item.stock > 0)) return false
      return true
    })
    if (urut === 'stok') rows = [...rows].sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name))
    return rows
  }, [data, q, brand, stokFilter, urut, tampilBerriwayat])

  const bisaDipilih = hasil.filter((item) => !item.riwayat)
  const terpilih = data ? data.items.filter((item) => dipilih.has(item.id)) : []
  const totalStok = terpilih.reduce((sum, item) => sum + (item.stock > 0 ? item.stock : 0), 0)
  const semuaDipilih = bisaDipilih.length > 0 && bisaDipilih.every((item) => dipilih.has(item.id))
  const perluKetik = terpilih.length > AMBANG_KONFIRMASI

  function toggle(id) {
    setPesan('')
    setDipilih((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSemua() {
    setPesan('')
    setDipilih((prev) => {
      const next = new Set(prev)
      if (semuaDipilih) bisaDipilih.forEach((item) => next.delete(item.id))
      else bisaDipilih.forEach((item) => next.add(item.id))
      return next
    })
  }

  function mulaiHapus() {
    if (terpilih.length > MAKS) return setPesan(`Maksimal ${MAKS} barang sekali hapus. Kurangi pilihan.`)
    setPesan('')
    setKetik('')
    setKonfirmasi(true)
  }

  async function eksekusi() {
    try {
      const n = await run(terpilih.map((item) => item.id))
      toast.success(`${n} barang dihapus`)
      setDipilih(new Set())
      setKonfirmasi(false)
      reload()
    } catch (failure) {
      setKonfirmasi(false)
      setPesan(failure.message)
      reload()
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} wide title="Hapus barang" description="Hanya barang tanpa penjualan dan mutasi yang bisa dihapus. Data tidak bisa dikembalikan.">
      {konfirmasi ? (
        <div className="space-y-3">
          <FormMessage>
            Hapus {terpilih.length} barang secara permanen? Total stok awal yang ikut hilang: {totalStok}.
          </FormMessage>
          {perluKetik ? (
            <Input aria-label="Ketik HAPUS" placeholder="Ketik HAPUS untuk lanjut" value={ketik} onChange={(event) => setKetik(event.target.value)} />
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setKonfirmasi(false)} disabled={pending}>
              Batal
            </Button>
            <Button onClick={eksekusi} disabled={pending || (perluKetik && ketik.trim() !== 'HAPUS')} className="bg-bahaya text-white hover:bg-bahaya/90">
              {pending ? 'Menghapus…' : `Hapus ${terpilih.length} barang`}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <Input aria-label="Cari nama barang" placeholder="Cari nama…" value={q} onChange={(event) => setQ(event.target.value)} className="sm:col-span-2" />
            <select aria-label="Brand" value={brand} onChange={(event) => setBrand(event.target.value)} className={controlClass}>
              <option value="">Semua brand</option>
              {data?.brandNames.map((nama) => (
                <option key={nama} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
            <select aria-label="Stok" value={stokFilter} onChange={(event) => setStokFilter(event.target.value)} className={controlClass}>
              <option value="semua">Semua stok</option>
              <option value="nol">Stok 0</option>
              <option value="ada">Stok &gt; 0</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={tampilBerriwayat} onChange={(event) => setTampilBerriwayat(event.target.checked)} />
              Tampilkan juga barang berriwayat
            </label>
            <select aria-label="Urutkan" value={urut} onChange={(event) => setUrut(event.target.value)} className={`${controlClass} w-auto`}>
              <option value="nama">Urut nama</option>
              <option value="stok">Urut stok</option>
            </select>
          </div>

          {error ? (
            <FormMessage>{error.message}</FormMessage>
          ) : loading ? (
            <p className="py-6 text-center text-sm text-tinta-redup">Memuat…</p>
          ) : hasil.length === 0 ? (
            <EmptyState title="Tidak ada barang" description="Tidak ada barang yang cocok dan boleh dihapus." />
          ) : (
            <>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={semuaDipilih} onChange={toggleSemua} disabled={bisaDipilih.length === 0} />
                Pilih semua hasil ({bisaDipilih.length})
              </label>
              <ul className="max-h-72 divide-y divide-garis-halus overflow-y-auto rounded-lg border border-garis">
                {hasil.slice(0, 300).map((item) => (
                  <li key={item.id}>
                    <label className={`flex min-h-10 items-center gap-2.5 px-3 py-1.5 text-sm ${item.riwayat ? 'opacity-50' : 'cursor-pointer hover:bg-garis-halus/60'}`}>
                      <input type="checkbox" checked={dipilih.has(item.id)} disabled={Boolean(item.riwayat)} onChange={() => toggle(item.id)} />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <span className="shrink-0 text-xs text-tinta-redup">{item.brand}</span>
                      <span className="w-8 shrink-0 text-right text-xs tabular-nums">{item.stock}</span>
                      {item.riwayat ? (
                        <Badge tone="peringatan">
                          {item.riwayat.penjualan} penjualan · {item.riwayat.mutasi} mutasi
                        </Badge>
                      ) : null}
                    </label>
                  </li>
                ))}
              </ul>
              {hasil.length > 300 ? <p className="text-xs text-tinta-redup">Menampilkan 300 pertama. Persempit dengan pencarian; “Pilih semua” tetap mencakup semua hasil.</p> : null}
            </>
          )}

          {pesan ? <FormMessage>{pesan}</FormMessage> : null}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-tinta-redup">{terpilih.length} dipilih</span>
            <Button onClick={mulaiHapus} disabled={terpilih.length === 0} className="bg-bahaya text-white hover:bg-bahaya/90">
              <Trash2 />
              Hapus {terpilih.length} barang
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
