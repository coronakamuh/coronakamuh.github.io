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
