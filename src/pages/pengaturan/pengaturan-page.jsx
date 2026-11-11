import * as Tabs from '@radix-ui/react-tabs'
import { ChevronRight, Settings } from 'lucide-react'
import { PageTitle } from '@/components/layout/page-title'
import { BrandTarget } from '@/features/pengaturan/brand-target'
import { CadanganData } from '@/features/pengaturan/cadangan-data'
import { HapusBarang } from '@/features/pengaturan/hapus-barang'
import { GantiPassword } from '@/features/pengaturan/ganti-password'
import { IdentitasInfo } from '@/features/pengaturan/identitas-card'
import { PreferensiCard } from '@/features/pengaturan/preferensi-card'
import { ProfilCard } from '@/features/pengaturan/profil-card'
import { Disclosure, SettingGroup } from '@/features/pengaturan/setting-ui'
import { UjiKoneksi } from '@/features/pengaturan/uji-koneksi'
import { useAuth } from '@/lib/auth-context'

const tabClass =
  'h-9 rounded-lg text-sm font-semibold text-tinta-redup transition-colors hover:text-tinta data-[state=active]:bg-lembar data-[state=active]:text-pena data-[state=active]:shadow-sm'

export function PengaturanPage() {
  const { signOut } = useAuth()

  return (
    <div className="space-y-4">
      <PageTitle icon={Settings} title="Pengaturan" description="Tampilan, brand dan target, serta akun" />

      <Tabs.Root defaultValue="umum" className="max-w-3xl">
        <Tabs.List aria-label="Bagian pengaturan" className="grid grid-cols-3 gap-1 rounded-xl bg-garis-halus p-1">
          <Tabs.Trigger value="umum" className={tabClass}>
            Umum
          </Tabs.Trigger>
          <Tabs.Trigger value="brand" className={tabClass}>
            Brand
          </Tabs.Trigger>
          <Tabs.Trigger value="akun" className={tabClass}>
            Akun &amp; Data
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="umum" className="mt-4 flex flex-col gap-4 outline-none">
          <ProfilCard />
          <PreferensiCard />
          <SettingGroup title="Tentang">
            <Disclosure title="Tentang aplikasi">
              <IdentitasInfo />
            </Disclosure>
          </SettingGroup>
        </Tabs.Content>

        <Tabs.Content value="brand" className="mt-4 outline-none">
          <BrandTarget />
        </Tabs.Content>

        <Tabs.Content value="akun" className="mt-4 flex flex-col gap-4 outline-none">
          <SettingGroup title="Akun">
            <Disclosure title="Ganti password">
              <p className="mb-3 text-xs text-tinta-redup">Akun yang sama dipakai di aplikasi lama.</p>
              <GantiPassword />
            </Disclosure>
          </SettingGroup>
          <SettingGroup title="Data">
            <CadanganData />
            <HapusBarang />
            <UjiKoneksi />
          </SettingGroup>
          <SettingGroup title="Sesi">
            <button
              type="button"
              onClick={signOut}
              title="Keluar hanya dari perangkat ini"
              className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 text-left text-sm font-medium text-bahaya transition-colors hover:bg-garis-halus/60"
            >
              Keluar dari perangkat ini
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </SettingGroup>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
