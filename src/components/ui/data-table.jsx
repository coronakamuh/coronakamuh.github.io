import { cn } from '@/lib/cn'
import { EmptyState } from '@/components/ui/empty-state'

/**
 * Tabel yang tidak pernah digeser ke samping.
 * Mengikuti lebar kartunya sendiri (container query):
 * - sempit (HP, atau kolom kecil di sebelah formulir): tiap baris jadi kartu bertumpuk,
 *   satu pasang "label: isi" per baris.
 * - lebar: tabel biasa.
 * columns: [{ key, label, align?: 'right', render?: (row) => node }]
 */
export function DataTable({ columns, rows, empty, caption }) {
  return (
    <div className="data-table @container">
      {/* Tabel: hanya bila kartu cukup lebar */}
      <table className="hidden w-full table-fixed border-collapse text-sm @xl:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-y border-garis bg-garis-halus/60 text-tinta-redup">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-1.5 text-left text-xs font-medium',
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
                    'px-4 py-1 leading-snug break-words',
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

      {/* Kartu: saat kartu sempit */}
      {rows.length > 0 ? (
        <ul aria-label={caption} className="divide-y divide-garis-halus border-t border-garis @xl:hidden">
          {rows.map((row, index) => (
            <li key={row.id ?? index} className="flex flex-col gap-0.5 px-4 py-2 text-sm leading-snug">
              {columns.map((column) => (
                <div key={column.key} className="flex items-baseline justify-between gap-3">
                  <span className="shrink-0 text-tinta-redup">{column.label}</span>
                  <span className="min-w-0 text-right break-words tabular-nums">
                    {column.render ? column.render(row) : row[column.key]}
                  </span>
                </div>
              ))}
            </li>
          ))}
        </ul>
      ) : null}

      {rows.length === 0 ? (
        <div className="border-t border-garis">
          <EmptyState {...empty} />
        </div>
      ) : null}
    </div>
  )
}
