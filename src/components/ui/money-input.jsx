import { X } from 'lucide-react'
import { Input } from '@/components/ui/field'
import { cn } from '@/lib/cn'

const grouped = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

/** Teks angka polos ("1250000") menjadi tampilan berpemisah ribuan ("1.250.000"). */
export function groupDigits(text) {
  const digits = String(text ?? '').replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  return digits === '' ? '' : grouped.format(Number(digits)).replace(/[^\d.]/g, '')
}

/**
 * Isian nominal uang: tampil 1.000, tetapi value/onChange tetap berupa digit polos ("1000"),
 * sehingga validasi dan penyimpanan tidak berubah.
 */
export function MoneyInput({ value, onChange, clearable = false, className, disabled, ...props }) {
  const input = (
    <Input
      {...props}
      disabled={disabled}
      inputMode="numeric"
      autoComplete="off"
      value={groupDigits(value)}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''))}
      className={cn(className, clearable && 'pr-9')}
    />
  )
  if (!clearable) return input
  return (
    <div className="relative">
      {input}
      {value && !disabled ? (
        <button
          type="button"
          aria-label="Hapus harga"
          title="Hapus"
          onClick={() => {
            onChange('')
            if (props.id) document.getElementById(props.id)?.focus()
          }}
          className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-tinta-redup transition-colors hover:bg-garis-halus hover:text-tinta"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
