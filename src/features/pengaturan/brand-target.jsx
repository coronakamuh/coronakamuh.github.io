import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { FormMessage } from '@/components/ui/form-error'
import { MoneyInput } from '@/components/ui/money-input'
import { ErrorNotice } from '@/components/ui/notice'
import { SettingGroup } from '@/features/pengaturan/setting-ui'
import { useAsync } from '@/hooks/use-async'
import { useMutation } from '@/hooks/use-mutation'
import { cn } from '@/lib/cn'
import { parseTarget } from '@/lib/validation'
import { simpanTarget, tambahBrand, ubahStatusBrand } from '@/services/brands'
import { getBrands, getTargets } from '@/services/queries'

async function loadBrandTarget() {
  const [brands, targets] = await Promise.all([getBrands(), getTargets()])
  const targetOf = new Map(targets.map((row) => [row.brand, row.target]))
  return brands
    .map((brand) => ({ id: brand.id, name: brand.name, active: brand.active, target: targetOf.get(brand.name) ?? null }))
    .sort((a, b) => Number(b.active) - Number(a.active))
}

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
      className={cn('relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-50', checked ? 'bg-tombol' : 'bg-garis')}
    >
      <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
    </button>
  )
}

/** Satu baris brand: nama, target per bulan (tersimpan otomatis saat kolom ditinggalkan), dan saklar aktif. */
function BrandRow({ brand, busy, onToggle }) {
  const initial = brand.target === null ? '' : String(brand.target)
  const [text, setText] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [error, setError] = useState('')
  const save = useMutation(simpanTarget)

  async function commit() {
    if (save.pending || text.trim() === saved) return
    const parsed = parseTarget(text)
    setError(parsed.error ?? '')
    if (parsed.error) return
    try {
      const done = await save.run({ brand: brand.name, target: parsed.value })
      if (!done) return
      setSaved(text.trim())
      toast.success('Target tersimpan', { description: brand.name })
    } catch (failure) {
      setError(failure.message)
    }
  }

  return (
    <li className="px-3.5 py-2">
      <div className="flex min-h-9 items-center gap-2">
        <label htmlFor={`target-${brand.id}`} className={cn('flex min-w-0 flex-1 items-center gap-2 text-sm font-medium', !brand.active && 'text-tinta-redup')}>
          <span className="truncate">{brand.name}</span>
          {!brand.active ? <Badge tone="netral">Nonaktif</Badge> : null}
        </label>
        {brand.active ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.currentTarget.querySelector('input')?.blur()
            }}
            noValidate
            className="relative"
          >
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-medium text-tinta-redup" aria-hidden="true">
              Rp
            </span>
            <MoneyInput
              id={`target-${brand.id}`}
              placeholder="Belum diatur"
              aria-label={`Target per bulan ${brand.name}`}
              value={text}
              onChange={setText}
              onBlur={commit}
              disabled={save.pending}
              className="h-9 w-36 pl-8 text-right"
            />
          </form>
        ) : null}
        <Saklar
          checked={brand.active}
          disabled={busy}
          label={`${brand.active ? 'Nonaktifkan' : 'Aktifkan'} brand ${brand.name}`}
          onChange={(next) => onToggle(brand, next)}
        />
      </div>
      <div className="mt-1 empty:hidden">
        <FormMessage>{error}</FormMessage>
      </div>
    </li>
  )
}

/** Brand dan target dalam satu daftar: tambah brand, aktif/nonaktif, dan target omzet per bulan. */
export function BrandTarget() {
  const { data, error, loading, reload } = useAsync(loadBrandTarget, [])
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
    } catch (failure) {
      toast.error('Gagal mengubah brand', { description: failure.message })
    } finally {
      setBusyId(null)
    }
  }

  const active = (data ?? []).filter((brand) => brand.active).length

  return (
    <div className="flex flex-col gap-3">
      <div>
        <form onSubmit={handleAdd} className="dh-card flex items-center gap-2 p-2.5" noValidate>
          <Input aria-label="Nama brand baru" placeholder="Nama brand baru" value={nama} onChange={(event) => setNama(event.target.value)} className="h-9 min-w-0 flex-1" maxLength={60} />
          <Button type="submit" size="sm" disabled={add.pending || nama.trim() === ''}>
            <Plus />
            Tambah
          </Button>
        </form>
        <div className="mt-1.5 px-1 empty:hidden">
          <FormMessage>{formError}</FormMessage>
        </div>
      </div>

      <SettingGroup
        title={data ? `${active} aktif dari ${data.length}` : 'Brand'}
        action={<span className="text-[11px] font-bold tracking-wide text-tinta-redup uppercase">Target / bulan</span>}
      >
        {error ? (
          <div className="px-3.5 py-3">
            <ErrorNotice error={error} onRetry={reload} />
          </div>
        ) : null}
        {loading && !data ? <p className="px-3.5 py-3 text-sm text-tinta-redup">Memuat data…</p> : null}
        <ul className="divide-y divide-garis-halus">
          {(data ?? []).map((brand) => (
            <BrandRow key={brand.id} brand={brand} busy={busyId === brand.id} onToggle={handleToggle} />
          ))}
        </ul>
        <p className="px-3.5 py-2 text-xs text-tinta-redup">Target tersimpan otomatis saat kolom ditinggalkan. Kosongkan untuk menandai belum diatur. Brand nonaktif tidak muncul di pilihan barang baru; data lamanya tetap aman.</p>
      </SettingGroup>
    </div>
  )
}
