import { LogOut, Search } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo-mark'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { navItems } from '@/config/navigation'
import { site } from '@/config/site'
import { useAsync } from '@/hooks/use-async'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/cn'
import { getMinusCount } from '@/services/queries'

/** Navigasi desktop: panel berwarna aksen. Hak akses dan tujuan menu mengikuti konfigurasi yang sama. */
export function SidebarNav({ route, onSearch }) {
  const { signOut, email, profile } = useAuth()
  // Jumlah barang bermasalah (stok minus) untuk lencana di menu Stok; dimuat ulang tiap pindah halaman.
  const minus = useAsync(getMinusCount, [route])
  const badge = { stok: minus.data > 0 ? minus.data : 0 }
  const username = profile?.username || ''
  const initial = (username || email || '?')[0].toUpperCase()

  return (
    <div className="relative flex h-full flex-col overflow-hidden text-white" style={{ backgroundImage: 'linear-gradient(180deg, var(--sidebar-a), var(--sidebar-b))' }}>
      <div className="pointer-events-none absolute -right-16 -bottom-20 size-60 rounded-full bg-white/6" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 -left-20 size-52 rounded-full bg-white/4" aria-hidden="true" />

      <div className="relative flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-white/15 px-5">
        <LogoMark className="size-7 shrink-0 text-white" />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight">{site.name}</span>
          <span className="mt-0.5 block truncate text-[9px] font-medium uppercase tracking-[0.08em] text-white/70">Smart Stock &amp; Sales Management</span>
        </div>
      </div>

      <nav aria-label="Menu utama" className="relative flex-1 px-3 py-5">
        {onSearch ? (
          <button
            type="button"
            onClick={onSearch}
            className="mb-4 flex h-10 w-full items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left">Cari…</span>
            <kbd className="rounded border border-white/20 bg-white/15 px-1.5 text-[10px] font-medium">Ctrl K</kbd>
          </button>
        ) : null}
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">Menu utama</p>
        <ul className="flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = route === id
            const count = badge[id] ?? 0
            return (
              <li key={id}>
                <a
                  href={`#/${id}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                    active ? 'sidebar-aktif font-semibold' : 'text-white/85 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate">{label}</span>
                  {count > 0 ? (
                    <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] leading-4 font-bold text-white tabular-nums" title={`${count} barang stok minus`}>
                      {count}
                      <span className="sr-only"> barang stok minus</span>
                    </span>
                  ) : null}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="relative border-t border-white/15 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5">
          <span className="sidebar-avatar flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold" aria-hidden="true">
            {initial}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">{username || email || '—'}</span>
            <span className="block text-[11px] text-white/70">Admin</span>
          </span>
        </div>
        <ThemeToggle variant="row" onDark />
        <button
          type="button"
          onClick={signOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
          Keluar
        </button>
      </div>
    </div>
  )
}
