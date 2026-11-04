import { LogOut, Tags } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorNotice } from '@/components/ui/notice'
import { TargetEditor } from '@/features/pengaturan/target-editor'
import { useAsync } from '@/hooks/use-async'
import { useAuth } from '@/lib/auth-context'
import { getTargetRows } from '@/services/queries'

export function PengaturanPage() {
  const { email, profile, signOut } = useAuth()
  const { data, error, loading, reload } = useAsync(getTargetRows, [])

  return (
    <>
      <PageHeader title="Pengaturan" description="Target penjualan brand dan akun." />

      <div className="flex max-w-3xl flex-col gap-6">
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
          <CardHeader title="Pengaturan Akun" description="Akun yang sedang masuk." />
          <CardBody className="flex flex-col gap-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className="text-tinta-redup">Email</dt>
              <dd className="min-w-0 break-words">{email}</dd>
              <dt className="text-tinta-redup">Username</dt>
              <dd>{profile?.username || '—'}</dd>
              <dt className="text-tinta-redup">Peran</dt>
              <dd>Admin</dd>
            </dl>
            <div>
              <Button variant="outline" onClick={signOut}>
                <LogOut />
                Keluar
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
