import { navItems } from '@/config/navigation'
import { cn } from '@/lib/cn'

/** Menu utama HP, lima tujuan tetap tersedia dan nyaman disentuh. */
export function BottomNav({ route }) {
  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-garis bg-lembar/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(15_23_42/0.05)] backdrop-blur-sm lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {navItems.map(({ id, label, shortLabel, icon: Icon }) => {
          const active = route === id
          return (
            <li key={id} className="min-w-0">
              <a
                href={`#/${id}`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-14 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[10px] leading-tight transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-pena',
                  active ? 'font-semibold text-pena' : 'font-medium text-tinta-redup hover:text-tinta',
                )}
              >
                {active ? <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-pena" /> : null}
                <Icon className={cn('size-[19px] shrink-0', active && 'stroke-[2.4px]')} aria-hidden="true" />
                <span className="max-w-full truncate">{shortLabel}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
