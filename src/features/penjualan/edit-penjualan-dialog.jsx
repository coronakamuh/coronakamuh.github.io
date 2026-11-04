import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { FormMessage } from '@/components/ui/form-error'
import { PenjualanFields } from '@/features/penjualan/penjualan-fields'
import { useMutation } from '@/hooks/use-mutation'
import { formatAngka } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { parseWhole, validateSale } from '@/lib/validation'
import { editPenjualan } from '@/services/sales'

export function EditPenjualanDialog({ sale, items, onOpenChange, onDone }) {
  const [value, setValue] = useState({ barangId: '', qty: '', harga: '', tanggal: '' })
  const [error, setError] = useState('')
  const save = useMutation(editPenjualan)

  useEffect(() => {
    if (sale) {
      setValue({ barangId: String(sale.barangId), qty: String(sale.qty), harga: String(sale.price), tanggal: sale.date })
      setError('')
    }
  }, [sale])

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
        <Button type="submit" disabled={save.pending}>
          {save.pending ? 'Menyimpan…' : 'Simpan Perubahan'}
        </Button>
      </form>
    </Modal>
  )
}
