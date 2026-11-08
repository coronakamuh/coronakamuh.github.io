import { cn } from '@/lib/cn'

export const controlClass =
  'h-10 w-full min-w-0 rounded-lg border border-garis bg-lembar px-3 text-base text-tinta placeholder:text-tinta-redup transition-[border-color,box-shadow] duration-200 focus:border-pena/50 focus:outline-none focus:ring-4 focus:ring-pena/10 focus:shadow-sm disabled:cursor-not-allowed disabled:bg-garis-halus disabled:text-tinta-redup sm:text-sm'

/** Label + isian. Catatan: iPhone memperbesar layar saat mengetik di isian bertulisan kurang dari 16px. */
export function Field({ label, htmlFor, hint, className, children }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-tinta-redup">{hint}</p> : null}
    </div>
  )
}

export function Input({ className, ...props }) {
  return <input className={cn(controlClass, className)} {...props} />
}
