import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/lib/preferences'

/** Tombol cepat terang/gelap. variant "row" untuk sidebar, "icon" untuk header HP. */
export function ThemeToggle({ variant = 'icon', className }) {
  const { resolvedTheme, setPref } = usePreferences()
  const dark = resolvedTheme === 'gelap'
  const Icon = dark ? Sun : Moon
  const label = dark ? 'Tema terang' : 'Tema gelap'
  const toggle = () => setPref('theme', dark ? 'terang' : 'gelap')

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-tinta-redup transition-colors hover:bg-garis-halus hover:text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pena"
      >
        <Icon className="size-[18px] shrink-0" aria-hidden="true" />
        {label}
      </button>
    )
  }
  return (
    <Button variant="ghost" size="icon" className={className} aria-label={`Aktifkan ${label.toLowerCase()}`} title={label} onClick={toggle}>
      <Icon className="size-[18px]" />
    </Button>
  )
}
