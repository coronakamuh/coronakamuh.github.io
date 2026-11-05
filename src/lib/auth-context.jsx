import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchAdminProfile, signIn, signOut } from '@/services/auth'
import { SESSION_EVENT } from '@/services/errors'
import { supabase } from '@/services/supabase'

const AuthContext = createContext(null)

/**
 * status: 'loading' | 'signedOut' | 'checking' | 'admin' | 'notAdmin' | 'error'
 * 'notAdmin' = akun valid tetapi emailnya tidak terdaftar di app_admins (RLS akan menolak semua data).
 * notice: pesan di layar masuk bila sesi berakhir sendiri (bukan karena menekan Keluar).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [admin, setAdmin] = useState({ state: 'checking', profile: null })
  const [retry, setRetry] = useState(0)
  const [notice, setNotice] = useState('')
  const hadSession = useRef(false)
  const manualExit = useRef(false)
  const refreshing = useRef(false)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) hadSession.current = true
        setSession(data.session ?? null)
      })
      .catch(() => setSession(null))
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (next) {
        hadSession.current = true
        setNotice('')
      } else if (event === 'SIGNED_OUT' && hadSession.current && !manualExit.current) {
        setNotice('Sesi Anda sudah berakhir. Silakan masuk lagi.')
      }
      if (!next) hadSession.current = false
      setSession(next)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Data ditolak karena token kedaluwarsa: coba segarkan sesi; bila gagal, keluar dari perangkat ini dan minta masuk lagi.
  useEffect(() => {
    async function handleExpired() {
      if (refreshing.current) return
      refreshing.current = true
      try {
        const { data, error } = await supabase.auth.refreshSession()
        if (error || !data?.session) await supabase.auth.signOut({ scope: 'local' })
      } catch {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      } finally {
        refreshing.current = false
      }
    }
    window.addEventListener(SESSION_EVENT, handleExpired)
    return () => window.removeEventListener(SESSION_EVENT, handleExpired)
  }, [])

  const exit = useCallback(async () => {
    manualExit.current = true
    try {
      await signOut()
    } finally {
      manualExit.current = false
      window.location.hash = ''
    }
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setAdmin({ state: 'checking', profile: null })
    fetchAdminProfile()
      .then((profile) => !cancelled && setAdmin({ state: profile ? 'admin' : 'notAdmin', profile }))
      .catch(() => !cancelled && setAdmin({ state: 'error', profile: null }))
    return () => {
      cancelled = true
    }
  }, [userId, retry])

  const status =
    session === undefined ? 'loading' : session === null ? 'signedOut' : { checking: 'checking', admin: 'admin', notAdmin: 'notAdmin', error: 'error' }[admin.state]

  const recheck = useCallback(() => setRetry((n) => n + 1), [])
  const value = useMemo(
    () => ({ status, notice, email: session?.user?.email ?? '', lastSignIn: session?.user?.last_sign_in_at ?? '', profile: admin.profile, signIn, signOut: exit, recheck }),
    [status, notice, session, admin.profile, recheck, exit],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return value
}
