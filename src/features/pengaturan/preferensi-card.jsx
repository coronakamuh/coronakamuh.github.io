import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Segmented } from '@/components/ui/segmented'
import { usePreferences } from '@/lib/preferences'
import { DEFAULT_PREFS } from '@/lib/prefs'

const themeOptions = [
  { value: 'terang', label: 'Terang' },
  { value: 'gelap', label: 'Gelap' },
  { value: 'sistem', label: 'Sistem' },
]
const sizeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'besar', label: 'Besar' },
]
const rowOptions = [
  { value: 'auto', label: 'Bawaan' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

/** Preferensi hanya berlaku di perangkat ini (disimpan di browser), tidak mengubah database. */
export function PreferensiCard() {
  const { prefs, setPref, reset } = usePreferences()
  const isDefault = prefs.textSize === DEFAULT_PREFS.textSize && prefs.rows === DEFAULT_PREFS.rows && prefs.theme === DEFAULT_PREFS.theme
  return (
    <Card>
      <CardHeader title="Preferensi Tampilan" description="Hanya berlaku di perangkat dan browser ini." />
      <CardBody className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Tema</p>
            <p className="text-xs text-tinta-redup">Sistem mengikuti pengaturan terang atau gelap di perangkat.</p>
          </div>
          <Segmented label="Tema" value={prefs.theme} onValueChange={(value) => setPref('theme', value)} options={themeOptions} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Ukuran teks</p>
            <p className="text-xs text-tinta-redup">Besar memperbesar seluruh tampilan sekitar 12%.</p>
          </div>
          <Segmented label="Ukuran teks" value={prefs.textSize} onValueChange={(value) => setPref('textSize', value)} options={sizeOptions} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Baris per halaman</p>
            <p className="text-xs text-tinta-redup">Bawaan: Stok 50 baris; Penjualan dan Riwayat 20 baris.</p>
          </div>
          <Segmented
            label="Baris per halaman"
            value={String(prefs.rows)}
            onValueChange={(value) => setPref('rows', value === 'auto' ? 'auto' : Number(value))}
            options={rowOptions}
          />
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={reset} disabled={isDefault}>
            Kembalikan ke bawaan
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
