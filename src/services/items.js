// Menambah dan mengubah barang. Tidak ada hapus barang (menghapus akan ikut menghapus transaksinya).
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
