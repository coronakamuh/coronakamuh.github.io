// Pemeriksaan murni (tanpa import.meta) atas alamat dan kunci Supabase.
// Tujuan: menolak kunci rahasia (service_role / secret) yang tidak boleh ada di browser.

function jwtRole(token) {
  const parts = String(token).split('.')
  if (parts.length !== 3) return null
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json).role ?? null
  } catch {
    return null
  }
}

/** Mengembalikan teks masalah, atau null bila konfigurasi aman dipakai di browser. */
export function checkSupabaseConfig(url, key) {
  if (!url || !key) {
    return 'Alamat atau kunci Supabase belum diisi (VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY).'
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) {
    return 'VITE_SUPABASE_URL harus berbentuk https://<project>.supabase.co tanpa garis miring di akhir.'
  }
  if (key.startsWith('sb_secret_') || jwtRole(key) === 'service_role') {
    return 'Kunci yang diisi adalah kunci rahasia (service_role/secret). Kunci itu tidak boleh dipakai di browser. Pakai kunci publishable atau anon.'
  }
  if (!key.startsWith('sb_publishable_') && jwtRole(key) !== 'anon') {
    return 'Bentuk kunci tidak dikenali. Pakai kunci publishable (sb_publishable_...) atau anon.'
  }
  return null
}
