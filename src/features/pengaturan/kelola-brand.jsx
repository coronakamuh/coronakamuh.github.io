import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { FormMessage } from '@/components/ui/form-error'
import { ErrorNotice } from '@/components/ui/notice'
import { SettingGroup } from '@/features/pengaturan/setting-ui'
import { useAsync } from '@/hooks/use-async'
import { useMutation } from '@/hooks/use-mutation'
import { cn } from '@/lib/cn'
import { getBrands } from '@/services/queries'
import { tambahBrand, ubahStatusBrand } from '@/services/brands'

/** Saklar kecil aktif/nonaktif. */
function Saklar({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-tombol' : 'bg-garis',
      )}
    >
      <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
    </button>
  )
}

/** Daftar brand dengan saklar aktif dan form tambah. Hanya menambah dan mengaktifkan/menonaktifkan; tidak menghapus. */
export function KelolaBrand({ onChanged }) {
  const { data, error, loading, reload } = useAsync(getBrands, [])
  const [nama, setNama] = useState('')
  const [formError, setFormError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const add = useMutation(tambahBrand)
  const toggle = useMutation(ubahStatusBrand)

  async function handleAdd(event) {
    event.preventDefault()
    const value = nama.trim().replace(/\s+/g, ' ')
    if (value === '') return setFormError('Nama brand wajib diisi.')
    if (value.length > 60) return setFormError('Nama brand maksimal 60 karakter.')
    if ((data ?? []).some((brand) => brand.name.toLowerCase() === value.toLowerCase())) return setFormError('Brand dengan nama itu sudah ada.')
    setFormError('')
    try {
      const done = await add.run(value)
      if (!done) return
      toast.success('Brand ditambahkan', { description: value })
      setNama('')
      reload()
      onChanged?.()
    } catch (failure) {
      setFormError(failure.message)
    }
  }

  async function handleToggle(brand, aktif) {
    setBusyId(brand.id)
    try {
      const done = await toggle.run({ id: brand.id, aktif })
      if (!done) return
      toast.success(aktif ? 'Brand diaktifkan' : 'Brand dinonaktifkan', { description: brand.name })
      reload()
      onChanged?.()
    } catch (failure) {
      toast.error('Gagal mengubah brand', { description: failure.message })
    } finally {
      setBusyId(null)
    }
  }

  const active = (data ?? []).filter((brand) => brand.active).length

  return (
    <SettingGroup title="Brand" action={data ? <span className="text-[11px] text-tinta-redup tabular-nums">{active} aktif dari {data.length}</span> : null}>
      <p className="px-3.5 py-2 text-xs text-tinta-redup">Brand nonaktif tidak muncul di pilihan barang baru dan target; data lamanya tetap aman.</p>
      <form onSubmit={handleAdd} className="flex items-center gap-2 px-3.5 py-2" noValidate>
        <Input aria-label="Nama brand baru" placeholder="Nama brand baru" value={nama} onChange={(event) => setNama(event.target.value)} className="h-9 min-w-0 flex-1" maxLength={60} />
        <Button type="submit" size="sm" disabled={add.pending || nama.trim() === ''}>
          <Plus />
          Tambah
        </Button>
      </form>
      <div className="px-3.5 empty:hidden">
        <FormMessage>{formError}</FormMessage>
      </div>
      {error ? (
        <div className="px-3.5 py-3">
          <ErrorNotice error={error} onRetry={reload} />
        </div>
      ) : null}
      {loading && !data ? <p className="px-3.5 py-3 text-sm text-tinta-redup">Memuat data…</p> : null}
      <ul className="divide-y divide-garis-halus">
        {(data ?? []).map((brand) => (
          <li key={brand.id} className="flex min-h-11 items-center justify-between gap-3 px-3.5 py-1.5">
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
              <span className={cn('truncate', !brand.active && 'text-tinta-redup')}>{brand.name}</span>
              {!brand.active ? <Badge tone="netral">Nonaktif</Badge> : null}
            </span>
            <Saklar
              checked={brand.active}
              disabled={busyId === brand.id}
              label={`${brand.active ? 'Nonaktifkan' : 'Aktifkan'} brand ${brand.name}`}
              onChange={(next) => handleToggle(brand, next)}
            />
          </li>
        ))}
      </ul>
    </SettingGroup>
  )
}
