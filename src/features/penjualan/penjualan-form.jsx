import { useState } from 'react'
import { Info, Plus, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormMessage } from '@/components/ui/form-error'
import { PenjualanFields } from '@/features/penjualan/penjualan-fields'
import { useMutation } from '@/hooks/use-mutation'
import { formatAngka, formatRupiah } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { catatPenjualan } from '@/services/sales'
import { parseWhole, validateSale } from '@/lib/validation'

/** Perkiraan stok sebelum simpan. Angka resmi tetap dihitung database saat menyimpan. */
function StockInfo({ barang, qty, tanggal }) {
  const quiet = 'flex items-center gap-1.5 text-xs text-tinta-redup'
  if (!barang) {
    return (
      <p className={quiet}>
        <Info className="size-3.5 shrink-0" aria-hidden="true" />
        Stok yang kurang otomatis dicatat sebagai pre-order.
      </p>
    )
  }
  if (tanggal !== todayISO()) {
    return (
      <p className={quiet}>
        <Info className="size-3.5 shrink-0" aria-hidden="true" />
        Stok sekarang {formatAngka(barang.stock)}. Untuk tanggal lampau, database menghitung stok pada tanggal itu saat menyimpan.
      </p>
    )
  }
  const after = qty ? barang.stock - qty : null
  if (after !== null && after < 0) {
    return (
      <p className="flex items-center gap-1.5 rounded-lg bg-peringatan/10 px-2.5 py-1.5 text-xs text-peringatan" aria-live="polite">
        <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
        Stok sekarang {formatAngka(barang.stock)}, setelah penjualan {formatAngka(after)}. Kebutuhan PO {formatAngka(-after)} unit (stok akan minus).
      </p>
    )
  }
  return (
    <p className={quiet} aria-live="polite">
      <Info className="size-3.5 shrink-0" aria-hidden="true" />
      Stok sekarang {formatAngka(barang.stock)}
      {after !== null ? `, setelah penjualan ${formatAngka(after)}` : ''}.
    </p>
  )
}

const blank = () => ({ barangId: '', qty: '', harga: '', tanggal: todayISO() })

export function PenjualanForm({ items, onSaved }) {
  const [value, setValue] = useState(blank)
  const [error, setError] = useState('')
  const [fieldsReset, setFieldsReset] = useState(0)
  const save = useMutation(catatPenjualan)

  const barang = items.find((item) => String(item.id) === value.barangId)
  const qty = parseWhole(value.qty)
  const harga = parseWhole(value.harga)
  const subtotal = (qty ?? 0) * (harga ?? 0)

  async function handleSubmit(event) {
    event.preventDefault()
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <PenjualanFields key={fieldsReset} compact idPrefix="jual" items={items} value={value} onChange={setValue} disabled={save.pending}>
        <div className="col-span-2 flex min-w-0 flex-col items-stretch gap-2 @xl:col-span-5 @xl:flex-row @xl:items-end">
          <div className="flex h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg bg-garis-halus px-3 text-sm" aria-live="polite">
            <span className="text-xs text-tinta-redup">Subtotal</span>
            <span className="truncate font-semibold tabular-nums">{formatRupiah(subtotal)}</span>
          </div>
          <Button type="submit" className="h-11 w-full @xl:w-auto" disabled={save.pending}>
            <Plus />
            {save.pending ? 'Menyimpan…' : 'Catat Penjualan'}
          </Button>
        </div>
      </PenjualanFields>
      <StockInfo barang={barang} qty={qty} tanggal={value.tanggal} />
      <FormMessage>{error}</FormMessage>
    </form>
  )
}
