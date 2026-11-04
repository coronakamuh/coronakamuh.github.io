// Aturan stok yang SAMA dengan fungsi database (catat_transaksi_stok_atomic, get_dashboard_summary).
// Fungsi murni, tanpa akses jaringan, supaya mudah diuji.

const jakarta = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' })

/** Tanggal mulai barang: kolom tanggal_mulai, atau tanggal dibuat (WIB) bila kosong. */
export function startDate(barang) {
  return barang.tanggal_mulai || jakarta.format(new Date(barang.created_at))
}

/** Pengaruh satu transaksi terhadap stok. `adjust` sudah bertanda. */
export function signedQty(type, qty) {
  const n = Number(qty)
  if (type === 'masuk' || type === 'adjust_masuk') return n
  if (type === 'laku' || type === 'adjust_keluar') return -n
  if (type === 'adjust') return n
  return 0
}

/**
 * Stok barang pada tanggal `date`: stok awal (bila tanggal mulai <= date)
 * ditambah transaksi dari tanggal mulai sampai `date`.
 * barang: { stok_awal, tanggal_mulai, created_at }; transaksi: [{ tanggal, type, qty }]
 */
export function stockAsOf(barang, transaksi, date) {
  const start = startDate(barang)
  let stock = start <= date ? Number(barang.stok_awal) : 0
  for (const row of transaksi) {
    if (row.tanggal >= start && row.tanggal <= date) stock += signedQty(row.type, row.qty)
  }
  return stock
}
