import { LogoMark } from '@/components/brand/logo-mark'
import { navItems } from '@/config/navigation'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'

/** Sidebar desktop. Di HP, menu pindah ke bilah bawah (lihat bottom-nav.jsx). */
export function SidebarNav({ route }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-3 px-5 lg:h-16">
        <LogoMark className="size-7 text-pena" />
        <span className="font-semibold tracking-tight">{site.name}</span>
      </div>

      <nav aria-label="Menu utama" className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = route === id
            return (
              <li key={id}>
                <a
                  href={`#/${id}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                    active
                      ? 'bg-garis-halus font-medium text-pena'
                      : 'text-tinta-redup hover:bg-garis-halus/70 hover:text-tinta',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <p className="px-5 py-4 text-xs text-tinta-redup">
        Tahap {site.stage.number} · {site.stage.label}
      </p>
    </div>
  )
}
