import { useEffect, useRef } from 'react'

const KEY = 'dhouse.cari'
const EVENT = 'dhouse:cari'

/** Mengirim kata pencarian ke halaman tujuan (Penjualan, Stok, atau Riwayat), lalu membuka halaman itu. */
export function kirimPencarian(page, q) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ page, q }))
  } catch {
    // penyimpanan tidak tersedia: halaman tetap terbuka tanpa kata pencarian
  }
  if (window.location.hash === `#/${page}`) window.dispatchEvent(new Event(EVENT))
  else window.location.hash = `#/${page}`
}

/** Dipakai halaman: menerima kata pencarian yang dikirim dari pencarian global (saat dibuka atau saat sudah terbuka). */
export function usePencarianAwal(page, apply) {
  const applyRef = useRef(apply)
  applyRef.current = apply
  useEffect(() => {
    const take = () => {
      try {
        const raw = sessionStorage.getItem(KEY)
        if (!raw) return
        const value = JSON.parse(raw)
        if (value.page !== page) return
        sessionStorage.removeItem(KEY)
        applyRef.current(String(value.q ?? ''))
      } catch {
        // abaikan data yang rusak
      }
    }
    take()
    window.addEventListener(EVENT, take)
    return () => window.removeEventListener(EVENT, take)
  }, [page])
}
