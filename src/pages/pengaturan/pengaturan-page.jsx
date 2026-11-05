import { LogOut, Tags } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorNotice } from '@/components/ui/notice'
import { GantiPassword } from '@/features/pengaturan/ganti-password'
import { IdentitasCard } from '@/features/pengaturan/identitas-card'
import { PreferensiCard } from '@/features/pengaturan/preferensi-card'
import { ProfilCard } from '@/features/pengaturan/profil-card'
import { UjiKoneksi } from '@/features/pengaturan/uji-koneksi'
import { TargetEditor } from '@/features/pengaturan/target-editor'
import { useAsync } from '@/hooks/use-async'
import { useAuth } from '@/lib/auth-context'
import { getTargetRows } from '@/services/queries'

export function PengaturanPage() {
  const { signOut } = useAuth()
  const { data, error, loading, reload } = useAsync(getTargetRows, [])

  return (
    <>
      <PageHeader title="Pengaturan" description="Identitas, profil, tampilan, target brand, dan akun." />

      <div className="flex max-w-3xl flex-col gap-6">
        <IdentitasCard />
        <ProfilCard />
        <PreferensiCard />

        <Card>
          <CardHeader title="Target Penjualan Brand" description="Target omzet per bulan. Kosongkan isian untuk menandai belum diatur." />
          {error ? (
            <CardBody>
              <ErrorNotice error={error} onRetry={reload} />
            </CardBody>
          ) : null}
          {data && data.length > 0 ? (
            <TargetEditor rows={data} onSaved={reload} />
          ) : !error ? (
            <EmptyState icon={Tags} title={loading ? 'Memuat data' : 'Belum ada brand aktif'} />
          ) : null}
        </Card>

        <Card>
          <CardHeader title="Pengaturan Akun" description="Ganti password akun ini. Akun yang sama dipakai di aplikasi lama." />
          <GantiPassword />
        </Card>

        {/* Terpisah dari form di atas supaya klik ganda pada "Ganti Password" tidak pernah mengenai Keluar saat tata letak bergeser. */}
        <Card>
          <CardHeader title="Sesi" description="Keluar hanya dari perangkat ini. Perangkat lain dan aplikasi lama tetap masuk." />
          <CardBody>
            <Button variant="outline" onClick={signOut}>
              <LogOut />
              Keluar
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Koneksi Database" description="Memeriksa bahwa data bisa dibaca. Hanya membaca, tidak mengubah apa pun." />
          <UjiKoneksi />
        </Card>
      </div>
    </>
  )
}
