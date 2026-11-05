// Preferensi tampilan (disimpan di perangkat, bukan di database). Fungsi murni supaya mudah diuji.
export const TEXT_SIZES = ['normal', 'besar']
export const ROW_OPTIONS = ['auto', 25, 50, 100]
export const DEFAULT_PREFS = { textSize: 'normal', rows: 'auto' }
export const STORAGE_KEY = 'dhouse.prefs'

/** Baca preferensi dari teks JSON; nilai yang tidak dikenal kembali ke bawaan. */
export function parsePrefs(raw) {
  try {
    const value = JSON.parse(raw)
    return {
      textSize: TEXT_SIZES.includes(value?.textSize) ? value.textSize : DEFAULT_PREFS.textSize,
      rows: ROW_OPTIONS.includes(value?.rows) ? value.rows : DEFAULT_PREFS.rows,
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

/** "Bawaan" memakai ukuran asli tiap tabel (Stok 50, Penjualan dan Riwayat 20). */
export const pageSizeFor = (rows, fallback) => (rows === 'auto' ? fallback : rows)
export const rootFontSize = (textSize) => (textSize === 'besar' ? '112.5%' : '')
