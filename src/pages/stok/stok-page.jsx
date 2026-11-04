import { useState } from 'react'
import { AlertTriangle, Boxes, FileSpreadsheet, FileText, Package, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Modal } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/field'
import { StatCard } from '@/components/ui/stat-card'

const stockColumns = [
  { key: 'code', label: 'Kode' },
  { key: 'name', label: 'Barang' },
  { key: 'brand', label: 'Brand' },
  { key: 'stock', label: 'Stok', align: 'right' },
  { key: 'price', label: 'Harga', align: 'right' },
]

// Belum ada database. Daftar dan pilihan brand dibiarkan kosong.
const items = []
const brands = []

export function StokPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')

  const visibleItems = items.filter(
    (item) =>
      (!brand || item.brand === brand) &&
      item.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  function handleExport(format) {
    toast.info(`Ekspor ${format} belum bisa dilakukan`, {
      description: 'Belum ada data barang untuk diekspor.',
    })
  }

  function handleAdd(event) {
    event.preventDefault()
    toast.info('Belum bisa disimpan', {
      description: 'Penyimpanan data baru tersedia setelah database disambungkan.',
    })
    setAddOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Stok Barang"
        description="Daftar barang dan jumlah stoknya."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus />
            Tambah Barang
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total Barang" icon={Package} />
        <StatCard label="Total Stok" icon={Boxes} />
        <StatCard label="Barang Minus" icon={AlertTriangle} tone="danger" className="col-span-2 sm:col-span-1" />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Tabel Stok"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}>
                <FileText />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}>
                <FileSpreadsheet />
                Excel
              </Button>
            </div>
          }
        />
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:px-5 sm:pb-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tinta-redup"
              aria-hidden="true"
            />
            <Input
              type="search"
              aria-label="Cari barang"
              placeholder="Cari nama barang"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select aria-label="Filter brand" value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="">Semua brand</option>
            {brands.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <DataTable
          caption="Tabel stok barang"
          columns={stockColumns}
          rows={visibleItems}
          empty={{
            icon: Package,
            title: items.length === 0 ? 'Belum ada barang' : 'Barang tidak ditemukan',
            description:
              items.length === 0
                ? 'Tambahkan barang pertama dengan tombol Tambah Barang.'
                : 'Coba kata kunci atau brand yang lain.',
          }}
        />
      </Card>

      <Modal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Tambah Barang"
        description="Isi data barang. Penyimpanan aktif setelah database disambungkan."
      >
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Field label="Nama barang" htmlFor="nama-barang">
            <Input id="nama-barang" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kode" htmlFor="kode-barang">
              <Input id="kode-barang" />
            </Field>
            <Field label="Brand" htmlFor="brand-barang">
              <Input id="brand-barang" required />
            </Field>
            <Field label="Stok awal" htmlFor="stok-barang">
              <Input id="stok-barang" type="number" inputMode="numeric" placeholder="0" required />
            </Field>
            <Field label="Harga jual" htmlFor="harga-barang">
              <Input id="harga-barang" type="number" inputMode="numeric" placeholder="Rp 0" required />
            </Field>
          </div>
          <Button type="submit">Simpan Barang</Button>
        </form>
      </Modal>
    </>
  )
}
