import { useState } from 'react'
import { Receipt, Save } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, Input } from '@/components/ui/field'
import { ErrorNotice } from '@/components/ui/notice'
import { Pager } from '@/components/ui/pager'
import { Select } from '@/components/ui/select'
import { useAsync } from '@/hooks/use-async'
import { formatAngka, formatRupiah } from '@/lib/format'
import { formatDisplay, todayISO } from '@/lib/date'
import { getSalesPage } from '@/services/queries'

const PAGE_SIZE = 20

const salesColumns = [
  { key: 'date', label: 'Tanggal', render: (row) => formatDisplay(row.date) },
  { key: 'item', label: 'Barang' },
  { key: 'brand', label: 'Brand' },
  { key: 'qty', label: 'Jumlah', align: 'right', render: (row) => formatAngka(row.qty) },
  { key: 'total', label: 'Total', align: 'right', render: (row) => formatRupiah(row.total) },
]

export function PenjualanPage() {
  const [page, setPage] = useState(1)
  const { data, error, loading, reload } = useAsync(() => getSalesPage({ page, pageSize: PAGE_SIZE }), [page])
  const waiting = loading && !data

  return (
    <>
      <PageHeader title="Penjualan" description="Catat penjualan dan lihat transaksi terbaru." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader title="Catat Penjualan" description="Mode baca saja. Pencatatan diaktifkan pada tahap berikutnya." />
          <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4 p-4 pt-0 sm:p-5 sm:pt-0">
            <Field label="Tanggal" htmlFor="tanggal-jual">
              <DatePicker id="tanggal-jual" value={todayISO()} onChange={() => {}} disabled />
            </Field>
            <Field label="Barang" htmlFor="barang-jual">
              <Select id="barang-jual" value="" onValueChange={() => {}} options={[]} placeholder="Diaktifkan nanti" disabled />
            </Field>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <Field label="Jumlah" htmlFor="jumlah-jual">
                <Input id="jumlah-jual" type="number" placeholder="0" disabled />
              </Field>
              <Field label="Harga satuan" htmlFor="harga-jual">
                <Input id="harga-jual" type="number" placeholder="Rp 0" disabled />
              </Field>
            </div>
            <Button type="submit" disabled>
              <Save />
              Simpan Penjualan
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Penjualan Terbaru" description={data ? `${formatAngka(data.total)} penjualan tercatat.` : undefined} />
          {error ? (
            <div className="px-4 pb-4 sm:px-5">
              <ErrorNotice error={error} onRetry={reload} />
            </div>
          ) : null}
          <DataTable
            caption="Penjualan terbaru"
            columns={salesColumns}
            rows={data ? data.rows : []}
            empty={{
              icon: Receipt,
              title: waiting ? 'Memuat data' : 'Belum ada penjualan',
              description: waiting ? '' : 'Penjualan yang dicatat akan tampil di sini, yang terbaru paling atas.',
            }}
          />
          <Pager page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setPage} />
        </Card>
      </div>
    </>
  )
}
