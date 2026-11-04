import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchAdminProfile, signIn, signOut } from '@/services/auth'
import { supabase } from '@/services/supabase'

const AuthContext = createContext(null)

/**
 * status: 'loading' | 'signedOut' | 'checking' | 'admin' | 'notAdmin' | 'error'
 * 'notAdmin' = akun valid tetapi emailnya tidak terdaftar di app_admins (RLS akan menolak semua data).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [admin, setAdmin] = useState({ state: 'checking', profile: null })
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
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
    () => ({ status, email: session?.user?.email ?? '', profile: admin.profile, signIn, signOut, recheck }),
    [status, session, admin.profile, recheck],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return value
}
