import { supabaseConfig } from '@/config/supabase'

function hostOf(url) {
  try {
    return new URL(url).hostname
  } catch {
    return '—'
  }
}

/** Keterangan aplikasi (tetap, bukan data bisnis yang disimpan di database). */
export function IdentitasInfo() {
  const native = Boolean(window.Capacitor?.isNativePlatform?.())
  return (
    <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
      <dt className="text-tinta-redup">Nama</dt>
      <dd className="font-medium">Dhouse Digital</dd>
      <dt className="text-tinta-redup">Fungsi</dt>
      <dd>Inventory &amp; Sales Management System: stok, penjualan, dan mutasi barang.</dd>
      <dt className="text-tinta-redup">{native ? 'Versi' : 'Alamat situs'}</dt>
      <dd className="min-w-0 break-words">{native ? 'Aplikasi Android (terpasang)' : window.location.origin}</dd>
      <dt className="text-tinta-redup">Basis data</dt>
      <dd className="min-w-0 break-words">{hostOf(supabaseConfig.url)}</dd>
    </dl>
  )
}
