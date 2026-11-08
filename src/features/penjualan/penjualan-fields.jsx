import { useEffect, useMemo, useState } from 'react'
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
  const selected = options.find((option) => option.value === value.barangId)
  const [barangQuery, setBarangQuery] = useState(selected?.label ?? '')
  const matches = useMemo(() => {
    const needle = barangQuery.trim().toLocaleLowerCase('id')
    return needle ? options.filter((option) => option.label.toLocaleLowerCase('id').includes(needle)).slice(0, 50) : []
  }, [options, barangQuery])
  useEffect(() => {
    if (selected) setBarangQuery(selected.label)
  }, [value.barangId, items])
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
        <div className="relative">
          <Input id={`${idPrefix}-barang`} type="text" autoComplete="off" placeholder="Ketik nama barang…" value={barangQuery}
            onChange={(event) => { setBarangQuery(event.target.value); if (value.barangId) onChange({ ...value, barangId: '' }) }}
            disabled={disabled} role="combobox" aria-autocomplete="list" aria-expanded={matches.length > 0} aria-controls={`${idPrefix}-barang-list`} />
          {matches.length > 0 ? (
            <ul id={`${idPrefix}-barang-list`} role="listbox" className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-garis bg-lembar p-1 shadow-lg">
              {matches.map((option) => (
                <li key={option.value} role="option" aria-selected={false}>
                  <button type="button" className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-garis-halus" onClick={() => pickItem(option.value)}>
                    <span className="min-w-0 truncate">{option.label}</span><span className="shrink-0 text-xs text-tinta-redup">{option.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
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
