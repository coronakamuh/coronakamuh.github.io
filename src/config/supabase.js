// Alamat project dan kunci "publishable" Supabase.
// Kunci publishable memang dirancang untuk dipakai di browser: data tetap dilindungi RLS
// (hanya admin yang terdaftar di tabel app_admins yang bisa membaca).
// JANGAN PERNAH memasukkan kunci "service_role" atau "secret" ke repository ini.
export const supabaseConfig = {
  url: 'https://lebwxqkbpjqqszzvmnas.supabase.co',
  publishableKey: 'sb_publishable_-ZI4t9ZuLF9LuIee8W_7Fg_EUrgXFat',
}
