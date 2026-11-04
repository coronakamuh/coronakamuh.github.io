import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { useHashRoute } from '@/lib/use-hash-route'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { AccessErrorScreen, NotAdminScreen, SplashScreen } from '@/pages/login/access-screens'
import { LoginPage } from '@/pages/login/login-page'
import { PenjualanPage } from '@/pages/penjualan/penjualan-page'
import { PengaturanPage } from '@/pages/pengaturan/pengaturan-page'
import { RiwayatPage } from '@/pages/riwayat/riwayat-page'
import { StokPage } from '@/pages/stok/stok-page'

const pages = {
  dashboard: DashboardPage,
  penjualan: PenjualanPage,
  stok: StokPage,
  riwayat: RiwayatPage,
  pengaturan: PengaturanPage,
}

function AuthenticatedApp() {
  const route = useHashRoute()
  const Page = pages[route]
  return (
    <AppShell route={route}>
      <Page />
    </AppShell>
  )
}

/** Penjaga akses: hanya admin yang melihat aplikasi. */
function Gate() {
  const { status } = useAuth()
  switch (status) {
    case 'signedOut':
      return <LoginPage />
    case 'admin':
      return <AuthenticatedApp />
    case 'notAdmin':
      return <NotAdminScreen />
    case 'error':
      return <AccessErrorScreen />
    default:
      return <SplashScreen />
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
      <Toaster position="top-center" closeButton />
    </AuthProvider>
  )
}
