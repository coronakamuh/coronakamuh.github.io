import { Segmented } from '@/components/ui/segmented'
import { SettingGroup, SettingRow } from '@/features/pengaturan/setting-ui'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/lib/preferences'
import { ACCENT_OPTIONS, DEFAULT_PREFS } from '@/lib/prefs'

const themeOptions = [
  { value: 'terang', label: 'Terang' },
  { value: 'gelap', label: 'Gelap' },
  { value: 'sistem', label: 'Sistem' },
]
const sizeOptions = [
  { value: 'kecil', label: '15' },
  { value: 'normal', label: '16' },
  { value: 'besar', label: 'Besar' },
]
const rowOptions = [
  { value: 'auto', label: 'Bawaan 7' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '50', label: '50' },
]

/** Preferensi hanya berlaku di perangkat ini (disimpan di browser), tidak mengubah database. */
export function PreferensiCard() {
  const { prefs, setPref, reset } = usePreferences()
  const isDefault =
    prefs.textSize === DEFAULT_PREFS.textSize && prefs.rows === DEFAULT_PREFS.rows && prefs.theme === DEFAULT_PREFS.theme && prefs.accent === DEFAULT_PREFS.accent
  return (
    <SettingGroup
      title="Tampilan"
      action={
        <button
          type="button"
          onClick={reset}
          disabled={isDefault}
          className="text-xs font-semibold text-pena transition-opacity disabled:pointer-events-none disabled:opacity-0"
        >
          Kembalikan ke bawaan
        </button>
      }
    >
      <SettingRow label="Tema" hint="Sistem mengikuti pengaturan terang atau gelap di perangkat. Hanya berlaku di perangkat ini.">
        <Segmented label="Tema" size="sm" value={prefs.theme} onValueChange={(value) => setPref('theme', value)} options={themeOptions} />
      </SettingRow>
      <SettingRow label="Warna aksen" hint="Warna tombol, tab aktif, dan grafik.">
        <div role="radiogroup" aria-label="Warna aksen" className="flex items-center gap-0.5">
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
                className="flex size-7 items-center justify-center rounded-full"
              >
                <span
                  className={cn('size-5 rounded-full border border-black/10 transition-shadow', selected && 'ring-2 ring-pena ring-offset-2 ring-offset-lembar')}
                  style={{ background: option.color }}
                />
              </button>
            )
          })}
        </div>
      </SettingRow>
      <SettingRow label="Ukuran teks" hint="Ukuran huruf dasar dalam piksel: 15, 16 (bawaan), atau Besar (18). Seluruh tampilan ikut menyesuaikan.">
        <Segmented label="Ukuran teks" size="sm" value={prefs.textSize} onValueChange={(value) => setPref('textSize', value)} options={sizeOptions} />
      </SettingRow>
      <SettingRow label="Baris per halaman" hint="Bawaan: 7 baris per halaman di Stok, Penjualan, dan Riwayat.">
        <Segmented
          label="Baris per halaman"
          size="sm"
          value={String(prefs.rows)}
          onValueChange={(value) => setPref('rows', value === 'auto' ? 'auto' : Number(value))}
          options={rowOptions}
        />
      </SettingRow>
    </SettingGroup>
  )
}
