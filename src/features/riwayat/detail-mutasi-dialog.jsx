import { formatDateTime } from '@/lib/date'
import { Modal } from '@/components/ui/dialog'
import { ErrorNotice } from '@/components/ui/notice'
import { useAsync } from '@/hooks/use-async'
import { formatDisplay } from '@/lib/date'
import { formatAngka, formatRupiah } from '@/lib/format'
import { getMovementDetail } from '@/services/queries'

function Fact({ label, children }) {
  return (
    <div className="rounded-md bg-kertas px-3 py-2">
      <dt className="text-xs text-tinta-redup">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  )
}

const explain = {
  masuk: 'Menambah stok.',
  laku: 'Mengurangi stok.',
  adjust: 'Penyesuaian stok: database menyimpan selisihnya terhadap stok pada tanggal itu.',
  adjust_masuk: 'Penyesuaian yang menambah stok.',
  adjust_keluar: 'Penyesuaian yang mengurangi stok.',
}

function Body({ id }) {
  const { data, error, loading, reload } = useAsync(() => getMovementDetail(id), [id])
  if (error) return <ErrorNotice error={error} onRetry={reload} />
  if (!data) return <p className="py-8 text-center text-sm text-tinta-redup">{loading ? 'Memuat detail…' : ''}</p>
  const need = data.currentStock !== null ? Math.max(0, -data.currentStock) : 0
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-2">
        <Fact label="Nomor catatan">#{data.id}</Fact>
        <Fact label="Tanggal">{formatDisplay(data.date)}</Fact>
        <Fact label="Barang">{data.item}</Fact>
        <Fact label="Brand">{data.brand}</Fact>
        <Fact label="Jenis">{data.label}</Fact>
        <Fact label="Pengaruh ke stok">
          <span className={data.delta < 0 ? 'text-bahaya' : undefined}>
            {data.delta > 0 ? '+' : ''}
            {formatAngka(data.delta)}
          </span>
        </Fact>
        <Fact label="Stok barang sekarang">
          <span className={data.currentStock < 0 ? 'text-bahaya' : undefined}>{data.currentStock === null ? '—' : formatAngka(data.currentStock)}</span>
        </Fact>
        <Fact label="Kebutuhan PO sekarang">{need > 0 ? `${formatAngka(need)} unit` : 'Tidak ada'}</Fact>
      </dl>
      <p className="text-sm text-tinta-redup">{explain[data.type] ?? ''}</p>
      {data.sale ? (
        <div className="rounded-md border border-garis px-3 py-2 text-sm">
          <p className="font-medium">Dari penjualan #{data.sale.id}</p>
          <p className="text-tinta-redup">
            {formatDisplay(data.sale.date)} · {formatAngka(data.sale.qty)} × {formatRupiah(data.sale.price)} = {formatRupiah(data.sale.qty * data.sale.price)} · {data.sale.brand}
          </p>
          <p className="mt-1 text-tinta-redup">Ubah lewat halaman Penjualan agar stok tetap sesuai.</p>
        </div>
      ) : null}
      <p className="text-xs text-tinta-redup">Dicatat {formatDateTime(data.createdAt)}</p>
    </div>
  )
}

export function DetailMutasiDialog({ id, onOpenChange }) {
  return (
    <Modal open={id !== null} onOpenChange={onOpenChange} title="Detail Mutasi" description="Rincian satu catatan barang masuk atau keluar.">
      {id !== null ? <Body id={id} /> : null}
    </Modal>
  )
}
