import { createClient } from '@supabase/supabase-js'
import { configProblem, supabaseConfig } from '@/config/supabase'

// Bila konfigurasi bermasalah, klien tidak dibuat; App menampilkan layar galat konfigurasi lebih dulu.
export const supabase = configProblem
  ? null
  : createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
