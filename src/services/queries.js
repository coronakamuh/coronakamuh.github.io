// Lapisan data BACA SAJA. Tidak ada insert, update, atau delete di file ini (penulisan ada di sales.js, movements.js, items.js, brands.js).
// Nama tabel dan kolom mengikuti database yang sudah ada (hasil audit tahap 3).
import { addDaysISO, monthRange, shortDayMonth, todayISO } from '@/lib/date'
import { supabase } from '@/services/supabase'

const PAGE_SIZE = 1000 // batas baris per permintaan di Supabase

/** Ambil semua baris dengan berhenti-lanjut per 1000 baris. `build` harus membuat query baru dan terurut stabil. */
export async function fetchAll(build) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build().range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

export const unwrap = ({ data, error }) => {
  if (error) throw error
  return data
}

const sum = (rows, pick) => rows.reduce((total, row) => total + pick(row), 0)

export async function getBrands() {
  const data = unwrap(await supabase.from('brand').select('id, nama, aktif').order('nama'))
  return data.map((row) => ({ id: row.id, name: row.nama, active: row.aktif }))
}

/** Harga jual terakhir per barang, diambil dari penjualan (barang tidak punya harga master). */
async function getLastPrices() {
  const rows = await fetchAll(() =>
    supabase.from('penjualan').select('id, barang_id, harga, tanggal_pembelian').order('id'),
  )
  const sorted = [...rows].sort((a, b) =>
    a.tanggal_pembelian === b.tanggal_pembelian ? a.id - b.id : a.tanggal_pembelian < b.tanggal_pembelian ? -1 : 1,
  )
  const latest = new Map()
  for (const row of sorted) latest.set(row.barang_id, Number(row.harga))
  return latest
}

