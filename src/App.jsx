import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { useHashRoute } from '@/lib/use-hash-route'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
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

export default function App() {
  const route = useHashRoute()
  const Page = pages[route]

  return (
    <>
      <AppShell route={route}>
        <Page />
      </AppShell>
      <Toaster position="top-center" closeButton />
    </>
  )
}
