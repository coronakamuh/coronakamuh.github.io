import { useEffect, useState } from 'react'
import { LogOut, Search } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo-mark'
import { BottomNav } from '@/components/layout/bottom-nav'
import { OfflineBanner } from '@/components/layout/offline-banner'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { PencarianGlobal } from '@/features/pencarian/pencarian-global'
import { site } from '@/config/site'
import { navItems } from '@/config/navigation'
import { useAuth } from '@/lib/auth-context'
import { dayMonthLabel, todayISO } from '@/lib/date'

/** Layout utama, sidebar untuk desktop dan navigasi bawah untuk HP. */
export function AppShell({ route, children }) {
  const { signOut } = useAuth()
  const [searching, setSearching] = useState(false)

  // Pintasan papan ketik: Ctrl+K atau Cmd+K membuka pencarian.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearching(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      <a
        href="#utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-tombol focus:px-4 focus:py-3 focus:text-sm focus:text-white"
      >
        Lompat ke konten
      </a>

      <aside className="hidden border-r border-garis bg-lembar lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarNav route={route} onSearch={() => setSearching(true)} />
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-[4.5rem] shrink-0 items-center gap-2.5 border-b border-garis bg-lembar/95 px-3 backdrop-blur-sm sm:px-5 lg:hidden">
          <LogoMark className="size-6 shrink-0 text-pena" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-tinta">{site.name}</span>
            <span className="mt-0.5 block truncate text-[9px] font-medium uppercase tracking-[0.08em] text-tinta-redup">Smart Stock &amp; Sales Management</span>
          </span>
          <div className="ml-auto flex shrink-0 items-center">
            <Button variant="ghost" size="icon" className="size-10 shrink-0" aria-label="Cari" onClick={() => setSearching(true)}>
              <Search className="size-[18px]" />
            </Button>
            <ThemeToggle className="size-10 shrink-0" />
            <Button variant="ghost" size="icon" className="size-10 shrink-0" aria-label="Keluar" onClick={signOut}>
              <LogOut className="size-[18px]" />
            </Button>
          </div>
        </header>

        <OfflineBanner />

        <main
          id="utama"
          className="relative min-w-0 flex-1 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 sm:pt-6 lg:px-8 lg:py-8 xl:px-10"
        >
          {/* Pita latar lembut di belakang judul (hanya desktop). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-44 bg-linear-to-br from-pena/12 via-pena/5 to-transparent lg:block"
            style={{
              backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-pena) 22%, transparent) 1.2px, transparent 1.2px)',
              backgroundSize: '18px 18px',
              WebkitMaskImage: 'linear-gradient(90deg, transparent 35%, #000 100%)',
              maskImage: 'linear-gradient(90deg, transparent 35%, #000 100%)',
            }}
          />
          <div className="relative mx-auto w-full max-w-screen-2xl">
            <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
              <nav aria-label="Jejak halaman" className="text-xs text-tinta-redup">
                Beranda / <span className="font-semibold text-tinta">{navItems.find((item) => item.id === route)?.label ?? ''}</span>
              </nav>
              <span className="rounded-lg border border-garis bg-lembar px-3 py-1.5 text-xs font-semibold tabular-nums">{dayMonthLabel(todayISO())} {todayISO().slice(0, 4)}</span>
            </div>
            {children}
          </div>
        </main>
      </div>

      <BottomNav route={route} />
      <PencarianGlobal open={searching} onOpenChange={setSearching} />
    </div>
  )
}
