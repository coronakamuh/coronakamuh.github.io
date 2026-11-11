import { useEffect, useMemo, useState } from 'react'
import { Calendar, Hash, Package, Tag, X } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, Input } from '@/components/ui/field'
import { MoneyInput } from '@/components/ui/money-input'
import { cn } from '@/lib/cn'
import { formatAngka, formatRupiah } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { parseWhole } from '@/lib/validation'

/** Label kecil beserta ikon, untuk tampilan ringkas. */
function CompactField({ icon: Icon, label, htmlFor, className, children }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-xs font-medium text-tinta-redup">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </label>
      {children}
    </div>
  )
}

/**
 * Isian yang sama untuk catat dan ubah penjualan. value: { barangId, qty, harga, tanggal } (teks).
 * compact: tata letak satu kartu yang ringkas (dipakai di halaman Penjualan). `children` ditaruh
 * di akhir grid ringkas (subtotal dan tombol simpan). Tanpa compact: tumpuk satu kolom (dipakai di dialog ubah).
 */
export function PenjualanFields({ idPrefix, items, value, onChange, disabled, compact = false, children }) {
  const options = useMemo(
    () => items.map((item) => ({ value: String(item.id), label: item.name, hint: `${item.brand} · stok ${formatAngka(item.stock)}` })),
    [items],
  )
  const selected = options.find((option) => option.value === value.barangId)
  const [barangQuery, setBarangQuery] = useState(selected?.label ?? '')
  const [showMatches, setShowMatches] = useState(false)
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
    if (item) setBarangQuery(item.name)
    setShowMatches(false)
    onChange({ ...value, barangId: next, harga: item?.price != null ? String(item.price) : value.harga })
  }

  const tanggalControl = (
    <DatePicker id={`${idPrefix}-tanggal`} value={value.tanggal} onChange={(tanggal) => onChange({ ...value, tanggal })} max={todayISO()} disabled={disabled} />
  )

  const barangControl = (
    <div className="static @xl:relative">
      <div className="relative">
        <Input id={`${idPrefix}-barang`} type="text" autoComplete="off" placeholder="Ketik nama barang…" value={barangQuery}
          onChange={(event) => { setBarangQuery(event.target.value); setShowMatches(true); if (value.barangId) onChange({ ...value, barangId: '' }) }}
          disabled={disabled} role="combobox" aria-autocomplete="list" aria-expanded={showMatches && matches.length > 0} aria-controls={`${idPrefix}-barang-list`} className="pr-9" />
        {barangQuery && !disabled ? (
          <button
            type="button"
            aria-label="Hapus nama barang"
            title="Hapus"
            onClick={() => {
              setBarangQuery('')
              setShowMatches(false)
              if (value.barangId) onChange({ ...value, barangId: '' })
              document.getElementById(`${idPrefix}-barang`)?.focus()
            }}
            className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-tinta-redup transition-colors hover:bg-garis-halus hover:text-tinta"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {showMatches && matches.length > 0 ? (
        <ul id={`${idPrefix}-barang-list`} role="listbox" className="absolute left-0 z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-garis bg-lembar p-1 shadow-pop">
          {matches.map((option) => (
            <li key={option.value} role="option" aria-selected={false}>
              <button type="button" className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-garis-halus" onClick={() => pickItem(option.value)}>
                <span className="min-w-0 truncate">{option.label}</span><span className="shrink-0 text-xs text-tinta-redup">{option.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )

  const qtyControl = (
    <Input id={`${idPrefix}-qty`} inputMode="numeric" placeholder="0" value={value.qty} onChange={(event) => onChange({ ...value, qty: event.target.value })} disabled={disabled} />
  )

  if (compact) {
    // Lebar ditentukan oleh lebar kartunya (container query), bukan lebar layar: aman bila ada sidebar.
    return (
      <div className="@container relative">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 gap-y-3 @xl:grid-cols-12 [&_button[id]]:h-10 [&_input]:h-11">
          <CompactField icon={Calendar} label="Tanggal penjualan" htmlFor={`${idPrefix}-tanggal`} className="col-span-1 @xl:col-span-3">
            {tanggalControl}
          </CompactField>
          <CompactField icon={Package} label="Nama barang" htmlFor={`${idPrefix}-barang`} className="col-span-1 @xl:col-span-9">
            {barangControl}
          </CompactField>
          <CompactField icon={Hash} label="Jumlah barang" htmlFor={`${idPrefix}-qty`} className="col-span-1 @xl:col-span-3">
            {qtyControl}
          </CompactField>
          <CompactField icon={Tag} label="Harga per unit" htmlFor={`${idPrefix}-harga`} className="col-span-1 @xl:col-span-4">
            <MoneyInput clearable prefix="Rp" id={`${idPrefix}-harga`} placeholder="0" value={value.harga} onChange={(harga) => onChange({ ...value, harga })} disabled={disabled} className="h-11" />
          </CompactField>
          {children}
        </div>
      </div>
    )
  }

  return (
    <>
      <Field label="Tanggal" htmlFor={`${idPrefix}-tanggal`}>
        {tanggalControl}
      </Field>
      <Field label="Barang" htmlFor={`${idPrefix}-barang`}>
        {barangControl}
      </Field>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <Field label="Jumlah" htmlFor={`${idPrefix}-qty`}>
          {qtyControl}
        </Field>
        <Field label="Harga satuan" htmlFor={`${idPrefix}-harga`}>
          <MoneyInput clearable prefix="Rp" id={`${idPrefix}-harga`} placeholder="0" value={value.harga} onChange={(harga) => onChange({ ...value, harga })} disabled={disabled} />
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
