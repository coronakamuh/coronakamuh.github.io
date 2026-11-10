import { LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { formatDateTime } from '@/lib/date'

/** Profil ringkas akun yang sedang masuk (dikelola di Supabase Auth dan daftar admin), dengan tombol Keluar. */
export function ProfilCard() {
  const { email, profile, lastSignIn, signOut } = useAuth()
  const username = profile?.username || ''
  const initial = (username || email || '?')[0].toUpperCase()
  const last = formatDateTime(lastSignIn)
  return (
    <div className="dh-card flex items-center gap-3 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-pena/10 text-base font-bold text-pena" aria-hidden="true">
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <span className="truncate">{username || '—'}</span>
          <Badge tone="info">Admin</Badge>
        </p>
        <p className="truncate text-xs text-tinta-redup">{email || '—'}</p>
        {last ? <p className="truncate text-[11px] text-tinta-redup">Masuk terakhir {last}</p> : null}
      </div>
      <Button variant="outline" size="sm" onClick={signOut} title="Keluar hanya dari perangkat ini">
        <LogOut />
        Keluar
      </Button>
    </div>
  )
}
