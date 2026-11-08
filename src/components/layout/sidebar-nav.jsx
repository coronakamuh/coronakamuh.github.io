import { LogOut } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo-mark'
import { navItems } from '@/config/navigation'
import { site } from '@/config/site'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/cn'

/** Navigasi desktop. Hak akses dan tujuan menu mengikuti konfigurasi yang sama. */
export function SidebarNav({ route }) {
  const { signOut } = useAuth()

  return (
    <div className="flex h-full flex-col bg-lembar">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-garis px-5">
        <LogoMark className="size-7 shrink-0 text-pena" />
        <span className="truncate text-sm font-semibold tracking-tight text-tinta">{site.name}</span>
      </div>

      <nav aria-label="Menu utama" className="flex-1 px-3 py-5">
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
                      ? 'bg-blue-50 font-semibold text-pena'
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
