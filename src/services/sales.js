// Penulisan penjualan lewat fungsi database atomik (penjualan + transaksi 'laku' sekaligus).
import { friendlyError } from '@/services/errors'
import { supabase } from '@/services/supabase'

async function call(name, args) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw friendlyError(error)
  return data
}

/** Brand dikirim dari brand barang; trigger di database tetap menetapkannya dari brand aktif barang. */
export async function catatPenjualan({ barangId, brand, qty, harga, tanggal }) {
  const data = await call('catat_penjualan_atomic', {
    p_barang_id: barangId,
    p_brand: brand,
    p_qty: qty,
    p_harga: harga,
    p_tanggal_pembelian: tanggal,
  })
  return { id: data.penjualan_id, stokSebelum: Number(data.stok_sebelum), preorderSetelah: Number(data.preorder_setelah) }
}

/** Selalu kirim 6 argumen bernama agar yang terpanggil versi baru (bukan versi lama 5 argumen). */
export async function editPenjualan({ id, barangId, brand, qty, harga, tanggal }) {
  const data = await call('edit_penjualan_atomic', {
    p_penjualan_id: id,
    p_barang_id: barangId,
    p_brand: brand,
    p_qty: qty,
    p_harga: harga,
    p_tanggal_pembelian: tanggal,
  })
  return { id: data.penjualan_id, preorderSetelah: Number(data.preorder_after) }
}
