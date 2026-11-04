import { useMemo } from 'react'
import { Combobox } from '@/components/ui/combobox'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, Input } from '@/components/ui/field'
import { formatAngka, formatRupiah } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { parseWhole } from '@/lib/validation'

/** Isian yang sama untuk catat dan ubah penjualan. value: { barangId, qty, harga, tanggal } (teks). */
export function PenjualanFields({ idPrefix, items, value, onChange, disabled }) {
  const options = useMemo(
    () => items.map((item) => ({ value: String(item.id), label: item.name, hint: `${item.brand} · stok ${formatAngka(item.stock)}` })),
    [items],
  )
  const q = parseWhole(value.qty)
  const h = parseWhole(value.harga)

  function pickItem(next) {
    const item = items.find((entry) => String(entry.id) === next)
    // Harga awal = harga jual terakhir barang itu; tetap bisa diubah.
    onChange({ ...value, barangId: next, harga: item?.price != null ? String(item.price) : value.harga })
  }

  return (
    <>
      <Field label="Tanggal" htmlFor={`${idPrefix}-tanggal`}>
        <DatePicker id={`${idPrefix}-tanggal`} value={value.tanggal} onChange={(tanggal) => onChange({ ...value, tanggal })} max={todayISO()} disabled={disabled} />
      </Field>
      <Field label="Barang" htmlFor={`${idPrefix}-barang`}>
        <Combobox id={`${idPrefix}-barang`} value={value.barangId} onValueChange={pickItem} options={options} placeholder="Pilih barang" searchLabel="Cari barang" disabled={disabled} />
      </Field>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <Field label="Jumlah" htmlFor={`${idPrefix}-qty`}>
          <Input id={`${idPrefix}-qty`} inputMode="numeric" placeholder="0" value={value.qty} onChange={(event) => onChange({ ...value, qty: event.target.value })} disabled={disabled} />
        </Field>
        <Field label="Harga satuan" htmlFor={`${idPrefix}-harga`}>
          <Input id={`${idPrefix}-harga`} inputMode="numeric" placeholder="0" value={value.harga} onChange={(event) => onChange({ ...value, harga: event.target.value })} disabled={disabled} />
        </Field>
      </div>
      {q !== null && h !== null ? (
        <p className="text-sm" aria-live="polite">
          Total: <strong>{formatRupiah(q * h)}</strong>
        </p>
      ) : null}
    </>
  )
}
