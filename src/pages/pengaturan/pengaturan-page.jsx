import { Save, Tags, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Field, Input } from '@/components/ui/field'
import { site } from '@/config/site'

export function PengaturanPage() {
  function handleSave(event) {
    event.preventDefault()
    toast.info('Belum bisa disimpan', {
      description: 'Penyimpanan pengaturan tersedia setelah database disambungkan.',
    })
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
            <Field label="Nama usaha" htmlFor="nama-usaha">
              <Input id="nama-usaha" placeholder="Belum diisi" />
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
          <CardHeader title="Target Penjualan Brand" description="Target per brand untuk memantau performa." />
          <CardBody>
            <EmptyState
              icon={Tags}
              title="Belum ada brand"
              description="Brand muncul di sini setelah barang ditambahkan. Target bisa diatur per brand."
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Pengaturan Akun" description="Data akun yang dipakai untuk masuk." />
          <CardBody>
            <EmptyState
              icon={UserRound}
              title="Akun belum tersedia"
              description="Pengaturan akun aktif setelah fitur masuk (login) ditambahkan."
            />
          </CardBody>
        </Card>
      </div>
    </>
  )
}
