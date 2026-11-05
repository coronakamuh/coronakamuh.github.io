import { addDaysISO, monthRange, shortDayMonth } from './date.js'

/**
 * Susun deret grafik dari baris penjualan.
 * - minggu: 7 hari terakhir (termasuk hari ini), per hari.
 * - bulan: bulan berjalan, per hari dari tanggal 1 sampai hari ini (sama dengan periode Performa Brand).
 */
export function bucketSales(rows, today) {
  const perDay = new Map()
  for (const row of rows) {
    perDay.set(row.tanggal_pembelian, (perDay.get(row.tanggal_pembelian) ?? 0) + Number(row.qty) * Number(row.harga))
  }
  const series = (from, to) => {
    const out = []
    for (let day = from; day <= to; day = addDaysISO(day, 1)) out.push({ date: day, label: shortDayMonth(day), value: perDay.get(day) ?? 0 })
    return out
  }
  return { minggu: series(addDaysISO(today, -6), today), bulan: series(monthRange(today).start, today) }
}
