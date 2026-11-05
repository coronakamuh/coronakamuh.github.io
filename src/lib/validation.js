// Aturan validasi form. Setiap fungsi mengembalikan teks galat, atau null bila valid.
// Batas-batasnya mengikuti database (qty >= 1, harga >= 0, target 0 s/d 1 triliun).

const WHOLE = /^\d+$/

export const parseWhole = (text) => (WHOLE.test(String(text).trim()) ? Number(String(text).trim()) : null)

function checkDate(tanggal, today) {
  if (!tanggal) return 'Tanggal wajib diisi.'
  if (tanggal > today) return 'Tanggal tidak boleh di masa depan.'
  return null
}

export function validateSale({ barang, qty, harga, tanggal }, today) {
  if (!barang) return 'Pilih barang dulu.'
  if (!barang.brandActive) return 'Barang ini belum punya brand aktif. Atur brand barangnya dulu di Stok Barang.'
  const q = parseWhole(qty)
  if (q === null || q < 1) return 'Jumlah harus bilangan bulat, minimal 1.'
  const h = parseWhole(harga)
  if (h === null) return 'Harga harus angka bulat, minimal 0.'
  return checkDate(tanggal, today)
}

export function validateMovement({ mode, qty, tanggal, stock }, today) {
  const dateError = checkDate(tanggal, today)
  if (dateError) return dateError
  const q = parseWhole(qty)
  if (mode === 'adjust') {
    if (q === null) return 'Stok sebenarnya harus angka bulat, minimal 0.'
    if (q === stock) return 'Stok sudah sesuai, tidak ada yang perlu disesuaikan.'
    return null
  }
  if (q === null || q < 1) return 'Jumlah harus bilangan bulat, minimal 1.'
  return null
}

export function validateItem({ nama, stokAwal, brandId, askStock }, existingNames, ownName) {
  const name = nama.trim()
  if (!name) return 'Nama barang wajib diisi.'
  if (name.length > 150) return 'Nama barang maksimal 150 karakter.'
  const clash = existingNames.some((n) => n.toLowerCase() === name.toLowerCase() && n.toLowerCase() !== (ownName ?? '').toLowerCase())
  if (clash) return 'Sudah ada barang dengan nama itu.'
  if (!brandId) return 'Pilih brand.'
  if (askStock && parseWhole(stokAwal) === null) return 'Stok awal harus angka bulat, minimal 0.'
  return null
}

/** Target kosong berarti "belum diatur" (null). */
export function parseTarget(text) {
  const value = String(text ?? '').trim()
  if (value === '') return { value: null, error: null }
  const n = parseWhole(value)
  if (n === null || n > 1_000_000_000_000) return { value: null, error: 'Target harus angka bulat 0 sampai 1.000.000.000.000.' }
  return { value: n, error: null }
}
