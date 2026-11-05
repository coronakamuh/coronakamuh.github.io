import { LogOut, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingBlock } from '@/components/ui/notice'
import { useAuth } from '@/lib/auth-context'

function Centered({ children }) {
  return <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-5">{children}</main>
}

export function SplashScreen() {
  return (
    <Centered>
      <LoadingBlock label="Memuat" />
    </Centered>
  )
}

/** Akun berhasil masuk tetapi emailnya belum terdaftar sebagai admin. */
export function NotAdminScreen() {
  const { email, signOut } = useAuth()
  return (
    <Centered>
      <EmptyState
        icon={ShieldAlert}
        title="Akun ini bukan admin"
        description={`${email} berhasil masuk, tetapi belum terdaftar sebagai admin Dhouse Digital, jadi data tidak ditampilkan.`}
        action={
          <Button variant="outline" onClick={signOut}>
            <LogOut />
            Keluar
          </Button>
        }
      />
    </Centered>
  )
}

/** Gagal memeriksa hak akses (misalnya koneksi putus). */
export function AccessErrorScreen() {
  const { recheck, signOut } = useAuth()
  return (
    <Centered>
      <EmptyState
        icon={ShieldAlert}
        title="Hak akses belum bisa diperiksa"
        description="Periksa koneksi internet, lalu coba lagi."
        action={
          <div className="flex gap-2">
            <Button onClick={recheck}>Coba lagi</Button>
            <Button variant="outline" onClick={signOut}>
              Keluar
            </Button>
          </div>
        }
      />
    </Centered>
  )
}

/** Alamat atau kunci Supabase bermasalah (misalnya kosong atau kunci rahasia). Klien tidak dibuat. */
export function ConfigErrorScreen({ problem }) {
  return (
    <Centered>
      <EmptyState icon={ShieldAlert} title="Konfigurasi Supabase bermasalah" description={problem} />
    </Centered>
  )
}
