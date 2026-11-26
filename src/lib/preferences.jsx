import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_PREFS, STORAGE_KEY, THEME_COLOR, pageSizeFor, parsePrefs, rootFontSize } from '@/lib/prefs'

const PreferencesContext = createContext(null)

function load() {
  try {
    return parsePrefs(localStorage.getItem(STORAGE_KEY))
  } catch {
    return { ...DEFAULT_PREFS } // penyimpanan diblokir: tetap jalan dengan bawaan
  }
}

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(load)
  const resolvedTheme = prefs.theme

  // Terapkan tema ke <html>: token warna, warna bawaan peramban (scrollbar, isian), dan warna bilah status.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolvedTheme
    root.dataset.accent = prefs.accent
    root.style.colorScheme = resolvedTheme === 'glass' ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolvedTheme])
  }, [resolvedTheme, prefs.accent])

  useEffect(() => {
    document.documentElement.style.fontSize = rootFontSize(prefs.textSize)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      /* diabaikan: preferensi hanya berlaku selama halaman terbuka */
    }
  }, [prefs])

  const setPref = useCallback((key, value) => setPrefs((current) => ({ ...current, [key]: value })), [])
  const reset = useCallback(() => setPrefs({ ...DEFAULT_PREFS }), [])
  const value = useMemo(() => ({ prefs, setPref, reset, resolvedTheme }), [prefs, setPref, reset, resolvedTheme])
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences harus dipakai di dalam PreferencesProvider')
  return value
}

/** Jumlah baris per halaman sesuai preferensi; "Bawaan" = 7 baris. Argumen `fallback` tidak lagi dipakai (dibiarkan agar pemanggil tidak berubah). */
export function usePageSize(fallback) {
  return pageSizeFor(usePreferences().prefs.rows)
}
