import { Input } from '@/components/ui/field'

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
export function MoneyInput({ value, onChange, ...props }) {
  return (
    <Input
      {...props}
      inputMode="numeric"
      autoComplete="off"
      value={groupDigits(value)}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''))}
    />
  )
}
