// Jenis barang untuk ikon kecil di samping nama.
// Hanya dikenali bila nama barang jelas menyebut jenisnya (kata utuh). Selain itu: tanpa ikon,
// supaya tidak menebak. Bila nama memuat kata dari dua jenis berbeda, dianggap tidak jelas.
const words = (name) => String(name ?? '').toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean)
const has = (list, ...keys) => keys.some((key) => list.includes(key))

const OTHER_PRODUCTS = ['HANDLE', 'GEMBOK', 'PADLOCK', 'LOCK', 'KUNCI', 'CYLINDER', 'GRENDEL', 'BOLT', 'PULL', 'LEVER', 'ENGSEL', 'HINGE']

export function itemKind(name) {
  const list = words(name)
  if (list.length === 0) return null
  // Barang berupa pintu: kata pertama "PINTU" (mis. "PINTU PVC POLOS PUTIH").
  if (list[0] === 'PINTU') return 'pintu'
  const others = (skip) => OTHER_PRODUCTS.some((key) => !skip.includes(key) && list.includes(key))
  if (has(list, 'ENGSEL', 'HINGE') && !others(['ENGSEL', 'HINGE'])) return 'engsel'
  if (has(list, 'GEMBOK', 'PADLOCK') && !others(['GEMBOK', 'PADLOCK'])) return 'gembok'
  return null
}

export const KIND_LABEL = { pintu: 'Pintu', engsel: 'Engsel', gembok: 'Gembok' }
