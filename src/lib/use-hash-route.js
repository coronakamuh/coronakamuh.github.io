import { useEffect, useState } from 'react'
import { navItems } from '@/config/navigation'

const validIds = navItems.map((item) => item.id)
const defaultRoute = 'dashboard'

function readRoute() {
  const id = window.location.hash.replace(/^#\/?/, '')
  return validIds.includes(id) ? id : defaultRoute
}

/**
 * Router sederhana berbasis hash (#/stok). Cocok untuk GitHub Pages
 * karena tidak membutuhkan pengaturan server untuk alamat halaman.
 */
export function useHashRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onChange = () => {
      setRoute(readRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
