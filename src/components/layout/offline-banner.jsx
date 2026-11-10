import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

/** Pita peringatan saat perangkat tidak tersambung internet. */
export function OfflineBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <div role="status" className="flex items-center gap-2 border-b border-peringatan/30 bg-peringatan/15 px-3 py-2 text-xs font-medium text-tinta sm:px-5">
      <WifiOff className="size-4 shrink-0 text-peringatan" aria-hidden="true" />
      <span>Tidak ada koneksi internet. Aplikasi tetap terbuka, tetapi data tidak dapat dimuat atau disimpan sampai tersambung kembali.</span>
    </div>
  )
}
