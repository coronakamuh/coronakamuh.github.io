import { LogOut } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo-mark'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'
import { useAuth } from '@/lib/auth-context'

/** Layout utama, sidebar untuk desktop dan navigasi bawah untuk HP. */
export function AppShell({ route, children }) {
  const { signOut } = useAuth()

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
          <SidebarNav route={route} />
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
            <ThemeToggle className="size-10 shrink-0" />
            <Button variant="ghost" size="icon" className="size-10 shrink-0" aria-label="Keluar" onClick={signOut}>
              <LogOut className="size-[18px]" />
            </Button>
          </div>
        </header>

        <main
          id="utama"
          className="min-w-0 flex-1 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 sm:pt-6 lg:px-8 lg:py-8 xl:px-10"
        >
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>

      <BottomNav route={route} />
    </div>
  )
}
