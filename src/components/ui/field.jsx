import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

const controlClass =
  'h-10 w-full rounded-md border border-garis bg-lembar px-3 text-base text-tinta placeholder:text-tinta-redup disabled:cursor-not-allowed disabled:bg-garis-halus disabled:text-tinta-redup sm:text-sm'

/** Label + isian. Ukuran teks 16px di HP agar layar tidak membesar sendiri saat mengetik. */
export function Field({ label, htmlFor, hint, className, children }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
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

/** Pilihan bawaan peramban: paling nyaman dipakai di HP. */
export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select className={cn(controlClass, 'appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-tinta-redup"
        aria-hidden="true"
      />
    </div>
  )
}
