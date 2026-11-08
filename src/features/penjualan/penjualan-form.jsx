import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormMessage } from '@/components/ui/form-error'
import { PenjualanFields } from '@/features/penjualan/penjualan-fields'
import { useMutation } from '@/hooks/use-mutation'
import { formatAngka } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { parseWhole, validateSale } from '@/lib/validation'
import { catatPenjualan } from '@/services/sales'

/** Perkiraan stok sebelum simpan. Angka resmi tetap dihitung database saat menyimpan. */
function StockPreview({ barang, qty, tanggal }) {
  if (!barang) return null
  if (tanggal !== todayISO()) {
    return <p className="text-sm text-tinta-redup">Stok sekarang {formatAngka(barang.stock)}. Untuk tanggal lampau, database menghitung stok pada tanggal itu saat menyimpan.</p>
  }
  const after = qty ? barang.stock - qty : null
  return (
    <p className={`text-sm ${after !== null && after < 0 ? 'text-bahaya' : 'text-tinta-redup'}`} aria-live="polite">
      Stok sekarang {formatAngka(barang.stock)}
      {after !== null ? `, setelah penjualan ${formatAngka(after)}` : ''}
      {after !== null && after < 0 ? `. Kebutuhan PO ${formatAngka(-after)} unit (stok akan minus).` : '.'}
    </p>
  )
}

const blank = () => ({ barangId: '', qty: '', harga: '', tanggal: todayISO() })

export function PenjualanForm({ items, onSaved }) {
  const [value, setValue] = useState(blank)
  const [error, setError] = useState('')
  const [fieldsReset, setFieldsReset] = useState(0)
  const save = useMutation(catatPenjualan)

  async function handleSubmit(event) {
    event.preventDefault()
    const barang = items.find((item) => String(item.id) === value.barangId)
    const problem = validateSale({ ...value, barang }, todayISO())
    setError(problem ?? '')
    if (problem) return
    try {
      const result = await save.run({
        barangId: barang.id,
        brand: barang.brand,
        qty: parseWhole(value.qty),
        harga: parseWhole(value.harga),
        tanggal: value.tanggal,
      })
      if (!result) return
      toast.success('Penjualan tersimpan', { description: barang.name })
      if (result.preorderSetelah > 0) {
        toast.warning('Stok kurang', { description: `${formatAngka(result.preorderSetelah)} unit tercatat sebagai pre-order (stok minus).` })
      }
      setValue(blank())
      setFieldsReset((current) => current + 1)
      onSaved()
    } catch (failure) {
      setError(failure.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 pt-0 sm:p-5 sm:pt-0" noValidate>
      <PenjualanFields key={fieldsReset} idPrefix="jual" items={items} value={value} onChange={setValue} disabled={save.pending} />
      <StockPreview barang={items.find((item) => String(item.id) === value.barangId)} qty={parseWhole(value.qty)} tanggal={value.tanggal} />
      <FormMessage>{error}</FormMessage>
      <Button type="submit" disabled={save.pending}>
        <Save />
        {save.pending ? 'Menyimpan…' : 'Simpan Penjualan'}
      </Button>
    </form>
  )
}
