// Lapisan data BACA SAJA. Tidak ada insert, update, atau delete di file ini (penulisan ada di sales.js, movements.js, items.js, brands.js).
// Nama tabel dan kolom mengikuti database yang sudah ada (hasil audit tahap 3).
import { bucketSales } from '@/lib/series'
import { addDaysISO, monthRange, todayISO } from '@/lib/date'
import { friendlyError } from '@/services/errors'
import { supabase } from '@/services/supabase'

const PAGE_SIZE = 1000 // batas baris per permintaan di Supabase

/** Ambil semua baris dengan berhenti-lanjut per 1000 baris. `build` harus membuat query baru dan terurut stabil. */
export async function fetchAll(build) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build().range(from, from + PAGE_SIZE - 1)
    if (error) throw friendlyError(error)
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

export const unwrap = ({ data, error }) => {
  if (error) throw friendlyError(error)
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

/** Bahan rekap stok harian: semua barang (dengan nama brand) dan semua transaksi stok. Hanya baca. */
export async function getRecapSource() {
  const [barang, movements, brands] = await Promise.all([
    fetchAll(() => supabase.from('barang').select('id, nama, brand_id, stok_awal, tanggal_mulai, created_at').order('id')),
    fetchAll(() => supabase.from('transaksi').select('id, barang_id, tanggal, type, qty').order('id')),
    getBrands(),
  ])
  const brandName = new Map(brands.map((brand) => [brand.id, brand.name]))
  const items = barang.map((row) => ({
    id: row.id,
    name: row.nama,
    brand: brandName.get(row.brand_id) ?? '',
    stok_awal: row.stok_awal,
    tanggal_mulai: row.tanggal_mulai,
    created_at: row.created_at,
  }))
  return { items, movements }
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

export async function getDashboard() {
  const today = todayISO()
  const { start, next } = monthRange(today)

  const [summary, todaySales, sales, minusRows, brands, targets] = await Promise.all([
    supabase
      .rpc('get_dashboard_summary', { p_today: today, p_month_start: start, p_month_end: next })
      .then(unwrap),
    supabase.from('penjualan').select('qty, harga').eq('tanggal_pembelian', today).then(unwrap),
    getSalesSince(start < addDaysISO(today, -6) ? start : addDaysISO(today, -6)),
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
      need: -Number(row.stok),
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

/** Bulan paling awal yang memiliki catatan penjualan (YYYY-MM). */
export async function getSalesStartMonth() {
  const row = unwrap(await supabase
    .from('penjualan')
    .select('tanggal_pembelian')
    .order('tanggal_pembelian', { ascending: true })
    .limit(1)
    .maybeSingle())
  return row?.tanggal_pembelian?.slice(0, 7) ?? null
}

function filterSales(query, { from, to, brand }) {
  let next = query
  if (from) next = next.gte('tanggal_pembelian', from)
  if (to) next = next.lte('tanggal_pembelian', to)
  if (brand) next = next.eq('brand', brand)
  return next
}

/** `q`: cari nama barang (tidak peduli huruf besar/kecil). Karakter khusus LIKE (% _ \) dianggap huruf biasa. */
export async function getSalesPage({ page, pageSize, from, to, brand, q }) {
  const start = (page - 1) * pageSize
  const search = (q ?? '').trim()
  let query = filterSales(
    supabase
      .from('penjualan')
      .select(`id, tanggal_pembelian, brand, qty, harga, barang_id, ${search ? 'barang!inner(nama)' : 'barang(nama)'}`, { count: 'exact' }),
    { from, to, brand },
  )
  if (search) query = query.ilike('barang.nama', `%${search.replace(/[\\%_]/g, '\\$&')}%`)
  const { data, error, count } = await query
    .order('tanggal_pembelian', { ascending: false })
    .order('id', { ascending: false })
    .range(start, start + pageSize - 1)
  if (error) throw friendlyError(error)
  const barangIds = [...new Set(data.map((row) => row.barang_id).filter((id) => id != null))]
  let stockOf = new Map()
  if (barangIds.length > 0) {
    const { data: stockRows, error: stockError } = await supabase.from('v_stock').select('id, stok').in('id', barangIds)
    if (stockError) throw friendlyError(stockError)
    stockOf = new Map(stockRows.map((row) => [row.id, Number(row.stok)]))
  }
  return {
    total: count ?? 0,
    rows: data.map((row) => ({
      id: row.id,
      date: row.tanggal_pembelian,
      barangId: row.barang_id,
      item: row.barang?.nama ?? '—',
      brand: row.brand,
      qty: Number(row.qty),
      stock: stockOf.get(row.barang_id) ?? 0,
      price: Number(row.harga),
      total: Number(row.qty) * Number(row.harga),
    })),
  }
}

/** Semua penjualan sesuai filter (semua halaman) untuk ekspor, terbaru dulu. */
export async function getSalesExport({ from, to, brand }) {
  const rows = await fetchAll(() =>
    filterSales(supabase.from('penjualan').select('id, tanggal_pembelian, brand, qty, harga, barang(nama)'), { from, to, brand }).order('id', { ascending: false }),
  )
  return rows
    .map((row) => ({
      id: row.id,
      date: row.tanggal_pembelian,
      item: row.barang?.nama ?? '—',
      brand: row.brand,
      qty: Number(row.qty),
      price: Number(row.harga),
      total: Number(row.qty) * Number(row.harga),
    }))
    .sort((a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1))
}

/** Jumlah transaksi, unit, dan nilai penjualan untuk filter yang sama (semua halaman). */
export async function getSalesSummary({ from, to, brand }) {
  const rows = await fetchAll(() => filterSales(supabase.from('penjualan').select('id, qty, harga'), { from, to, brand }).order('id'))
  return {
    count: rows.length,
    units: rows.reduce((total, row) => total + Number(row.qty), 0),
    revenue: rows.reduce((total, row) => total + Number(row.qty) * Number(row.harga), 0),
  }
}

// Tipe mutasi di database: masuk, laku, adjust, adjust_masuk, adjust_keluar.
const typeGroups = {
  masuk: ['masuk'],
  terjual: ['laku'], // + penjualan_id terisi
  keluar: ['laku'], // + penjualan_id kosong (keluar manual)
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

/** `q`: cari nama barang (tidak peduli huruf besar/kecil), sama seperti pencarian di Penjualan. */
export async function getMovementsPage({ page, pageSize, from, to, group, q }) {
  const search = (q ?? '').trim()
  let query = supabase
    .from('transaksi')
    .select(`id, tanggal, type, qty, penjualan_id, barang_id, ${search ? 'barang!inner(nama)' : 'barang(nama)'}`, { count: 'exact' })
  if (search) query = query.ilike('barang.nama', `%${search.replace(/[\\%_]/g, '\\$&')}%`)
  if (from) query = query.gte('tanggal', from)
  if (to) query = query.lte('tanggal', to)
  if (group && typeGroups[group]) query = query.in('type', typeGroups[group])
  if (group === 'terjual') query = query.not('penjualan_id', 'is', null)
  if (group === 'keluar') query = query.is('penjualan_id', null)
  const start = (page - 1) * pageSize
  const { data, error, count } = await query
    .order('tanggal', { ascending: false })
    .order('id', { ascending: false })
    .range(start, start + pageSize - 1)
  if (error) throw friendlyError(error)
  return {
    total: count ?? 0,
    rows: data.map((row) => {
      const movement = describeMovement({ ...row, qty: Number(row.qty) })
      return {
        id: row.id,
        date: row.tanggal,
        barangId: row.barang_id,
        item: row.barang?.nama ?? '—',
        label: movement.label,
        delta: movement.delta,
        note: row.penjualan_id ? `Penjualan #${row.penjualan_id}` : '—',
      }
    }),
  }
}

/** Detail satu catatan mutasi (baca saja), termasuk penjualan terkait dan stok barang saat ini. */
export async function getMovementDetail(id) {
  const rows = unwrap(
    await supabase.from('transaksi').select('id, tanggal, type, qty, penjualan_id, created_at, barang_id, barang(nama, brand(nama))').eq('id', id).limit(1),
  )
  const row = rows[0]
  if (!row) throw new Error('Catatan tidak ditemukan')
  const [sale, stockRows] = await Promise.all([
    row.penjualan_id
      ? supabase.from('penjualan').select('id, tanggal_pembelian, brand, qty, harga').eq('id', row.penjualan_id).limit(1)
      : Promise.resolve({ data: [], error: null }),
    supabase.from('v_stock').select('stok').eq('id', row.barang_id).limit(1),
  ])
  const movement = describeMovement({ ...row, qty: Number(row.qty) })
  const penjualan = unwrap(sale)[0]
  return {
    id: row.id,
    date: row.tanggal,
    createdAt: row.created_at,
    type: row.type,
    label: movement.label,
    delta: movement.delta,
    barangId: row.barang_id,
    item: row.barang?.nama ?? '—',
    brand: row.barang?.brand?.nama ?? '—',
    currentStock: unwrap(stockRows)[0] ? Number(unwrap(stockRows)[0].stok) : null,
    sale: penjualan
      ? { id: penjualan.id, date: penjualan.tanggal_pembelian, brand: penjualan.brand, qty: Number(penjualan.qty), price: Number(penjualan.harga) }
      : null,
  }
}
