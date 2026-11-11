// Singkatan nama barang untuk file export rekap stok (Excel dan PDF). Tidak mengubah data di database atau tampilan di layar.

// Awalan nama barang yang sama dengan nama brand diganti singkatan brand: "Dekkson kunci" menjadi "DKS kunci".
// `prefix`: ejaan awalan yang dikenali (huruf besar/kecil tidak berpengaruh).
const BRAND_ABBR = {
  'bak mandi': { abbr: 'BM', prefix: ['bak mandi'] },
  belleza: { abbr: 'BLZ', prefix: ['belleza', 'bellezza'] },
  dekkson: { abbr: 'DKS', prefix: ['dekkson'] },
  excellent: { abbr: 'EXC', prefix: ['excellent'] },
  morgan: { abbr: 'MRG', prefix: ['morgan'] },
  'pjs handle': { abbr: 'PJS', prefix: ['pjs handle', 'pjs'] },
  roster: { abbr: 'RST', prefix: ['roster'] },
  solid: { abbr: 'SLD', prefix: ['solid'] },
  tsunami: { abbr: 'TSN', prefix: ['tsunami'] },
  'vapely/wepe': { abbr: 'V/W', prefix: ['vapely/wepe', 'vapely'] },
  violet: { abbr: 'VLT', prefix: ['violet'] },
  wallpanel: { abbr: 'WP', prefix: ['wallpanel'] },
  wepe: { abbr: 'WPE', prefix: ['wepe'] },
}

// Kata panjang yang dipendekkan (seluruh kata saja; kode model seperti US32D dibiarkan).
const WORDS = [
  ['matt black', 'MBLK'],
  ['alumunium', 'ALU'],
  ['cylinder', 'CYL'],
  ['casement', 'CSM'],
  ['mortise', 'MTS'],
  ['padlock', 'PDL'],
  ['grendel', 'GRD'],
  ['handle', 'Hdl'],
  ['hampton', 'Hmp'],
  ['bremen', 'Brm'],
  ['pintu', 'Ptu'],
  ['gembok', 'GMB'],
  ['engsel', 'ENG'],
  ['tempat', 'TPT'],
  ['paket', 'PKT'],
  ['sabun', 'SBN'],
  ['white', 'WHT'],
  ['black', 'BLK'],
]
const WORD_PATTERNS = WORDS.map(([word, abbr]) => [new RegExp(`(?<![A-Za-z0-9])${word.replace(' ', '\\s+')}(?![A-Za-z0-9])`, 'gi'), abbr])

const isBoundary = (char) => char === undefined || ' -:|'.includes(char)

/** Nama barang untuk file export: awalan brand menjadi singkatan brand, lalu kata panjang dipendekkan. */
export function singkatNama(name, brand) {
  let value = String(name ?? '')
  const info = BRAND_ABBR[String(brand ?? '').trim().toLowerCase()]
  if (info) {
    const lower = value.toLowerCase()
    const prefix = [...info.prefix].sort((a, b) => b.length - a.length).find((p) => lower.startsWith(p) && isBoundary(value[p.length]))
    if (prefix) value = `${info.abbr}${value.slice(prefix.length)}`
  } else {
    // Brand tanpa singkatan: perilaku lama, awalan brand dibuang.
    const own = String(brand ?? '').trim()
    if (own && value.slice(0, own.length).toLowerCase() === own.toLowerCase() && ' -:|'.includes(value[own.length] ?? '')) {
      value = value.slice(own.length).trimStart().replace(/^[-:|]+/, '').trimStart()
    }
  }
  for (const [pattern, abbr] of WORD_PATTERNS) value = value.replace(pattern, abbr)
  return value
}
