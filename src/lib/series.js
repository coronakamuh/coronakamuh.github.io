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

/** Tanggal paling awal yang dibutuhkan `previousTotals` (untuk membaca data penjualan). */
export function previousSince(today) {
  const prevMonthStart = monthRange(addDaysISO(monthRange(today).start, -1)).start
  const prevWeekStart = addDaysISO(today, -13)
  return prevMonthStart < prevWeekStart ? prevMonthStart : prevWeekStart
}

/**
 * Total penjualan periode pembanding (hanya membaca baris yang sudah ada):
 * - minggu: 7 hari sebelum 7 hari terakhir.
 * - bulan: bulan lalu pada rentang tanggal yang sama dengan bulan ini (tanggal 1 sampai tanggal hari ini).
 */
export function previousTotals(rows, today) {
  const sum = (from, to) =>
    rows.reduce((total, row) => (row.tanggal_pembelian >= from && row.tanggal_pembelian <= to ? total + Number(row.qty) * Number(row.harga) : total), 0)
  const prevEnd = addDaysISO(monthRange(today).start, -1)
  const prevStart = monthRange(prevEnd).start
  const sameDay = addDaysISO(prevStart, Number(today.slice(8, 10)) - 1)
  return {
    minggu: sum(addDaysISO(today, -13), addDaysISO(today, -7)),
    bulan: sum(prevStart, sameDay < prevEnd ? sameDay : prevEnd),
  }
}
