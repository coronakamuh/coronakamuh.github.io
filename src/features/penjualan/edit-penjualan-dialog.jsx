import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { FormMessage } from '@/components/ui/form-error'
import { PenjualanFields } from '@/features/penjualan/penjualan-fields'
import { useMutation } from '@/hooks/use-mutation'
import { formatAngka } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { parseWhole, validateSale } from '@/lib/validation'
import { editPenjualan, hapusPenjualan } from '@/services/sales'

export function EditPenjualanDialog({ sale, items, onOpenChange, onDone }) {
  const [value, setValue] = useState({ barangId: '', qty: '', harga: '', tanggal: '' })
  const [error, setError] = useState('')
  const save = useMutation(editPenjualan)
  const remove = useMutation(hapusPenjualan)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (sale) {
      setValue({ barangId: String(sale.barangId), qty: String(sale.qty), harga: String(sale.price), tanggal: sale.date })
      setError('')
      setConfirmDelete(false)
    }
  }, [sale])

  async function handleDelete() {
    setError('')
    try {
      await remove.run(sale.id)
      toast.success('Penjualan dihapus', { description: 'Stok barang telah dikembalikan.' })
      onOpenChange(false)
      onDone()
    } catch (failure) {
      setError(failure.message)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const barang = items.find((item) => String(item.id) === value.barangId)
    // Tanggal lama yang sudah lewat tetap boleh dipertahankan; yang baru tidak boleh di masa depan.
    const problem = validateSale({ ...value, barang }, todayISO())
    setError(problem ?? '')
    if (problem) return
    try {
      const result = await save.run({
        id: sale.id,
        barangId: barang.id,
        brand: barang.brand,
        qty: parseWhole(value.qty),
        harga: parseWhole(value.harga),
        tanggal: value.tanggal,
      })
      if (!result) return
      toast.success('Penjualan diperbarui', { description: barang.name })
      if (result.preorderSetelah > 0) {
        toast.warning('Stok kurang', { description: `${formatAngka(result.preorderSetelah)} unit tercatat sebagai pre-order (stok minus).` })
      }
      onOpenChange(false)
      onDone()
    } catch (failure) {
      setError(failure.message)
    }
  }

  return (
    <Modal
      open={Boolean(sale)}
      onOpenChange={onOpenChange}
      title="Ubah Penjualan"
      description="Mengubah penjualan juga mengubah catatan keluar di Riwayat dan stok barangnya."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <PenjualanFields idPrefix="ubah" items={items} value={value} onChange={setValue} disabled={save.pending} />
        <FormMessage>{error}</FormMessage>
        <Button type="submit" disabled={save.pending || remove.pending}>
          {save.pending ? 'Menyimpan…' : 'Simpan Perubahan'}
        </Button>
        {confirmDelete ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold">Hapus penjualan ini?</p>
            <p className="mt-1">Catatan penjualan dan transaksi stok terkait akan dihapus. Stok barang akan bertambah kembali.</p>
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="outline" disabled={remove.pending} onClick={() => setConfirmDelete(false)}>Batal</Button>
              <Button type="button" disabled={remove.pending} onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                <Trash2 size={16} />
                {remove.pending ? 'Menghapus…' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="outline" disabled={save.pending || remove.pending} onClick={() => setConfirmDelete(true)} className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700">
            <Trash2 size={16} />
            Hapus Penjualan
          </Button>
        )}
      </form>
    </Modal>
  )
}
