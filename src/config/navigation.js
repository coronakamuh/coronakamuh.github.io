import { ArrowLeftRight, Boxes, LayoutDashboard, Settings, ShoppingCart } from 'lucide-react'

// Menu utama aplikasi. `id` dipakai sebagai alamat halaman: #/dashboard, #/penjualan, dst.
// `shortLabel` dipakai di bilah bawah HP yang sempit.
export const navItems = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'penjualan', label: 'Penjualan', shortLabel: 'Penjualan', icon: ShoppingCart },
  { id: 'stok', label: 'Stok Barang', shortLabel: 'Stok', icon: Boxes },
  { id: 'riwayat', label: 'Riwayat In/Out', shortLabel: 'Riwayat', icon: ArrowLeftRight },
  { id: 'pengaturan', label: 'Pengaturan', shortLabel: 'Setelan', icon: Settings },
]
