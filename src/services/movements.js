// Barang masuk, keluar, dan adjust lewat satu fungsi database atomik.
import { friendlyError } from '@/services/errors'
import { supabase } from '@/services/supabase'

const typeOf = { masuk: 'masuk', keluar: 'laku', adjust: 'adjust' }

/**
 * mode: 'masuk' | 'keluar' | 'adjust'.
 * Untuk adjust, `qty` adalah STOK SEBENARNYA (database menyimpan selisihnya).
 * expectedStock harus sama dengan stok di database pada tanggal itu, kalau tidak database menolak.
 */
export async function catatMutasi({ barangId, tanggal, mode, qty, expectedStock }) {
  const { data, error } = await supabase.rpc('catat_transaksi_stok_atomic', {
    p_barang_id: barangId,
    p_tanggal: tanggal,
    p_type: typeOf[mode],
    p_qty: qty,
    p_expected_stock: expectedStock,
  })
  if (error) throw friendlyError(error)
  return { id: data.transaksi_id, stokSebelum: Number(data.stok_sebelum), stokSetelah: Number(data.stok_setelah) }
}
