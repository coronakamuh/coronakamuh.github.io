import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/field'
import { FormMessage } from '@/components/ui/form-error'
import { Select } from '@/components/ui/select'
import { useMutation } from '@/hooks/use-mutation'
import { parseWhole, validateItem } from '@/lib/validation'
import { tambahBarang, ubahBarang } from '@/services/items'

/** Tambah barang baru (item kosong) atau ubah nama dan brand barang yang ada. */
export function BarangDialog({ open, item, brands, existingNames, onOpenChange, onDone }) {
  const editing = Boolean(item)
  const [nama, setNama] = useState('')
  const [brandId, setBrandId] = useState('')
  const [stokAwal, setStokAwal] = useState('')
  const [error, setError] = useState('')
  const save = useMutation(editing ? ubahBarang : tambahBarang)

  useEffect(() => {
    if (open) {
      setNama(item?.name ?? '')
      setBrandId(item ? String(item.brandId ?? '') : '')
      setStokAwal('')
      setError('')
    }
  }, [open, item])

  const options = brands.filter((brand) => brand.active || String(brand.id) === brandId).map((brand) => ({ value: String(brand.id), label: brand.name }))

  async function handleSubmit(event) {
    event.preventDefault()
    const problem = validateItem({ nama, stokAwal, brandId, askStock: !editing }, existingNames, item?.name)
    setError(problem ?? '')
    if (problem) return
    try {
      const args = editing
        ? { id: item.id, nama, brandId: Number(brandId) }
        : { nama, brandId: Number(brandId), stokAwal: parseWhole(stokAwal) }
      const done = await save.run(args)
      if (!done) return
      toast.success(editing ? 'Barang diperbarui' : 'Barang ditambahkan', { description: nama.trim() })
      onOpenChange(false)
      onDone()
    } catch (failure) {
      setError(failure.message)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Ubah Barang' : 'Tambah Barang'}
      description={editing ? 'Mengganti brand hanya berlaku untuk penjualan baru.' : 'Stok awal adalah jumlah stok saat barang pertama dicatat.'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <Field label="Nama barang" htmlFor="barang-nama">
          <Input id="barang-nama" value={nama} onChange={(event) => setNama(event.target.value)} />
        </Field>
        <Field label="Brand" htmlFor="barang-brand">
          <Select id="barang-brand" value={brandId} onValueChange={setBrandId} options={options} placeholder="Pilih brand" />
        </Field>
        {!editing ? (
          <Field label="Stok awal" htmlFor="barang-stok">
            <Input id="barang-stok" inputMode="numeric" placeholder="0" value={stokAwal} onChange={(event) => setStokAwal(event.target.value)} />
          </Field>
        ) : null}
        <FormMessage>{error}</FormMessage>
        <Button type="submit" className="h-11 w-full" disabled={save.pending}>
          {save.pending ? 'Menyimpan…' : 'Simpan Barang'}
        </Button>
      </form>
    </Modal>
  )
}
