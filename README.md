# coronakamuh.github.io

Dhouse Digital: aplikasi Inventory & Sales Management untuk pencatatan penjualan, pengelolaan barang, stok, mutasi barang, dan laporan.

Status: **fitur tulis aktif** sesuai pemetaan database. Penjualan (catat dan ubah), barang masuk/keluar/adjust, tambah dan ubah barang, serta target brand disimpan lewat fungsi database yang sudah ada. Tidak ada hapus penjualan, tidak ada hapus barang. Ekspor memakai CSV.

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
  hooks/       custom hook (use-async, use-mutation)
  lib/         fungsi bantu (cn, date, format, stock, validation, export, auth-context, use-hash-route)
  pages/       satu folder per halaman: dashboard, penjualan, stok, riwayat, pengaturan
  services/    Supabase: klien, login, query baca (queries.js, stock.js) dan penulisan (sales, movements, items, brands)
  features/    formulir dan dialog per modul (penjualan, stok, pengaturan)
  styles/      gaya global dan token desain Tailwind
```

Alamat halaman memakai hash (`#/dashboard`, `#/penjualan`, `#/stok`, `#/riwayat`, `#/pengaturan`) agar berjalan di GitHub Pages tanpa pengaturan server.

## Deployment

Setiap push menjalankan build lewat GitHub Actions (`.github/workflows/deploy.yml`). Push ke branch `main` juga memublikasikan situs ke GitHub Pages.
## Aturan data (ringkas)

- Database tidak diubah oleh repo ini; semua penulisan lewat RPC `catat_penjualan_atomic`, `edit_penjualan_atomic` (6 argumen), `catat_transaksi_stok_atomic`, dan insert/update/upsert biasa untuk `barang` dan `target_penjualan_brand`.
- Stok dihitung dengan rumus bertanggal yang sama seperti database (`src/lib/stock.js`); stok negatif berarti kekurangan pre-order.
- Tanggal memakai WIB; tanggal masa depan ditolak aplikasi.
- Pemetaan lengkap: dokumen "Pemetaan Database ke Fitur" (Claude Doc).

## Konfigurasi Supabase (environment variable)

- `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` dibaca Vite. Untuk build di GitHub Actions nilainya ada di `.env.production`; untuk komputer sendiri salin `.env.example` menjadi `.env.local`.
- Kedua nilai itu publik (kunci publishable memang untuk browser); data dilindungi RLS. Kunci `service_role` atau `secret` tidak boleh ada di repo; konfigurasi yang berisi kunci seperti itu ditolak saat aplikasi dibuka (`src/config/supabase-check.js`).
- Pengaturan, bagian "Koneksi Database", menjalankan uji koneksi baca saja (menghitung baris tiap sumber data).

## Autentikasi

- Memakai Supabase Auth yang sudah ada (email + password); tidak ada sistem Auth kedua. Login dengan username lewat edge function `login-username` (sama seperti aplikasi lama), atau langsung dengan email.
- Hak akses: hanya email yang terdaftar di tabel `app_admins` (dicek RLS di database). Akun lain yang berhasil masuk hanya melihat layar "bukan admin".
- Seluruh halaman dilindungi di `App.jsx` (`Gate`); tanpa login hanya layar Masuk yang tampil dan tidak ada data yang diminta.
- Sesi disimpan oleh Supabase (localStorage) dan disegarkan otomatis. Bila sesi berakhir, aplikasi kembali ke layar Masuk dengan pesan; bila data ditolak karena token kedaluwarsa, sesi disegarkan dulu.
- Keluar memakai `scope: 'local'`: hanya perangkat ini yang keluar, aplikasi lama dan perangkat lain tidak ikut terputus.
