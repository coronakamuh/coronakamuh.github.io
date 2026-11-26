// Preferensi tampilan (disimpan di perangkat, bukan di database). Fungsi murni supaya mudah diuji.
export const TEXT_SIZES = ['kecil', 'normal', 'besar']
export const ROW_OPTIONS = ['auto', 20, 30, 50]
/** Jumlah baris per halaman bila memilih "Bawaan". */
export const DEFAULT_ROWS = 7
export const THEMES = ['kaca', 'glass', 'neumorph']
/** Tema warna aksen. `color` hanya untuk bulatan pilihan di Pengaturan (warna tombol versi terang). */
export const ACCENT_OPTIONS = [
  { value: 'navy', label: 'Navy', color: '#1e3a8a' },
  { value: 'zamrud', label: 'Zamrud', color: '#0f6b4f' },
  { value: 'indigo', label: 'Indigo', color: '#4338ca' },
  { value: 'oranye', label: 'Oranye', color: '#b45309' },
  { value: 'grafit', label: 'Grafit', color: '#1f2937' },
  { value: 'maroon', label: 'Maroon', color: '#7a1b2d' },
  { value: 'tosca', label: 'Tosca', color: '#0f766e' },
]
export const ACCENTS = ACCENT_OPTIONS.map((option) => option.value)
export const DEFAULT_PREFS = { textSize: 'normal', rows: 'auto', theme: 'kaca', accent: 'navy' }
/** Warna bilah status peramban (meta theme-color), sama dengan warna header. */
export const THEME_COLOR = { kaca: '#e6f0f3', glass: '#0a2a21', neumorph: '#e0e5ec' }
export const STORAGE_KEY = 'dhouse.prefs'

/** Baca preferensi dari teks JSON; nilai yang tidak dikenal kembali ke bawaan. */
export function parsePrefs(raw) {
  try {
    const value = JSON.parse(raw)
    return {
      textSize: TEXT_SIZES.includes(value?.textSize) ? value.textSize : DEFAULT_PREFS.textSize,
      rows: ROW_OPTIONS.includes(value?.rows) ? value.rows : DEFAULT_PREFS.rows,
      theme: THEMES.includes(value?.theme) ? value.theme : DEFAULT_PREFS.theme,
      accent: ACCENTS.includes(value?.accent) ? value.accent : DEFAULT_PREFS.accent,
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

/** "Bawaan" = 7 baris per halaman untuk semua tabel (Stok, Penjualan, Riwayat). */
export const pageSizeFor = (rows) => (rows === 'auto' ? DEFAULT_ROWS : rows)
export const rootFontSize = (textSize) => (textSize === 'besar' ? '112.5%' : textSize === 'kecil' ? '93.75%' : '')
