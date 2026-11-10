import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Modal } from '@/components/ui/dialog'
import { FormMessage } from '@/components/ui/form-error'
import { Segmented } from '@/components/ui/segmented'
import { formatDisplay, todayISO } from '@/lib/date'
import { RECAP_DEFAULT_DAYS, RECAP_MAX_DAYS, rangeDays } from '@/lib/rekap-rentang'

const formatOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
]

/** Pilih format dan (opsional) rentang tanggal rekap stok. Kosong = default 30 hari terakhir. */
export function ExportRekapDialog({ open, onOpenChange, pending, onExport }) {
  const [format, setFormat] = useState('pdf')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [error, setError] = useState('')
  const today = todayISO()

  const days = from && to ? rangeDays(from, to) : 0
  const hint = from && to ? `Rekap harian ${formatDisplay(from)} – ${formatDisplay(to)} (${days} hari).` : `Kosong = default: rekap harian ${RECAP_DEFAULT_DAYS} hari terakhir.`

  function handleSubmit(event) {
    event.preventDefault()
    if (Boolean(from) !== Boolean(to)) return setError('Isi kedua tanggal, atau kosongkan keduanya.')
    if (from && to && from > to) return setError('Tanggal awal tidak boleh setelah tanggal akhir.')
    if (days > RECAP_MAX_DAYS) return setError(`Rentang maksimal ${RECAP_MAX_DAYS} hari agar file tetap terbaca.`)
    setError('')
    onExport(format, from && to ? { from, to } : null)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Export Rekap Stok" description="Pilih format dan rentang tanggal.">
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4" noValidate>
        <div>
          <p className="mb-1.5 text-[11px] font-bold tracking-wide text-tinta-redup uppercase">Format</p>
          <Segmented label="Format file" value={format} onValueChange={setFormat} options={formatOptions} />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold tracking-wide text-tinta-redup uppercase">Rentang tanggal (opsional)</p>
          <div className="grid grid-cols-2 gap-2">
            <DatePicker id="export-dari" aria-label="Dari tanggal" placeholder="Dari tanggal" value={from} onChange={setFrom} max={to || today} />
            <DatePicker id="export-sampai" aria-label="Sampai tanggal" placeholder="Sampai tanggal" value={to} onChange={setTo} min={from || undefined} max={today} />
          </div>
          <p className="mt-2 rounded-lg bg-kertas px-2.5 py-2 text-xs leading-snug text-tinta-redup">{hint}</p>
        </div>
        <FormMessage>{error}</FormMessage>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={pending}>
            Batal
          </Button>
          <Button type="submit" className="flex-1" disabled={pending}>
            <Download />
            {pending ? 'Menyiapkan…' : `Export ${format === 'pdf' ? 'PDF' : 'Excel'}`}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
