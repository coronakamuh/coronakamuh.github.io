import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Pesan galat dengan tombol coba lagi. */
export function ErrorNotice({ error, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-bahaya/30 bg-bahaya/5 p-4 text-sm">
      <p className="flex items-start gap-2 text-bahaya">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>Data belum bisa dimuat. {error?.message ? `(${error.message})` : ''}</span>
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  )
}

export function LoadingBlock({ label = 'Memuat data' }) {
  return (
    <p role="status" className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-tinta-redup">
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      {label}
    </p>
  )
}
