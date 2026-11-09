import { cn } from '@/lib/cn'
import { EmptyState } from '@/components/ui/empty-state'

/**
 * Tabel yang tidak pernah digeser ke samping.
 * Mengikuti lebar kartunya sendiri (container query):
 * - sempit (HP, atau kolom kecil di sebelah formulir): tiap baris jadi kartu bertumpuk,
 *   satu pasang "label: isi" per baris.
 * - lebar: tabel biasa.
 * columns: [{ key, label, align?: 'right', className?: string (untuk kolom tabel), render?: (row) => node }]
 */
export function DataTable({ columns, rows, empty, caption, tableOnMobile = false, tableClassName = '', mobileRow, striped = false }) {
  return (
    <div className={`data-table @container ${tableOnMobile ? 'overflow-x-auto' : ''}`}>
      {/* Tabel: pada halaman tertentu tetap berupa tabel di layar HP. */}
      <table className={cn(tableOnMobile ? 'w-full min-w-0' : 'hidden w-full @xl:table', 'table-fixed border-collapse text-[13px]', tableClassName)}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-y border-garis bg-garis-halus/60 text-tinta-redup">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-3 py-2 text-left text-xs font-semibold sm:px-4',
                  column.align === 'right' && 'text-right',
                  column.className,
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index} className={cn('border-b border-garis-halus last:border-b-0', striped && 'even:bg-garis-halus/60')}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-3 py-2 leading-snug break-words sm:px-4',
                    column.align === 'right' && 'text-right tabular-nums',
                    column.className,
                  )}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Daftar ringkas: saat kartu sempit (HP). Baris judul (nama + aksi), lalu isi lain dalam 2 kolom. */}
      {!tableOnMobile && rows.length > 0 ? (
        <ul aria-label={caption} className="divide-y divide-garis-halus border-t border-garis @xl:hidden">
          {rows.map((row, index) => {
            if (mobileRow) {
              return (
                <li key={row.id ?? index} className={cn('px-3 py-2', striped && 'even:bg-garis-halus/60')}>
                  {mobileRow(row)}
                </li>
              )
            }
            const cell = (column) => (column.render ? column.render(row) : row[column.key])
            const titleColumn = columns.find((column) => column.key === 'name' || column.key === 'item') ?? columns[0]
            const actionColumn = columns.find((column) => column.key === 'actions')
            const rest = columns.filter((column) => column !== titleColumn && column !== actionColumn && !column.mobileHidden)
            return (
              <li key={row.id ?? index} className={cn('px-3 py-2.5 text-xs leading-normal', striped && 'even:bg-garis-halus/60')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 text-[13px] font-semibold leading-snug break-words">{cell(titleColumn)}</div>
                  {actionColumn ? <div className="shrink-0">{cell(actionColumn)}</div> : null}
                </div>
                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                  {rest.map((column) => (
                    <div key={column.key} className="flex min-w-0 items-baseline justify-between gap-2">
                      <span className="shrink-0 text-[11px] text-tinta-redup">{column.label}</span>
                      <span className="min-w-0 text-right text-xs font-medium break-words tabular-nums">{cell(column)}</span>
                    </div>
                  ))}
                </div>
              </li>
            )
          })}
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
