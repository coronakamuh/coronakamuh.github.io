import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { PreferencesProvider, usePreferences } from '@/lib/preferences'
import { configProblem } from '@/config/supabase'
import { AppShell } from '@/components/layout/app-shell'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { useHashRoute } from '@/lib/use-hash-route'
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard-page').then((module) => ({ default: module.DashboardPage })))
import { AccessErrorScreen, ConfigErrorScreen, NotAdminScreen, SplashScreen } from '@/pages/login/access-screens'
import { LoginPage } from '@/pages/login/login-page'
const PenjualanPage = lazy(() => import('@/pages/penjualan/penjualan-page').then((module) => ({ default: module.PenjualanPage })))
const PengaturanPage = lazy(() => import('@/pages/pengaturan/pengaturan-page').then((module) => ({ default: module.PengaturanPage })))
const RiwayatPage = lazy(() => import('@/pages/riwayat/riwayat-page').then((module) => ({ default: module.RiwayatPage })))
const StokPage = lazy(() => import('@/pages/stok/stok-page').then((module) => ({ default: module.StokPage })))

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
      <Suspense fallback={<SplashScreen />}>
        <Page />
      </Suspense>
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

function ThemedToaster() {
  const { resolvedTheme } = usePreferences()
  return <Toaster theme={resolvedTheme === 'gelap' ? 'dark' : 'light'} position="top-center" closeButton duration={3000} />
}

export default function App() {
  if (configProblem) return <ConfigErrorScreen problem={configProblem} />
  return (
    <PreferencesProvider>
      <AuthProvider>
        <Gate />
        <ThemedToaster />
      </AuthProvider>
    </PreferencesProvider>
  )
}
