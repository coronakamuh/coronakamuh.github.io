import { cn } from '@/lib/cn'

export function Card({ className, ...props }) {
  return <section className={cn('dh-card', className)} {...props} />
}

/** Kepala kartu: judul di kiri, aksi (tombol, filter) di kanan. */
export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5', className)}>
      <div className="min-w-0">
        <h2 className="font-semibold tracking-tight text-tinta">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-relaxed text-tinta-redup">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, ...props }) {
  return <div className={cn('p-4 pt-0 sm:p-5 sm:pt-0', className)} {...props} />
}
