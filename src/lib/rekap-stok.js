// Rekap stok harian per barang untuk laporan "Rekap Stok" (Excel dan PDF).
// Fungsi murni; memakai aturan stok yang sama dengan lib/stock.js (stok awal mulai dari tanggal mulai barang).
import { signedQty, startDate } from '@/lib/stock'

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** Daftar tanggal ISO berurutan sebanyak `count` hari yang berakhir pada `endISO`. */
export function lastDays(endISO, count) {
  const [y, m, d] = endISO.split('-').map(Number)
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1, d - (count - 1 - i)))
    return date.toISOString().slice(0, 10)
  })
}

/** "9/10" untuk judul kolom. */
export const dayLabel = (iso) => `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`

/** "Oktober–November 2026" (atau "Oktober 2026", "Desember 2026–Januari 2027"). */
export function periodLabel(dates) {
  const first = dates[0]
  const last = dates[dates.length - 1]
  const a = `${MONTHS[Number(first.slice(5, 7)) - 1]} ${first.slice(0, 4)}`
  const b = `${MONTHS[Number(last.slice(5, 7)) - 1]} ${last.slice(0, 4)}`
  if (a === b) return a
  return first.slice(0, 4) === last.slice(0, 4) ? `${MONTHS[Number(first.slice(5, 7)) - 1]}–${b}` : `${a}–${b}`
}

/**
 * Sel per hari: stok pada AWAL hari (sebelum transaksi hari itu) dan selisih transaksi hari itu.
 *  - { none: true }                          barang belum dimulai pada tanggal itu
 *  - { opening, delta, hasTx }               opening = stok awal hari, delta = jumlah bertanda transaksi hari itu
 * Tampilan: angka utama = max(0, opening). Hari bertransaksi: sel hitam + angka kecil delta.
 * Stok minus (tanpa transaksi hari itu): 0 dengan angka kecil stok minusnya.
 */
export function buildStockRecap({ items, movements, dates }) {
  const byItem = new Map()
  for (const row of movements) {
    if (!byItem.has(row.barang_id)) byItem.set(row.barang_id, [])
    byItem.get(row.barang_id).push(row)
  }
  const rows = []
  for (const item of items) {
    const start = startDate(item)
    const own = (byItem.get(item.id) || []).filter((row) => row.tanggal >= start)
    const dayNet = new Map()
    const dayCount = new Map()
    for (const row of own) {
      dayNet.set(row.tanggal, (dayNet.get(row.tanggal) || 0) + signedQty(row.type, row.qty))
      dayCount.set(row.tanggal, (dayCount.get(row.tanggal) || 0) + 1)
    }
    // stok sebelum hari pertama jendela = stok awal + transaksi sebelum tanggal itu
    let running = 0
    let started = start <= dates[0]
    if (started) {
      running = Number(item.stok_awal)
      for (const row of own) if (row.tanggal < dates[0]) running += signedQty(row.type, row.qty)
    }
    const cells = dates.map((date) => {
      if (start > date) return { none: true }
      if (!started) {
        started = true
        running = Number(item.stok_awal)
      }
      const opening = running
      const delta = dayNet.get(date) || 0
      running += delta
      return { opening, delta, hasTx: (dayCount.get(date) || 0) > 0 }
    })
    if (cells.some((cell) => !cell.none && (cell.opening !== 0 || cell.hasTx))) {
      rows.push({ id: item.id, name: item.name, brand: item.brand || 'Tanpa brand', cells })
    }
  }
  const brands = new Map()
  for (const row of rows) {
    if (!brands.has(row.brand)) brands.set(row.brand, [])
    brands.get(row.brand).push(row)
  }
  return [...brands.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'id'))
    .map(([brand, list]) => ({ brand, rows: list.sort((a, b) => a.name.localeCompare(b.name, 'id')) }))
}

/** Teks sel: { main, sup, black } — main angka utama, sup angka kecil (atau ''), black = ada transaksi. */
export function cellDisplay(cell) {
  if (cell.none) return { main: '—', sup: '', black: false }
  const main = String(Math.max(0, cell.opening))
  if (cell.hasTx) return { main, sup: cell.delta > 0 ? `+${cell.delta}` : String(cell.delta), black: true }
  if (cell.opening < 0) return { main: '0', sup: String(cell.opening), black: false }
  return { main, sup: '', black: false }
}

export const RECAP_LEGEND =
  'Angka = stok di awal hari. Sel hitam = ada transaksi hari itu, angka kecil = selisih transaksinya (+ masuk, - keluar). 0 dengan angka minus kecil = stok minus (kebutuhan PO). tanda strip = barang belum dimulai.'