/** Daftar barang lengkap dengan brand, stok saat ini (view v_stock), dan harga jual terakhir. */
export async function getStockData() {
  const [barang, stock, brands, prices] = await Promise.all([
    fetchAll(() => supabase.from('barang').select('id, nama, brand_id').order('id')),
    fetchAll(() => supabase.from('v_stock').select('id, stok').order('id')),
    getBrands(),
    getLastPrices(),
  ])
  const brandName = new Map(brands.map((brand) => [brand.id, brand.name]))
  const brandActive = new Map(brands.map((brand) => [brand.id, brand.active]))
  const stockOf = new Map(stock.map((row) => [row.id, Number(row.stok)]))
  const items = barang
    .map((row) => ({
      id: row.id,
      name: row.nama,
      brandId: row.brand_id,
      brandActive: brandActive.get(row.brand_id) === true,
      brand: brandName.get(row.brand_id) ?? '—',
      stock: stockOf.get(row.id) ?? 0,
      price: prices.get(row.id) ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'id'))
  const brandNames = [...new Set(items.map((item) => item.brand).filter((name) => name !== '—'))].sort((a, b) =>
    a.localeCompare(b, 'id'),
  )
  return { items, brandNames, brands }
}

/** Jumlah penjualan (qty × harga) per hari, dari tanggal `since` sampai hari ini. */
async function getSalesSince(since) {
  return fetchAll(() =>
    supabase
      .from('penjualan')
      .select('id, tanggal_pembelian, qty, harga')
      .gte('tanggal_pembelian', since)
      .order('id'),
  )
}

/** Susun data grafik: 7 hari terakhir (minggu) dan 4 pekan terakhir (bulan). */
export function bucketSales(rows, today) {
  const perDay = new Map()
  for (const row of rows) {
    perDay.set(row.tanggal_pembelian, (perDay.get(row.tanggal_pembelian) ?? 0) + Number(row.qty) * Number(row.harga))
  }
  const minggu = Array.from({ length: 7 }, (_, index) => {
    const day = addDaysISO(today, index - 6)
    return { label: shortDayMonth(day), value: perDay.get(day) ?? 0 }
  })
  const bulan = Array.from({ length: 4 }, (_, index) => {
    const start = addDaysISO(today, -27 + index * 7)
    let total = 0
    for (let offset = 0; offset < 7; offset += 1) total += perDay.get(addDaysISO(start, offset)) ?? 0
    return { label: shortDayMonth(start), value: total }
  })
  return { minggu, bulan }
}

export async function getDashboard() {
  const today = todayISO()
  const { start, next } = monthRange(today)

  const [summary, todaySales, sales, minusRows, brands, targets] = await Promise.all([
    supabase
      .rpc('get_dashboard_summary', { p_today: today, p_month_start: start, p_month_end: next })
      .then(unwrap),
    supabase.from('penjualan').select('qty, harga').eq('tanggal_pembelian', today).then(unwrap),
    getSalesSince(addDaysISO(today, -27)),
    supabase.from('v_stock').select('id, nama, stok').lt('stok', 0).order('stok').then(unwrap),
    getBrands(),
    getTargets(),
  ])

  // Brand untuk daftar barang minus
  let minusItems = []
  if (minusRows.length > 0) {
    const ids = minusRows.map((row) => row.id)
    const barang = unwrap(await supabase.from('barang').select('id, brand_id').in('id', ids))
    const brandName = new Map(brands.map((brand) => [brand.id, brand.name]))
    const brandOf = new Map(barang.map((row) => [row.id, brandName.get(row.brand_id) ?? '—']))
    minusItems = minusRows.map((row) => ({
      id: row.id,
      name: row.nama,
      brand: brandOf.get(row.id) ?? '—',
      stock: Number(row.stok),
    }))
  }

  const monthTotals = new Map((summary.brand_sales ?? []).map((row) => [row.brand, Number(row.total)]))
  const targetOf = new Map(targets.map((row) => [row.brand, row.target]))
  // Brand aktif, ditambah brand nonaktif (atau tanpa brand) yang masih punya penjualan bulan ini.
  const names = new Set(brands.filter((brand) => brand.active).map((brand) => brand.name))
  for (const name of monthTotals.keys()) names.add(name)
  const brandPerformance = [...names]
    .map((name) => ({
      name,
      total: monthTotals.get(name) ?? 0,
      target: targetOf.get(name) ?? null,
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'id'))

  return {
    today,
    totalBarang: Number(summary.total_barang),
    totalStok: Number(summary.total_stok),
    omzetHariIni: sum(todaySales, (row) => Number(row.qty) * Number(row.harga)),
    minusItems,
    sales: bucketSales(sales, today),
    brandPerformance,
  }
}

export async function getTargets() {
  const data = unwrap(await supabase.from('target_penjualan_brand').select('brand, target').order('brand'))
  return data.map((row) => ({ brand: row.brand, target: row.target === null ? null : Number(row.target) }))
}

/** Target untuk layar Pengaturan: satu baris per brand aktif (target kosong = belum diatur). */
export async function getTargetRows() {
  const [brands, targets] = await Promise.all([getBrands(), getTargets()])
  const targetOf = new Map(targets.map((row) => [row.brand, row.target]))
  return brands
    .filter((brand) => brand.active)
    .map((brand) => ({ id: brand.id, brand: brand.name, target: targetOf.get(brand.name) ?? null }))
}

export async function getSalesPage({ page, pageSize }) {
  const from = (page - 1) * pageSize
  const { data, error, count } = await supabase
    .from('penjualan')
    .select('id, tanggal_pembelian, brand, qty, harga, barang_id, barang(nama)', { count: 'exact' })
    .order('tanggal_pembelian', { ascending: false })
    .order('id', { ascending: false })
    .range(from, from + pageSize - 1)
  if (error) throw error
  return {
    total: count ?? 0,
    rows: data.map((row) => ({
      id: row.id,
      date: row.tanggal_pembelian,
      barangId: row.barang_id,
      item: row.barang?.nama ?? '—',
      brand: row.brand,
      qty: Number(row.qty),
      price: Number(row.harga),
      total: Number(row.qty) * Number(row.harga),
    })),
  }
}

// Tipe mutasi di database: masuk, laku, adjust, adjust_masuk, adjust_keluar.
const typeGroups = {
  masuk: ['masuk'],
  keluar: ['laku'],
  koreksi: ['adjust', 'adjust_masuk', 'adjust_keluar'],
}

/** Label dan tanda jumlah untuk satu baris mutasi. */
export function describeMovement(row) {
  switch (row.type) {
    case 'masuk':
      return { label: 'Masuk', delta: row.qty }
    case 'laku':
      return { label: row.penjualan_id ? 'Terjual' : 'Keluar', delta: -row.qty }
    case 'adjust_masuk':
      return { label: 'Koreksi masuk', delta: row.qty }
    case 'adjust_keluar':
      return { label: 'Koreksi keluar', delta: -row.qty }
    default:
      return { label: 'Koreksi', delta: row.qty } // adjust: qty sudah bertanda
  }
}

export async function getMovementsPage({ page, pageSize, from, to, group }) {
  let query = supabase
    .from('transaksi')
    .select('id, tanggal, type, qty, penjualan_id, barang(nama)', { count: 'exact' })
  if (from) query = query.gte('tanggal', from)
  if (to) query = query.lte('tanggal', to)
  if (group && typeGroups[group]) query = query.in('type', typeGroups[group])
  const start = (page - 1) * pageSize
  const { data, error, count } = await query
    .order('tanggal', { ascending: false })
    .order('id', { ascending: false })
    .range(start, start + pageSize - 1)
  if (error) throw error
  return {
    total: count ?? 0,
    rows: data.map((row) => {
      const movement = describeMovement({ ...row, qty: Number(row.qty) })
      return {
        id: row.id,
        date: row.tanggal,
        item: row.barang?.nama ?? '—',
        label: movement.label,
        delta: movement.delta,
        note: row.penjualan_id ? `Penjualan #${row.penjualan_id}` : '—',
      }
    }),
  }
}
