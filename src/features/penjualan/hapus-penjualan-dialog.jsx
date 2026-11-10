import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { FormMessage } from '@/components/ui/form-error'
import { useMutation } from '@/hooks/use-mutation'
import { formatAngka, formatRupiah } from '@/lib/format'
import { hapusPenjualan } from '@/services/sales'

/** Hapus cepat dari daftar. Memakai proses database yang sama dengan tombol hapus di jendela Ubah Penjualan. */
export function HapusPenjualanDialog({ sale, onOpenChange, onDone }) {
  const [error, setError] = useState('')
  const remove = useMutation(hapusPenjualan)

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

  return (
    <Modal
      open={Boolean(sale)}
      onOpenChange={(open) => {
        if (!open) setError('')
        onOpenChange(open)
      }}
      title="Hapus penjualan?"
      description="Catatan penjualan dan transaksi stok terkait akan dihapus. Stok barang bertambah kembali."
    >
      {sale ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-kertas px-3 py-2.5 text-sm">
            <p className="font-semibold break-words">{sale.item}</p>
            <p className="mt-1 text-xs text-tinta-redup tabular-nums">
              {sale.date.slice(8, 10)}/{sale.date.slice(5, 7)}/{sale.date.slice(0, 4)} · {formatAngka(sale.qty)} × {formatRupiah(sale.price)} = {formatRupiah(sale.total)}
            </p>
          </div>
          <FormMessage>{error}</FormMessage>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" disabled={remove.pending} onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="button" variant="danger" className="flex-1" disabled={remove.pending} onClick={handleDelete}>
              <Trash2 />
              {remove.pending ? 'Menghapus…' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
