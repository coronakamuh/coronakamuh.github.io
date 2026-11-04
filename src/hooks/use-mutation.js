import { useCallback, useRef, useState } from 'react'

/** Menjalankan aksi simpan satu kali pada satu waktu (anti-klik ganda, karena database tidak punya kunci anti-ganda). */
export function useMutation(fn) {
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  const run = useCallback(
    async (...args) => {
      if (busy.current) return undefined
      busy.current = true
      setPending(true)
      try {
        return await fn(...args)
      } finally {
        busy.current = false
        setPending(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn],
  )
  return { run, pending }
}
