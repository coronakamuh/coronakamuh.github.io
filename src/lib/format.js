const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const angka = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

export const formatRupiah = (value) => rupiah.format(Number(value) || 0).replace(/\s/g, ' ')
export const formatAngka = (value) => angka.format(Number(value) || 0)

/** Ringkas untuk label grafik: 1.250.000 menjadi "1,3jt", 45.000 menjadi "45rb". */
export function formatRingkas(value) {
  const n = Number(value) || 0
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '')}jt`
  if (n >= 1_000) return `${Math.round(n / 1_000)}rb`
  return String(n)
}
