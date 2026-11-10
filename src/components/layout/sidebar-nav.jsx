import { LogOut, Search } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo-mark'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { navItems } from '@/config/navigation'
import { site } from '@/config/site'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/cn'

/** Navigasi desktop. Hak akses dan tujuan menu mengikuti konfigurasi yang sama. */
export function SidebarNav({ route, onSearch }) {
  const { signOut } = useAuth()

  return (
    <div className="flex h-full flex-col bg-lembar">
      <div className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-garis px-5">
        <LogoMark className="size-7 shrink-0 text-pena" />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight text-tinta">{site.name}</span>
          <span className="mt-0.5 block truncate text-[9px] font-medium uppercase tracking-[0.08em] text-tinta-redup">Smart Stock &amp; Sales Management</span>
        </div>
      </div>

      <nav aria-label="Menu utama" className="flex-1 px-3 py-5">
        {onSearch ? (
          <button
            type="button"
            onClick={onSearch}
            className="mb-4 flex h-10 w-full items-center gap-2 rounded-lg border border-garis bg-kertas px-3 text-sm text-tinta-redup transition-colors hover:border-pena/40 hover:text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pena"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left">Cari…</span>
            <kbd className="rounded border border-garis bg-lembar px-1.5 text-[10px] font-medium">Ctrl K</kbd>
          </button>
        ) : null}
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-tinta-redup">
          Menu utama
        </p>
        <ul className="flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = route === id
            return (
              <li key={id}>
                <a
                  href={`#/${id}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pena',
                    active
                      ? 'bg-pena/8 font-semibold text-pena'
                      : 'text-tinta-redup hover:bg-garis-halus hover:text-tinta',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate">{label}</span>
                  {active ? <span className="ml-auto h-5 w-1 shrink-0 rounded-full bg-pena" /> : null}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-garis p-3">
        <ThemeToggle variant="row" />
        <button
          type="button"
          onClick={signOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-tinta-redup transition-colors hover:bg-garis-halus hover:text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pena"
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
          Keluar
        </button>
      </div>
    </div>
  )
}
