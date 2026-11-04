import { Receipt, Save } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Field, Input, Select } from '@/components/ui/field'

const salesColumns = [
  { key: 'date', label: 'Tanggal' },
  { key: 'item', label: 'Barang' },
  { key: 'qty', label: 'Jumlah', align: 'right' },
  { key: 'total', label: 'Total', align: 'right' },
]

// Belum ada database. Daftar dibiarkan kosong.
const recentSales = []

export function PenjualanPage() {
  function handleSubmit(event) {
    event.preventDefault()
    toast.info('Belum bisa disimpan', {
      description: 'Penyimpanan data baru tersedia setelah database disambungkan.',
    })
  }

  return (
    <>
      <PageHeader title="Penjualan" description="Catat penjualan dan lihat transaksi terbaru." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader title="Catat Penjualan" />
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 pt-0 sm:p-5 sm:pt-0">
            <Field label="Tanggal" htmlFor="tanggal-jual">
              <Input id="tanggal-jual" type="date" required />
            </Field>
            <Field label="Barang" htmlFor="barang-jual" hint="Daftar barang terisi setelah barang ditambahkan.">
              <Select id="barang-jual" required defaultValue="">
                <option value="" disabled>
                  Belum ada barang
                </option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jumlah" htmlFor="jumlah-jual">
                <Input id="jumlah-jual" type="number" inputMode="numeric" min="1" placeholder="0" required />
              </Field>
              <Field label="Harga satuan" htmlFor="harga-jual">
                <Input id="harga-jual" type="number" inputMode="numeric" min="0" placeholder="Rp 0" required />
              </Field>
            </div>
            <Field label="Catatan" htmlFor="catatan-jual">
              <Input id="catatan-jual" type="text" placeholder="Opsional" />
            </Field>
            <Button type="submit">
              <Save />
              Simpan Penjualan
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Penjualan Terbaru" />
          <DataTable
            caption="Penjualan terbaru"
            columns={salesColumns}
            rows={recentSales}
            empty={{
              icon: Receipt,
              title: 'Belum ada penjualan',
              description: 'Penjualan yang dicatat akan tampil di sini, yang terbaru paling atas.',
            }}
          />
        </Card>
      </div>
    </>
  )
}
