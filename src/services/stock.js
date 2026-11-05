import { todayISO } from '@/lib/date'
import { unwrap } from '@/services/queries'
import { supabase } from '@/services/supabase'

// Stok yang mustahil: fungsi database selalu menolak dan menyebut stok aslinya sebelum menulis apa pun.
const IMPOSSIBLE_STOCK = -1e15

/**
 * Stok barang pada tanggal tertentu, selalu dari database (tidak dihitung di frontend).
 * - Hari ini: view `v_stock` (sumber stok resmi).
 * - Tanggal lampau: database tidak punya fungsi baca khusus. `catat_transaksi_stok_atomic` menghitung stok
 *   pada tanggal itu lalu MEMBANDINGKANNYA dengan stok yang diharapkan SEBELUM menulis. Dengan stok
 *   harapan yang mustahil, fungsi itu pasti menolak ("Stok berubah menjadi X") tanpa menulis; angka X
 *   itulah stok resmi pada tanggal tersebut.
 */
export async function getStockAsOf(barangId, date) {
  if (date === todayISO()) {
    const rows = unwrap(await supabase.from('v_stock').select('stok').eq('id', barangId).limit(1))
    if (rows.length === 0) throw new Error('Barang tidak ditemukan')
    return Number(rows[0].stok)
  }
  const { error } = await supabase.rpc('catat_transaksi_stok_atomic', {
    p_barang_id: barangId,
    p_tanggal: date,
    p_type: 'masuk',
    p_qty: 1,
    p_expected_stock: IMPOSSIBLE_STOCK,
  })
  const match = error?.message?.match(/Stok berubah menjadi ([\d.,-]+)/i)
  if (match) return Number(match[1].replace(/\.$/, ''))
  if (!error) throw new Error('Pembacaan stok tidak terduga. Hubungi pengelola sistem.')
  throw new Error(error.message)
}
