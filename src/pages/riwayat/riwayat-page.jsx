import { useState } from 'react'
import { History } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Field, Input, Select } from '@/components/ui/field'

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
            <Input id="riwayat-dari" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Sampai tanggal" htmlFor="riwayat-sampai">
            <Input id="riwayat-sampai" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field label="Jenis mutasi" htmlFor="riwayat-jenis">
            <Select id="riwayat-jenis" value={type} onChange={(e) => setType(e.target.value)}>
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
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
