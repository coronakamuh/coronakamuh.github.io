import { cn } from '@/lib/cn'

/** Tampilan saat belum ada data. Selalu jelaskan kenapa kosong dan apa langkah berikutnya. */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-10 text-center', className)}>
      {Icon ? (
        <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-garis-halus text-tinta-redup">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <p className="font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-tinta-redup">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
