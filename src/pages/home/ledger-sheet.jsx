import { Stamp } from '@/pages/home/stamp'

const numberColumns = ['Masuk', 'Keluar', 'Sisa']
const emptyRows = Array.from({ length: 6 }, (_, index) => index)

/**
 * Lembar catatan stok yang sengaja dibiarkan kosong.
 * Isinya tidak berisi angka atau barang apa pun karena fitur pencatatan belum dibuat.
 */
export function LedgerSheet() {
  return (
    <div className="relative">
      <table className="w-full table-fixed border-collapse border border-garis bg-lembar-tegas text-sm tabular-nums">
        <caption className="sr-only">Lembar catatan stok. Belum ada catatan.</caption>
        <thead>
          <tr className="border-b border-garis text-pena">
            <th scope="col" className="px-3 py-2.5 text-left font-medium">
              Barang
            </th>
            {numberColumns.map((name) => (
              <th
                key={name}
                scope="col"
                className="w-[4.25rem] border-l border-garis px-3 py-2.5 text-right font-medium sm:w-20"
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-garis-halus">
            <td colSpan={4} className="h-12 px-3 text-tinta-redup">
              Belum ada catatan.
            </td>
          </tr>
          {emptyRows.map((row) => (
            <tr key={row} aria-hidden="true" className="border-b border-garis-halus last:border-b-0">
              <td className="h-12" />
              <td className="border-l border-garis-halus" />
              <td className="border-l border-garis-halus" />
              <td className="border-l border-garis-halus" />
            </tr>
          ))}
        </tbody>
      </table>

      <Stamp className="absolute -bottom-6 right-4 sm:-right-3" />
    </div>
  )
}
