import { Modal } from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table'
import { ErrorNotice } from '@/components/ui/notice'
import { Button } from '@/components/ui/button'
import { useAsync } from '@/hooks/use-async'
import { formatAngka, formatRupiah } from '@/lib/format'
import { getItemDetail } from '@/services/item-detail'
import { History } from 'lucide-react'

const columns = [
  { key: 'date', label: 'Tanggal' },
  { key: 'label', label: 'Jenis' },
  {
    key: 'delta',
    label: 'Jumlah',
    align: 'right',
    render: (row) => <span className={row.delta < 0 ? 'text-bahaya' : undefined}>{row.delta > 0 ? `+${formatAngka(row.delta)}` : formatAngka(row.delta)}</span>,
  },
  { key: 'note', label: 'Keterangan' },
]

function Fact({ label, children }) {
  return (
    <div className="rounded-md bg-kertas px-3 py-2">
      <dt className="text-xs text-tinta-redup">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  )
}

function Body({ item, onMutasi, onUbah }) {
  const { data, error, loading, reload } = useAsync(() => getItemDetail(item.id), [item.id])
  if (error) return <ErrorNotice error={error} onRetry={reload} />
  if (!data) return <p className="py-8 text-center text-sm text-tinta-redup">{loading ? 'Memuat detail…' : ''}</p>
  const need = Math.max(0, -data.stock)
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Fact label="Brand">{data.brand}{data.brandActive ? '' : ' (nonaktif)'}</Fact>
        <Fact label="Stok sekarang">
          <span className={data.stock < 0 ? 'text-bahaya' : undefined}>{formatAngka(data.stock)}</span>
        </Fact>
        <Fact label="Kebutuhan PO">{need > 0 ? `${formatAngka(need)} unit` : 'Tidak ada'}</Fact>
        <Fact label="Stok awal">{formatAngka(data.openingStock)}</Fact>
        <Fact label="Mulai dihitung">{data.startDate}</Fact>
        <Fact label="Harga terakhir">{item.price === null ? '—' : formatRupiah(item.price)}</Fact>
      </dl>
      {data.mismatch !== null ? (
        <p role="alert" className="rounded-md bg-bahaya/10 px-3 py-2 text-sm text-bahaya">
          Perhitungan ulang dengan tanggal mulai ({formatAngka(data.mismatch)}) berbeda dari stok di database. Angka yang tampil adalah angka database.
        </p>
      ) : null}
      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Mutasi terbaru <span className="font-normal text-tinta-redup">({formatAngka(Math.min(20, data.movementCount))} dari {formatAngka(data.movementCount)})</span>
        </h3>
        <DataTable
          caption="Mutasi terbaru barang"
          columns={columns}
          rows={data.movements}
          empty={{ icon: History, title: 'Belum ada mutasi', description: 'Stok masih sama dengan stok awal.' }}
        />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onUbah}>Ubah</Button>
        <Button onClick={onMutasi}>Mutasi</Button>
      </div>
    </div>
  )
}

export function DetailBarangDialog({ item, onOpenChange, onMutasi, onUbah }) {
  return (
    <Modal wide open={Boolean(item)} onOpenChange={onOpenChange} title={item?.name ?? 'Detail barang'} description="Detail barang dan mutasi terbaru.">
      {item ? <Body item={item} onMutasi={() => onMutasi(item)} onUbah={() => onUbah(item)} /> : null}
    </Modal>
  )
}
