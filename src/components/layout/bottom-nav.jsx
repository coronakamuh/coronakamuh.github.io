import { navItems } from '@/config/navigation'
import { cn } from '@/lib/cn'

/**
 * Menu utama untuk HP: bilah tetap di bawah layar, mudah dijangkau ibu jari.
 * Disembunyikan di desktop (lg ke atas), tempatnya diganti sidebar.
 */
export function BottomNav({ route }) {
  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-garis bg-lembar pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {navItems.map(({ id, label, shortLabel, icon: Icon }) => {
          const active = route === id
          return (
            <li key={id}>
              <a
                href={`#/${id}`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[10px] transition-colors',
                  active ? 'font-medium text-pena' : 'text-tinta-redup',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="max-w-full truncate px-1">{shortLabel}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
