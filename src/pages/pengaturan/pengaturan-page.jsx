import { LogOut, Save, Tags } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Field, Input } from '@/components/ui/field'
import { ErrorNotice } from '@/components/ui/notice'
import { useAsync } from '@/hooks/use-async'
import { site } from '@/config/site'
import { useAuth } from '@/lib/auth-context'
import { formatRupiah } from '@/lib/format'
import { getTargets } from '@/services/queries'

const targetColumns = [
  { key: 'brand', label: 'Brand' },
  { key: 'target', label: 'Target penjualan', align: 'right', render: (row) => (row.target === null ? 'Belum diatur' : formatRupiah(row.target)) },
]

export function PengaturanPage() {
  const { email, profile, signOut } = useAuth()
  const { data, error, loading, reload } = useAsync(getTargets, [])

  function handleSave(event) {
    event.preventDefault()
    toast.info('Belum bisa disimpan', { description: 'Tahap ini mode baca saja. Penyimpanan pengaturan diaktifkan pada tahap berikutnya.' })
  }

  return (
    <>
      <PageHeader title="Pengaturan" description="Profil aplikasi, target penjualan, dan akun." />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader title="Profil Aplikasi" description="Nama yang tampil di aplikasi dan laporan." />
          <form onSubmit={handleSave} className="flex flex-col gap-4 p-4 pt-0 sm:p-5 sm:pt-0">
            <Field label="Nama aplikasi" htmlFor="nama-aplikasi">
              <Input id="nama-aplikasi" defaultValue={site.name} />
            </Field>
            <div>
              <Button type="submit">
                <Save />
                Simpan Profil
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Target Penjualan Brand" description="Target per brand (hanya dibaca pada tahap ini)." />
          {error ? (
            <CardBody>
              <ErrorNotice error={error} onRetry={reload} />
            </CardBody>
          ) : null}
          <DataTable
            caption="Target penjualan per brand"
            columns={targetColumns}
            rows={data ?? []}
            empty={{ icon: Tags, title: loading ? 'Memuat data' : 'Belum ada target', description: loading ? '' : 'Target per brand belum diatur di database.' }}
          />
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
