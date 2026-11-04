import { cn } from '@/lib/cn'
import { EmptyState } from '@/components/ui/empty-state'

/**
 * Tabel yang aman untuk layar kecil: lebar minimum tetap dan digulir ke samping
 * di dalam kartunya sendiri, sehingga tata letak halaman tidak ikut rusak.
 * columns: [{ key, label, align?: 'right', render?: (row) => node }]
 */
export function DataTable({ columns, rows, empty, caption }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-y border-garis bg-garis-halus/60 text-tinta-redup">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-2.5 text-left font-medium whitespace-nowrap sm:px-5',
                    column.align === 'right' && 'text-right',
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id ?? index} className="border-b border-garis-halus last:border-b-0">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 sm:px-5',
                      column.align === 'right' && 'text-right tabular-nums',
                    )}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <EmptyState {...empty} /> : null}
    </div>
  )
}
