import { friendlyError } from '@/services/errors'
import { supabase } from '@/services/supabase'

/** Menyimpan target satu brand. target null = belum diatur. updated_at dikirim karena tidak ada trigger yang mengisinya. */
export async function simpanTarget({ brand, target }) {
  const { error } = await supabase
    .from('target_penjualan_brand')
    .upsert({ brand, target, updated_at: new Date().toISOString() }, { onConflict: 'brand' })
  if (error) throw friendlyError(error)
  return true
}

/** Menambah brand baru (aktif). Nama brand tidak bisa diubah setelahnya karena dicatat sebagai teks di penjualan dan target. */
export async function tambahBrand(nama) {
  const { error } = await supabase.from('brand').insert({ nama, aktif: true })
  if (error) throw friendlyError(error)
  return true
}

/** Mengaktifkan atau menonaktifkan brand. Data lama (barang, penjualan) tidak berubah. */
export async function ubahStatusBrand({ id, aktif }) {
  const { error } = await supabase.from('brand').update({ aktif }).eq('id', id)
  if (error) throw friendlyError(error)
  return true
}
