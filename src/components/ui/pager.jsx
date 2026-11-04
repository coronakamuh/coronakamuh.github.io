import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Pindah halaman tabel. Tidak tampil bila hanya ada satu halaman. */
export function Pager({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (pageCount <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 border-t border-garis px-4 py-3 text-sm sm:px-5">
      <p className="text-tinta-redup">
        Halaman {page} dari {pageCount}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft />
          Sebelumnya
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Berikutnya
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
