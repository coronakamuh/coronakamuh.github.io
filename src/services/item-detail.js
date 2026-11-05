import { stockAsOf, startDate } from '@/lib/stock'
import { todayISO } from '@/lib/date'
import { describeMovement, fetchAll, unwrap } from '@/services/queries'
import { supabase } from '@/services/supabase'

/**
 * Detail satu barang (baca saja): data barang, stok dari v_stock (sumber stok resmi),
 * hitung ulang dengan aturan tanggal mulai sebagai pembanding, dan mutasi terbaru.
 */
export async function getItemDetail(barangId) {
  const [barangRows, stockRows, transaksi] = await Promise.all([
    supabase.from('barang').select('id, nama, stok_awal, tanggal_mulai, created_at, brand_id, brand(nama, aktif)').eq('id', barangId).limit(1),
    supabase.from('v_stock').select('stok').eq('id', barangId).limit(1),
    fetchAll(() => supabase.from('transaksi').select('id, tanggal, type, qty, penjualan_id').eq('barang_id', barangId).order('id')),
  ])
  const barang = unwrap(barangRows)[0]
  if (!barang) throw new Error('Barang tidak ditemukan')
  const stock = Number(unwrap(stockRows)[0]?.stok ?? 0)
  const recomputed = stockAsOf(barang, transaksi, todayISO())
  const movements = [...transaksi]
    .sort((a, b) => (a.tanggal === b.tanggal ? b.id - a.id : a.tanggal < b.tanggal ? 1 : -1))
    .slice(0, 20)
    .map((row) => {
      const movement = describeMovement({ ...row, qty: Number(row.qty) })
      return { id: row.id, date: row.tanggal, label: movement.label, delta: movement.delta, note: row.penjualan_id ? `Penjualan #${row.penjualan_id}` : '—' }
    })
  return {
    id: barang.id,
    name: barang.nama,
    brand: barang.brand?.nama ?? '—',
    brandActive: barang.brand?.aktif === true,
    openingStock: Number(barang.stok_awal),
    startDate: startDate(barang),
    createdAt: barang.created_at,
    stock,
    mismatch: recomputed !== stock ? recomputed : null,
    movementCount: transaksi.length,
    movements,
  }
}
