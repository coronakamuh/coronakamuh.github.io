// Uji koneksi BACA SAJA: hitung baris tiap sumber data yang dipakai aplikasi (tanpa mengambil isinya).
import { supabase } from '@/services/supabase'

const sources = [
  { key: 'barang', label: 'Barang' },
  { key: 'v_stock', label: 'Stok (v_stock)' },
  { key: 'penjualan', label: 'Penjualan' },
  { key: 'transaksi', label: 'Riwayat In/Out (transaksi)' },
  { key: 'brand', label: 'Brand' },
  { key: 'target_penjualan_brand', label: 'Target brand' },
]

/** Mengembalikan [{ key, label, ok, count, ms, error }]. Tidak pernah melempar galat. */
export async function testConnection() {
  return Promise.all(
    sources.map(async ({ key, label }) => {
      const started = performance.now()
      try {
        const { count, error } = await supabase.from(key).select('*', { count: 'exact', head: true })
        const ms = Math.round(performance.now() - started)
        if (error) return { key, label, ok: false, count: null, ms, error: error.message }
        return { key, label, ok: true, count, ms, error: null }
      } catch (failure) {
        return { key, label, ok: false, count: null, ms: Math.round(performance.now() - started), error: failure?.message ?? 'Tidak bisa terhubung' }
      }
    }),
  )
}
