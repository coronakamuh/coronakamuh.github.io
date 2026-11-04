import { useCallback, useEffect, useState } from 'react'

/**
 * Menjalankan fungsi async saat komponen tampil atau saat `deps` berubah.
 * Data lama tetap tampil selama memuat ulang (berguna untuk pindah halaman tabel).
 */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))
    fn()
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error) => !cancelled && setState({ data: null, error, loading: false }))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  return { ...state, reload }
}
