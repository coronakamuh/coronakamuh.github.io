import { cn } from '@/lib/cn'
import { site } from '@/config/site'

/** Stempel tahap pengembangan. Satu-satunya elemen bergerak di halaman (lihat `.stamp` di index.css). */
export function Stamp({ className }) {
  return (
    <div
      className={cn(
        'stamp pointer-events-none rounded-md border-[3px] border-stempel px-4 py-2 text-center text-stempel mix-blend-multiply select-none',
        className,
      )}
    >
      <p className="font-display text-2xl leading-none font-bold">Tahap {site.stage.number}</p>
      <p className="mt-1 text-xs font-semibold">{site.stage.label}</p>
    </div>
  )
}
