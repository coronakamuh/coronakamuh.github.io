import { useState } from 'react'
import { Menu } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo-mark'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/dialog'
import { site } from '@/config/site'

/**
 * Kerangka aplikasi.
 * Desktop (lg ke atas): sidebar tetap di kiri.
 * HP: bilah atas dengan tombol menu yang membuka sidebar sebagai panel geser.
 */
export function AppShell({ route, children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-pena focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Lompat ke konten
      </a>

      <aside className="hidden border-r border-garis lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarNav route={route} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-garis bg-lembar px-3 lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Buka menu" onClick={() => setMenuOpen(true)}>
            <Menu />
          </Button>
          <LogoMark className="size-6 text-pena" />
          <span className="font-semibold tracking-tight">{site.name}</span>
        </header>

        <main id="utama" className="flex-1 px-4 py-6 sm:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu utama">
        <SidebarNav route={route} onNavigate={() => setMenuOpen(false)} />
      </Drawer>
    </div>
  )
}
