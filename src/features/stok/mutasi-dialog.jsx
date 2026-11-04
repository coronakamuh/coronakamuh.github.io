import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, Input } from '@/components/ui/field'
import { FormMessage } from '@/components/ui/form-error'
import { Segmented } from '@/components/ui/segmented'
import { useAsync } from '@/hooks/use-async'
import { useMutation } from '@/hooks/use-mutation'
import { formatAngka } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { parseWhole, validateMovement } from '@/lib/validation'
import { catatMutasi } from '@/services/movements'
import { getStockAsOf } from '@/services/stock'

const modes = [
  { value: 'masuk', label: 'Masuk' },
  { value: 'keluar', label: 'Keluar' },
  { value: 'adjust', label: 'Adjust' },
]

/** Barang masuk, keluar, dan adjust untuk satu barang. Stok sistem dihitung ulang tiap tanggal berubah. */
export function MutasiDialog({ item, onOpenChange, onDone }) {
  const [mode, setMode] = useState('masuk')
  const [tanggal, setTanggal] = useState(todayISO())
  const [qty, setQty] = useState('')
  const [error, setError] = useState('')
  const stock = useAsync(() => (item ? getStockAsOf(item.id, tanggal) : Promise.resolve(null)), [item?.id, tanggal])
  const save = useMutation(catatMutasi)

  useEffect(() => {
    if (item) {
      setMode('masuk')
      setTanggal(todayISO())
      setQty('')
      setError('')
    }
  }, [item?.id])

  const current = stock.data
  const q = parseWhole(qty)
  const after =
    current === null || q === null ? null : mode === 'masuk' ? current + q : mode === 'keluar' ? current - q : q
  const delta = mode === 'adjust' && after !== null ? after - current : null

  async function handleSubmit(event) {
    event.preventDefault()
    if (stock.loading || current === null) return
    const problem = validateMovement({ mode, qty, tanggal, stock: current }, todayISO())
    setError(problem ?? '')
    if (problem) return
    try {
      const result = await save.run({ barangId: item.id, tanggal, mode, qty: q, expectedStock: current })
      if (!result) return
      toast.success('Tersimpan', { description: `${item.name}: stok ${formatAngka(result.stokSebelum)} menjadi ${formatAngka(result.stokSetelah)}.` })
      onOpenChange(false)
      onDone()
    } catch (failure) {
      setError(failure.message)
      if (failure.code === 'stale') stock.reload()
    }
  }

  return (
    <Modal
      open={Boolean(item)}
      onOpenChange={onOpenChange}
      title="Catat Mutasi Stok"
      description={item ? `${item.name} (${item.brand})` : ''}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Segmented label="Jenis mutasi" value={mode} onValueChange={(next) => { setMode(next); setError('') }} options={modes} />
        <Field label="Tanggal" htmlFor="mutasi-tanggal">
          <DatePicker id="mutasi-tanggal" value={tanggal} onChange={setTanggal} max={todayISO()} />
        </Field>
        <p className="text-sm text-tinta-redup" aria-live="polite">
          Stok sistem pada tanggal ini: <strong className="text-tinta">{stock.loading && current === null ? 'memuat…' : current === null ? '—' : formatAngka(current)}</strong>
        </p>
        <Field label={mode === 'adjust' ? 'Stok sebenarnya (hasil hitung fisik)' : 'Jumlah'} htmlFor="mutasi-qty">
          <Input id="mutasi-qty" inputMode="numeric" placeholder="0" value={qty} onChange={(event) => setQty(event.target.value)} />
        </Field>
        {after !== null ? (
          <p className="text-sm" aria-live="polite">
            {mode === 'adjust' ? `Selisih ${delta > 0 ? '+' : ''}${formatAngka(delta)}. ` : ''}Stok setelah disimpan: <strong>{formatAngka(after)}</strong>
          </p>
        ) : null}
        {after !== null && after < 0 ? <FormMessage tone="warning">Stok akan minus {formatAngka(Math.abs(after))}. Ini dihitung sebagai kekurangan pre-order (PO).</FormMessage> : null}
        {stock.error ? <FormMessage>Stok belum bisa dimuat. {stock.error.message}</FormMessage> : null}
        <FormMessage>{error}</FormMessage>
        <Button type="submit" disabled={save.pending || stock.loading || current === null}>
          {save.pending ? 'Menyimpan…' : 'Simpan'}
        </Button>
      </form>
    </Modal>
  )
}
