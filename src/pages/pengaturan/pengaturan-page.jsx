import { Settings, Tags } from 'lucide-react'
import { PageTitle } from '@/components/layout/page-title'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorNotice } from '@/components/ui/notice'
import { CadanganData } from '@/features/pengaturan/cadangan-data'
import { GantiPassword } from '@/features/pengaturan/ganti-password'
import { IdentitasInfo } from '@/features/pengaturan/identitas-card'
import { KelolaBrand } from '@/features/pengaturan/kelola-brand'
import { PreferensiCard } from '@/features/pengaturan/preferensi-card'
import { ProfilCard } from '@/features/pengaturan/profil-card'
import { Disclosure, SettingGroup } from '@/features/pengaturan/setting-ui'
import { TargetEditor } from '@/features/pengaturan/target-editor'
import { UjiKoneksi } from '@/features/pengaturan/uji-koneksi'
import { useAsync } from '@/hooks/use-async'
import { getTargetRows } from '@/services/queries'

export function PengaturanPage() {
  const { data, error, loading, reload } = useAsync(getTargetRows, [])

  return (
    <div className="space-y-4">
      <PageTitle icon={Settings} title="Pengaturan" description="Profil, tampilan, target brand, dan akun" />

      <div className="flex max-w-3xl flex-col gap-4">
        <ProfilCard />
        <PreferensiCard />

        <KelolaBrand onChanged={reload} />

        <SettingGroup title="Target penjualan brand">
          <p className="px-3.5 py-2 text-xs text-tinta-redup">Target omzet per bulan. Kosongkan isian untuk menandai belum diatur.</p>
          {error ? (
            <div className="px-3.5 py-3">
              <ErrorNotice error={error} onRetry={reload} />
            </div>
          ) : null}
          {data && data.length > 0 ? (
            <TargetEditor rows={data} onSaved={reload} />
          ) : !error ? (
            <EmptyState icon={Tags} title={loading ? 'Memuat data' : 'Belum ada brand aktif'} />
          ) : null}
        </SettingGroup>

        <SettingGroup title="Akun dan sistem">
          <Disclosure title="Cadangan data">
            <CadanganData />
          </Disclosure>
          <Disclosure title="Ganti password">
            <p className="mb-3 text-xs text-tinta-redup">Akun yang sama dipakai di aplikasi lama.</p>
            <GantiPassword />
          </Disclosure>
          <Disclosure title="Uji koneksi database">
            <p className="mb-3 text-xs text-tinta-redup">Memeriksa bahwa data bisa dibaca. Hanya membaca, tidak mengubah apa pun.</p>
            <UjiKoneksi />
          </Disclosure>
          <Disclosure title="Tentang aplikasi">
            <IdentitasInfo />
          </Disclosure>
        </SettingGroup>
      </div>
    </div>
  )
}
