import { useMemo, useState } from 'react'
import { Archive } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { controlClass, Input } from '@/components/ui/field'
import { FormMessage } from '@/components/ui/form-error'
import { Segmented } from '@/components/ui/segmented'
import { useAsync } from '@/hooks/use-async'
import { useMutation } from '@/hooks/use-mutation'
import { SettingRow } from '@/features/pengaturan/setting-ui'
import { arsipkanBarang } from '@/services/items'
import { getStockData } from '@/services/queries'

const MODE = [
  { value: 'arsip', label: 'Arsipkan' },
  { value: 'kembali', label: 'Sudah diarsip' },
]

/** Baris pengaturan untuk membuka dialog arsip barang. */
export function ArsipBarang() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <SettingRow label="Arsipkan barang" hint="Sembunyikan barang yang tidak dipakai lagi. Riwayat penjualan dan mutasi tetap utuh, dan bisa dikembalikan kapan saja.">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Archive />
          Buka
        </Button>
      </SettingRow>
      {open ? <ArsipBarangDialog open={open} onOpenChange={setOpen} /> : null}
    </>
  )
}

function ArsipBarangDialog({ open, onOpenChange }) {
  const { data, error, loading, reload } = useAsync(() => getStockData({ termasukArsip: true }), [])
  const [mode, setMode] = useState('arsip')
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('')
  const [dipilih, setDipilih] = useState(() => new Set())
  const [pesan, setPesan] = useState('')
  const { run, pending } = useMutation(arsipkanBarang)

  const hasil = useMemo(() => {
    if (!data) return []
    const kata = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return data.items.filter((item) => {
      if (item.archived !== (mode === 'kembali')) return false
      if (brand && item.brand !== brand) return false
      const hay = item.name.toLowerCase()
      return kata.every((k) => hay.includes(k))
    })
  }, [data, q, brand, mode])

  const semuaDipilih = hasil.length > 0 && hasil.every((item) => dipilih.has(item.id))
  const jumlah = hasil.filter((item) => dipilih.has(item.id)).length

  function ganti(next) {
    setMode(next)
    setDipilih(new Set())
    setPesan('')
  }

  function toggle(id) {
    setDipilih((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSemua() {
    setDipilih((prev) => {
      const next = new Set(prev)
      if (semuaDipilih) hasil.forEach((item) => next.delete(item.id))
      else hasil.forEach((item) => next.add(item.id))
      return next
    })
  }

  async function eksekusi() {
    const ids = hasil.filter((item) => dipilih.has(item.id)).map((item) => item.id)
    try {
      const n = await run(ids, mode === 'arsip')
      toast.success(mode === 'arsip' ? `${n} barang diarsipkan` : `${n} barang dikembalikan`)
      setDipilih(new Set())
      setPesan('')
      reload()
    } catch (failure) {
      setPesan(failure.message)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} wide title="Arsipkan barang" description="Barang arsip tidak muncul di daftar Stok dan pilihan penjualan, tapi riwayatnya tetap ada.">
      <div className="space-y-3">
        <Segmented label="Mode" value={mode} onValueChange={ganti} options={MODE} />
        <div className="grid gap-2 sm:grid-cols-3">
          <Input aria-label="Cari nama barang" placeholder="Cari nama, mis. bak mandi" value={q} onChange={(event) => setQ(event.target.value)} className="sm:col-span-2" />
          <select aria-label="Brand" value={brand} onChange={(event) => setBrand(event.target.value)} className={controlClass}>
            <option value="">Semua brand</option>
            {data?.brandNames.map((nama) => (
              <option key={nama} value={nama}>
                {nama}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <FormMessage>{error.message}</FormMessage>
        ) : loading && !data ? (
          <p className="py-6 text-center text-sm text-tinta-redup">Memuat…</p>
        ) : hasil.length === 0 ? (
          <EmptyState title={mode === 'arsip' ? 'Tidak ada barang' : 'Belum ada barang diarsip'} description="Tidak ada barang yang cocok." />
        ) : (
          <>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={semuaDipilih} onChange={toggleSemua} />
              Pilih semua hasil ({hasil.length})
            </label>
            <ul className="max-h-72 divide-y divide-garis-halus overflow-y-auto rounded-lg border border-garis">
              {hasil.slice(0, 300).map((item) => (
                <li key={item.id}>
                  <label className="flex min-h-10 cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-garis-halus/60">
                    <input type="checkbox" checked={dipilih.has(item.id)} onChange={() => toggle(item.id)} />
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <span className="shrink-0 text-xs text-tinta-redup">{item.brand}</span>
                    <span className="w-8 shrink-0 text-right text-xs tabular-nums">{item.stock}</span>
                  </label>
                </li>
              ))}
            </ul>
            {hasil.length > 300 ? <p className="text-xs text-tinta-redup">Menampilkan 300 pertama. “Pilih semua” tetap mencakup semua hasil.</p> : null}
          </>
        )}

        {pesan ? <FormMessage>{pesan}</FormMessage> : null}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-tinta-redup">{jumlah} dipilih</span>
          <Button onClick={eksekusi} disabled={jumlah === 0 || pending}>
            <Archive />
            {pending ? 'Memproses…' : mode === 'arsip' ? `Arsipkan ${jumlah} barang` : `Kembalikan ${jumlah} barang`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
