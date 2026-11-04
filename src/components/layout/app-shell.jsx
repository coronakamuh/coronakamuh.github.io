import { LogoMark } from '@/components/brand/logo-mark'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { site } from '@/config/site'

/**
 * Kerangka aplikasi.
 * Desktop (lg ke atas): sidebar tetap di kiri.
 * HP: bilah atas berisi nama aplikasi, dan menu berada di bilah bawah.
 */
export function AppShell({ route, children }) {
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
        <header className="flex h-14 items-center gap-2.5 border-b border-garis bg-lembar px-4 lg:hidden">
          <LogoMark className="size-6 text-pena" />
          <span className="font-semibold tracking-tight">{site.name}</span>
        </header>

        {/* pb-28: ruang agar isi paling bawah tidak tertutup bilah menu di HP */}
        <main id="utama" className="flex-1 px-4 pt-6 pb-28 sm:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <BottomNav route={route} />
    </div>
  )
}
