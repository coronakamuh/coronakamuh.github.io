# coronakamuh.github.io

Dhouse Digital: aplikasi Inventory & Sales Management untuk pencatatan penjualan, pengelolaan barang, stok, mutasi barang, dan laporan.

Status: **Tahap 2, antarmuka dan navigasi.** Semua halaman masih kosong (empty state). Belum ada database dan belum ada fitur bisnis yang berfungsi.

## Teknologi

React 19, Vite, JavaScript, Tailwind CSS v4, Radix UI, Lucide React, Sonner (toast). Supabase akan ditambahkan di tahap selanjutnya.

## Menjalankan di komputer sendiri

Butuh Node.js 20.19 atau lebih baru.

```bash
npm install
npm run dev      # jalankan versi pengembangan
npm run build    # buat hasil build di folder dist
npm run preview  # coba hasil build
```

## Struktur folder

```
src/
  components/
    brand/     lambang dan identitas
    charts/    grafik (bar-chart)
    layout/    kerangka aplikasi (app-shell, sidebar-nav, bottom-nav, page-header, container)
    ui/        komponen dasar (button, card, stat-card, field, data-table,
               empty-state, segmented, dialog, select, date-picker, separator)
  config/      informasi aplikasi (site) dan menu (navigation)
  features/    modul bisnis, satu folder per modul (masih kosong)
  hooks/       custom hook (masih kosong)
  lib/         fungsi bantu (cn, date, use-hash-route)
  pages/       satu folder per halaman: dashboard, penjualan, stok, riwayat, pengaturan
  services/    koneksi ke layanan luar seperti Supabase (masih kosong)
  styles/      gaya global dan token desain Tailwind
```

Alamat halaman memakai hash (`#/dashboard`, `#/penjualan`, `#/stok`, `#/riwayat`, `#/pengaturan`) agar berjalan di GitHub Pages tanpa pengaturan server.

## Deployment

Setiap push menjalankan build lewat GitHub Actions (`.github/workflows/deploy.yml`). Push ke branch `main` juga memublikasikan situs ke GitHub Pages.