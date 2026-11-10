import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Segmented } from '@/components/ui/segmented'
import { usePreferences } from '@/lib/preferences'
import { cn } from '@/lib/cn'
import { ACCENT_OPTIONS, DEFAULT_PREFS } from '@/lib/prefs'

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
  const isDefault = prefs.textSize === DEFAULT_PREFS.textSize && prefs.rows === DEFAULT_PREFS.rows && prefs.theme === DEFAULT_PREFS.theme && prefs.accent === DEFAULT_PREFS.accent
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
            <p className="text-sm font-medium">Warna aksen</p>
            <p className="text-xs text-tinta-redup">Warna tombol, tab aktif, dan grafik. Berlaku di tema terang maupun gelap.</p>
          </div>
          <div role="radiogroup" aria-label="Warna aksen" className="flex flex-wrap items-center gap-2">
            {ACCENT_OPTIONS.map((option) => {
              const selected = prefs.accent === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.label}
                  title={option.label}
                  onClick={() => setPref('accent', option.value)}
                  className={cn(
                    'flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors',
                    selected ? 'border-pena bg-pena/10 text-pena' : 'border-garis text-tinta-redup hover:bg-garis-halus hover:text-tinta',
                  )}
                >
                  <span className="size-4 rounded-full border border-black/10" style={{ background: option.color }} aria-hidden="true" />
                  {option.label}
                </button>
              )
            })}
          </div>
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
