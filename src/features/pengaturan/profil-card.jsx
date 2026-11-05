import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { formatDateTime } from '@/lib/date'

export function ProfilCard() {
  const { email, profile, lastSignIn } = useAuth()
  return (
    <Card>
      <CardHeader title="Profil Pengguna" description="Akun yang sedang masuk. Data ini dikelola di Supabase Auth dan daftar admin." />
      <CardBody>
        <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
          <dt className="text-tinta-redup">Email</dt>
          <dd className="min-w-0 break-words">{email || '—'}</dd>
          <dt className="text-tinta-redup">Username</dt>
          <dd>{profile?.username || '—'}</dd>
          <dt className="text-tinta-redup">Peran</dt>
          <dd>Admin</dd>
          <dt className="text-tinta-redup">Masuk terakhir</dt>
          <dd>{formatDateTime(lastSignIn) || '—'}</dd>
        </dl>
      </CardBody>
    </Card>
  )
}
