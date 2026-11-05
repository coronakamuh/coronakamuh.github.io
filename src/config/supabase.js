import { checkSupabaseConfig } from '@/config/supabase-check'

// Alamat project dan kunci "publishable" dibaca dari environment variable Vite
// (file .env.production untuk build, .env.local untuk komputer sendiri; lihat .env.example).
// Kunci publishable memang dirancang untuk browser: data tetap dilindungi RLS
// (hanya admin di tabel app_admins yang bisa membaca atau menulis).
// JANGAN PERNAH memasukkan kunci "service_role" atau "secret"; konfigurasi seperti itu ditolak.
const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim()

export const supabaseConfig = { url, publishableKey }
export const configProblem = checkSupabaseConfig(url, publishableKey)
