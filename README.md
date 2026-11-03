# coronakamuh.github.io

Dhouse Digital: aplikasi Inventory & Sales Management untuk pencatatan penjualan, pengelolaan barang, stok, mutasi barang, dan laporan.

Status: **Tahap 1, fondasi project.** Belum ada fitur bisnis dan belum ada database.

## Teknologi

React 19, Vite, JavaScript, Tailwind CSS v4, Radix UI, Lucide React. Supabase akan ditambahkan di tahap selanjutnya.

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
    layout/    kerangka halaman (header, footer, container)
    ui/        komponen dasar (button, separator)
  config/      informasi aplikasi dan daftar modul
  features/    modul bisnis, satu folder per modul (masih kosong)
  hooks/       custom hook (masih kosong)
  lib/         fungsi bantu
  pages/       halaman, satu folder per halaman
  services/    koneksi ke layanan luar seperti Supabase (masih kosong)
  styles/      gaya global dan token desain Tailwind
```

## Deployment

Setiap push menjalankan build lewat GitHub Actions (`.github/workflows/deploy.yml`). Push ke branch `main` juga memublikasikan situs ke GitHub Pages.