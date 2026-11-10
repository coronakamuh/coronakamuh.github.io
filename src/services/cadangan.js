// Membaca seluruh data untuk cadangan (hanya membaca, tidak mengubah apa pun).
import { describeMovement, fetchAll, getBrands, unwrap } from '@/services/queries'
import { supabase } from '@/services/supabase'

export async function getBackupData() {
  const [brands, barang, stock, penjualan, transaksi, targets] = await Promise.all([
    getBrands(),
    fetchAll(() => supabase.from('barang').select('id, nama, brand_id, stok_awal, tanggal_mulai').order('id')),
    fetchAll(() => supabase.from('v_stock').select('id, stok').order('id')),
    fetchAll(() => supabase.from('penjualan').select('id, tanggal_pembelian, brand, barang_id, qty, harga').order('id')),
    fetchAll(() => supabase.from('transaksi').select('id, tanggal, type, qty, barang_id, penjualan_id').order('id')),
    supabase.from('target_penjualan_brand').select('brand, target').order('brand').then(unwrap),
  ])
  const brandName = new Map(brands.map((brand) => [brand.id, brand.name]))
  const stockOf = new Map(stock.map((row) => [row.id, Number(row.stok)]))
  const itemName = new Map(barang.map((row) => [row.id, row.nama]))
  return {
    brands,
    targets,
    barang: barang.map((row) => ({
      id: row.id,
      nama: row.nama,
      brand: brandName.get(row.brand_id) ?? '',
      stokAwal: Number(row.stok_awal ?? 0),
      tanggalMulai: row.tanggal_mulai ?? '',
      stok: stockOf.get(row.id) ?? 0,
    })),
    penjualan: penjualan.map((row) => ({
      id: row.id,
      tanggal: row.tanggal_pembelian,
      brand: row.brand,
      barang: itemName.get(row.barang_id) ?? '',
      qty: Number(row.qty),
      harga: Number(row.harga),
      total: Number(row.qty) * Number(row.harga),
    })),
    mutasi: transaksi.map((row) => {
      const movement = describeMovement({ ...row, qty: Number(row.qty) })
      return { id: row.id, tanggal: row.tanggal, barang: itemName.get(row.barang_id) ?? '', jenis: movement.label, jumlah: movement.delta, penjualanId: row.penjualan_id ?? '' }
    }),
  }
}
