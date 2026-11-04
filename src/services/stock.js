import { stockAsOf } from '@/lib/stock'
import { fetchAll, unwrap } from '@/services/queries'
import { supabase } from '@/services/supabase'

/** Stok barang pada tanggal tertentu (baca saja), dengan rumus yang sama seperti database. */
export async function getStockAsOf(barangId, date) {
  const rows = unwrap(
    await supabase.from('barang').select('id, stok_awal, tanggal_mulai, created_at').eq('id', barangId).limit(1),
  )
  if (rows.length === 0) throw new Error('Barang tidak ditemukan')
  const transaksi = await fetchAll(() =>
    supabase.from('transaksi').select('id, tanggal, type, qty').eq('barang_id', barangId).lte('tanggal', date).order('id'),
  )
  return stockAsOf(rows[0], transaksi, date)
}
