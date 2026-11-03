import { ArrowLeftRight, Boxes, ChartColumn, Package, Receipt } from 'lucide-react'

// Modul yang direncanakan. Ini daftar rencana, belum fitur yang berjalan.
export const plannedModules = [
  {
    id: 'penjualan',
    name: 'Penjualan',
    description: 'Catat transaksi penjualan.',
    icon: Receipt,
  },
  {
    id: 'barang',
    name: 'Barang',
    description: 'Kelola daftar barang.',
    icon: Package,
  },
  {
    id: 'stok',
    name: 'Stok',
    description: 'Pantau jumlah stok tiap barang.',
    icon: Boxes,
  },
  {
    id: 'mutasi',
    name: 'Mutasi',
    description: 'Catat barang masuk, keluar, dan berpindah.',
    icon: ArrowLeftRight,
  },
  {
    id: 'laporan',
    name: 'Laporan',
    description: 'Lihat ringkasan penjualan dan stok.',
    icon: ChartColumn,
  },
]
