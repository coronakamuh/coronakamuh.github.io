import { ArrowLeftRight, Boxes, LayoutDashboard, Settings, ShoppingCart } from 'lucide-react'

// Menu utama aplikasi. `id` dipakai sebagai alamat halaman: #/dashboard, #/penjualan, dst.
export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'penjualan', label: 'Penjualan', icon: ShoppingCart },
  { id: 'stok', label: 'Stok Barang', icon: Boxes },
  { id: 'riwayat', label: 'Riwayat In/Out', icon: ArrowLeftRight },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
]
