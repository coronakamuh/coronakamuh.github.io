// Preferensi tampilan (disimpan di perangkat, bukan di database). Fungsi murni supaya mudah diuji.
export const TEXT_SIZES = ['normal', 'besar']
export const ROW_OPTIONS = ['auto', 25, 50, 100]
export const THEMES = ['terang', 'gelap', 'sistem']
export const DEFAULT_PREFS = { textSize: 'normal', rows: 'auto', theme: 'terang' }
/** Warna bilah status peramban (meta theme-color), sama dengan warna header. */
export const THEME_COLOR = { terang: '#ffffff', gelap: '#131c2e' }
/** "sistem" mengikuti pengaturan terang/gelap perangkat. */
export const resolveTheme = (theme, systemDark) => (theme === 'sistem' ? (systemDark ? 'gelap' : 'terang') : theme)
export const STORAGE_KEY = 'dhouse.prefs'

/** Baca preferensi dari teks JSON; nilai yang tidak dikenal kembali ke bawaan. */
export function parsePrefs(raw) {
  try {
    const value = JSON.parse(raw)
    return {
      textSize: TEXT_SIZES.includes(value?.textSize) ? value.textSize : DEFAULT_PREFS.textSize,
      rows: ROW_OPTIONS.includes(value?.rows) ? value.rows : DEFAULT_PREFS.rows,
      theme: THEMES.includes(value?.theme) ? value.theme : DEFAULT_PREFS.theme,
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

/** "Bawaan" memakai ukuran asli tiap tabel (Stok 50, Penjualan dan Riwayat 20). */
export const pageSizeFor = (rows, fallback) => (rows === 'auto' ? fallback : rows)
export const rootFontSize = (textSize) => (textSize === 'besar' ? '112.5%' : '')
