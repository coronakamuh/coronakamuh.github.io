// Pembantu ringan rentang tanggal rekap stok (dipisah agar jendela export tidak ikut memuat kode PDF/Excel).
export const RECAP_DEFAULT_DAYS = 30
export const RECAP_MAX_DAYS = 62

/** Jumlah hari dari `from` sampai `to` (kedua ujung ikut dihitung). */
export function rangeDays(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000) + 1
}
