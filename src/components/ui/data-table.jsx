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
export function DataTable({ columns, rows, empty, caption, tableOnMobile = false, tableClassName = '' }) {
  return (
    <div className={`data-table @container ${tableOnMobile ? 'overflow-x-auto' : ''}`}>
      {/* Tabel: pada halaman tertentu tetap berupa tabel di layar HP. */}
      <table className={cn(tableOnMobile ? 'w-full min-w-0' : 'hidden w-full @xl:table', 'table-fixed border-collapse text-sm', tableClassName)}>
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

      {/* Daftar ringkas: saat kartu sempit (HP). Baris judul (nama + aksi), lalu isi lain dalam 2 kolom. */}
      {!tableOnMobile && rows.length > 0 ? (
        <ul aria-label={caption} className="divide-y divide-garis-halus border-t border-garis @xl:hidden">
          {rows.map((row, index) => {
            const cell = (column) => (column.render ? column.render(row) : row[column.key])
            const titleColumn = columns.find((column) => column.key === 'name' || column.key === 'item') ?? columns[0]
            const actionColumn = columns.find((column) => column.key === 'actions')
            const rest = columns.filter((column) => column !== titleColumn && column !== actionColumn)
            return (
              <li key={row.id ?? index} className="px-3 py-1.5 text-xs leading-snug">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 text-[13px] font-medium break-words">{cell(titleColumn)}</div>
                  {actionColumn ? <div className="shrink-0">{cell(actionColumn)}</div> : null}
                </div>
                <div className="mt-0.5 grid grid-cols-2 gap-x-4 gap-y-px">
                  {rest.map((column) => (
                    <div key={column.key} className="flex min-w-0 items-baseline justify-between gap-2">
                      <span className="shrink-0 text-tinta-redup">{column.label}</span>
                      <span className="min-w-0 text-right break-words tabular-nums">{cell(column)}</span>
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
