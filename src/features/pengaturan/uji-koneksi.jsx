import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CardBody } from '@/components/ui/card'
import { formatAngka } from '@/lib/format'
import { testConnection } from '@/services/health'

/** Tombol uji koneksi: membaca jumlah baris tiap sumber data (baca saja, tidak menulis apa pun). */
export function UjiKoneksi() {
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  async function run() {
    setRunning(true)
    try {
      setResult(await testConnection())
    } finally {
      setRunning(false)
    }
  }

  const allOk = result?.every((row) => row.ok)

  return (
    <CardBody className="flex flex-col gap-4">
      <div>
        <Button variant="outline" onClick={run} disabled={running}>
          {running ? 'Menguji…' : 'Uji koneksi'}
        </Button>
      </div>
      {result ? (
        <>
          <p role="status" className={allOk ? 'text-sm font-medium' : 'text-sm font-medium text-bahaya'}>
            {allOk ? 'Terhubung. Semua sumber data bisa dibaca.' : 'Ada sumber data yang gagal dibaca.'}
          </p>
          <ul className="divide-y divide-garis-halus text-sm">
            {result.map((row) => (
              <li key={row.key} className="flex items-baseline justify-between gap-3 py-2">
                <span className="min-w-0 truncate">{row.label}</span>
                <span className={row.ok ? 'shrink-0 tabular-nums' : 'shrink-0 text-bahaya'}>
                  {row.ok ? `${formatAngka(row.count ?? 0)} baris · ${row.ms} ms` : row.error}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </CardBody>
  )
}
