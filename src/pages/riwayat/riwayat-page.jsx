import { useState } from 'react'
import { History } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { DatePicker } from '@/components/ui/date-picker'
import { Field } from '@/components/ui/field'
import { Select } from '@/components/ui/select'

const historyColumns = [
  { key: 'date', label: 'Tanggal' },
  { key: 'item', label: 'Barang' },
  { key: 'type', label: 'Jenis' },
  { key: 'qty', label: 'Jumlah', align: 'right' },
  { key: 'note', label: 'Keterangan' },
]

const typeOptions = [
  { value: '', label: 'Semua jenis' },
  { value: 'masuk', label: 'Barang masuk' },
  { value: 'keluar', label: 'Barang keluar' },
]

// Belum ada database. Riwayat dibiarkan kosong.
const movements = []

export function RiwayatPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState('')

  const visibleMovements = movements.filter(
    (row) =>
      (!type || row.type === type) && (!from || row.date >= from) && (!to || row.date <= to),
  )
  const filtering = Boolean(from || to || type)

  return (
    <>
      <PageHeader title="Riwayat In/Out" description="Catatan barang masuk dan keluar." />

      <Card>
        <CardHeader title="Riwayat Mutasi" />
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-3 sm:px-5 sm:pb-5">
          <Field label="Dari tanggal" htmlFor="riwayat-dari">
            <DatePicker id="riwayat-dari" value={from} onChange={setFrom} max={to || undefined} />
          </Field>
          <Field label="Sampai tanggal" htmlFor="riwayat-sampai">
            <DatePicker id="riwayat-sampai" value={to} onChange={setTo} min={from || undefined} />
          </Field>
          <Field label="Jenis mutasi" htmlFor="riwayat-jenis">
            <Select id="riwayat-jenis" value={type} onValueChange={setType} options={typeOptions} />
          </Field>
        </div>
        <DataTable
          caption="Riwayat barang masuk dan keluar"
          columns={historyColumns}
          rows={visibleMovements}
          empty={{
            icon: History,
            title: filtering ? 'Tidak ada riwayat yang cocok' : 'Belum ada riwayat',
            description: filtering
              ? 'Ubah tanggal atau jenis mutasi.'
              : 'Barang masuk dan keluar akan tercatat di sini.',
          }}
        />
      </Card>
    </>
  )
}
