// Menambah, mengubah, dan menghapus barang. Hapus hanya lewat fungsi database hapus_barang_aman (menolak barang yang punya penjualan atau mutasi).
import { friendlyError } from '@/services/errors'
import { supabase } from '@/services/supabase'

export async function tambahBarang({ nama, stokAwal, brandId }) {
  const { data, error } = await supabase
    .from('barang')
    .insert({ nama: nama.trim(), stok_awal: stokAwal, brand_id: brandId })
    .select('id')
  if (error) throw friendlyError(error)
  return data?.[0]?.id ?? true
}

/** Mengganti brand tidak mengubah brand pada penjualan lama (hanya penjualan baru). */
export async function ubahBarang({ id, nama, brandId }) {
  const { error } = await supabase.from('barang').update({ nama: nama.trim(), brand_id: brandId }).eq('id', id)
  if (error) throw friendlyError(error)
  return true
}

/** Arsipkan (true) atau kembalikan (false) banyak barang. Riwayat tetap utuh; barang arsip hanya disembunyikan dari daftar dan pilihan. */
export async function arsipkanBarang(ids, arsip) {
  for (let i = 0; i < ids.length; i += 200) {
    const { error } = await supabase
      .from('barang')
      .update({ diarsipkan: arsip })
      .in('id', ids.slice(i, i + 200))
    if (error) throw friendlyError(error)
  }
  return ids.length
}

/** Hapus banyak barang sekaligus (maks. 200). Database menolak semuanya bila ada barang berriwayat. Mengembalikan jumlah terhapus. */
export async function hapusBarang(ids) {
  const { data, error } = await supabase.rpc('hapus_barang_aman', { p_ids: ids })
  if (error) throw friendlyError(error)
  return data
}
