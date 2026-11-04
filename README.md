# coronakamuh.github.io

Dhouse Digital: aplikasi Inventory & Sales Management untuk pencatatan penjualan, pengelolaan barang, stok, mutasi barang, dan laporan.

Status: **Tahap 4, tersambung ke Supabase dalam mode baca saja.** Login (username atau email), Dashboard, Stok Barang, Riwayat In/Out, daftar Penjualan, dan target brand membaca data asli. Menyimpan, mengubah, dan ekspor belum aktif.

## Teknologi

React 19, Vite, JavaScript, Tailwind CSS v4, Radix UI, Lucide React, Sonner (toast). Supabase (`@supabase/supabase-js`) dipakai dengan kunci publishable dan RLS; hanya admin di tabel `app_admins` yang bisa membaca data. Jangan pernah menaruh kunci `service_role` atau secret di repo ini.

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
  hooks/       custom hook (use-async)
  lib/         fungsi bantu (cn, date, format, auth-context, use-hash-route)
  pages/       satu folder per halaman: dashboard, penjualan, stok, riwayat, pengaturan
  services/    Supabase: klien, login, dan query baca saja (queries.js)
  styles/      gaya global dan token desain Tailwind
```

Alamat halaman memakai hash (`#/dashboard`, `#/penjualan`, `#/stok`, `#/riwayat`, `#/pengaturan`) agar berjalan di GitHub Pages tanpa pengaturan server.

## Deployment

Setiap push menjalankan build lewat GitHub Actions (`.github/workflows/deploy.yml`). Push ke branch `main` juga memublikasikan situs ke GitHub Pages.