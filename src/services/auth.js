import { supabaseConfig } from '@/config/supabase'
import { friendlyError } from '@/services/errors'
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
    if (error) {
      if (error.status === 0 || error.name === 'AuthRetryableFetchError' || /fetch|network/i.test(error.message)) {
        throw new Error('Tidak bisa terhubung. Periksa koneksi internet.')
      }
      if (error.status === 429) throw new Error('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.')
      throw new Error('Email atau password salah.')
    }
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

/**
 * Keluar hanya dari perangkat ini (scope 'local'). Bawaan Supabase ('global') mencabut sesi
 * di SEMUA perangkat, termasuk aplikasi lama yang memakai akun yang sama.
 */
export async function signOut() {
  await supabase.auth.signOut({ scope: 'local' })
}

/** Baris admin milik akun yang sedang masuk (RLS hanya mengembalikan baris miliknya). Null bila bukan admin. */
export async function fetchAdminProfile() {
  const { data, error } = await supabase.from('app_admins').select('email, username').limit(1)
  if (error) throw friendlyError(error)
  return data?.[0] ?? null
}

/**
 * Ganti password akun yang sedang masuk (Supabase Auth existing, tanpa sistem kedua).
 * Password saat ini diperiksa dulu dengan masuk ulang; sesi tetap milik akun yang sama.
 * Akun yang sama dipakai aplikasi lama, jadi password barunya berlaku di sana juga.
 */
export async function changePassword({ email, current, next }) {
  const { error: verify } = await supabase.auth.signInWithPassword({ email, password: current })
  if (verify) {
    if (verify.status === 0 || verify.name === 'AuthRetryableFetchError' || /fetch|network/i.test(verify.message)) {
      throw new Error('Tidak bisa terhubung. Periksa koneksi internet.')
    }
    if (verify.status === 429) throw new Error('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.')
    throw new Error('Password saat ini salah.')
  }
  const { error } = await supabase.auth.updateUser({ password: next })
  if (error) {
    if (error.code === 'same_password') throw new Error('Password baru harus berbeda dari password saat ini.')
    if (error.code === 'weak_password') throw new Error('Password baru terlalu lemah. Pakai campuran huruf dan angka yang lebih panjang.')
    if (error.status === 429) throw new Error('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.')
    throw friendlyError(error)
  }
  return true
}
