import { CircleAlert } from 'lucide-react'

/** Pesan galat atau peringatan di dalam formulir. tone: 'error' | 'warning'. */
export function FormMessage({ tone = 'error', children }) {
  if (!children) return null
  const color = tone === 'warning' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-bahaya/30 bg-bahaya/5 text-bahaya'
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-md border p-3 text-sm ${color}`}>
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
