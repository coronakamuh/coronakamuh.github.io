import { supabaseConfig } from '@/config/supabase'
import { supabase } from '@/services/supabase'

const usernamePattern = /^[a-z0-9]{2,32}$/

/**
 * Masuk memakai username (lewat edge function login-username, sama seperti aplikasi lama)
 * atau memakai email dan password langsung ke Supabase Auth.
 */
export async function signIn(identifier, password) {
  const id = String(identifier ?? '').trim().toLowerCase()
  if (!id || !password) throw new Error('Isi username atau email, dan password.')

  if (id.includes('@')) {
    const { error } = await supabase.auth.signInWithPassword({ email: id, password })
    if (error) throw new Error('Email atau password salah.')
    return
  }

  if (!usernamePattern.test(id)) {
    throw new Error('Username hanya huruf dan angka (2 sampai 32 karakter). Atau masuk memakai email.')
  }

  let response
  try {
    response = await fetch(`${supabaseConfig.url}/functions/v1/login-username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: supabaseConfig.publishableKey },
      body: JSON.stringify({ username: id, password }),
    })
  } catch {
    throw new Error('Tidak bisa terhubung. Periksa koneksi internet.')
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'Login belum bisa diproses.')

  const { error } = await supabase.auth.setSession({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  })
  if (error) throw new Error('Login belum bisa diproses.')
}

export async function signOut() {
  await supabase.auth.signOut()
}

/** Baris admin milik akun yang sedang masuk (RLS hanya mengembalikan baris miliknya). Null bila bukan admin. */
export async function fetchAdminProfile() {
  const { data, error } = await supabase.from('app_admins').select('email, username').limit(1)
  if (error) throw error
  return data?.[0] ?? null
}
