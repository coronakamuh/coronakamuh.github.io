# coronakamuh.github.io

Dhouse Digital: aplikasi Inventory & Sales Management untuk pencatatan penjualan, pengelolaan barang, stok, mutasi barang, dan laporan.

Status: **fitur tulis aktif** sesuai pemetaan database. Penjualan (catat dan ubah), barang masuk/keluar/adjust, tambah dan ubah barang, serta target brand disimpan lewat fungsi database yang sudah ada. Tidak ada hapus penjualan, tidak ada hapus barang. Halaman Stok Barang punya detail barang, kebutuhan PO, serta ekspor PDF dan Excel (dibuat di browser, tanpa pustaka tambahan).

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

## Modul Stok Barang

- Stok yang tampil berasal dari view `v_stock` (satu-satunya sumber stok; tidak ada sumber stok kedua).
- Stok minus ditampilkan apa adanya. Kebutuhan PO = `max(0, -stok)`; dihitung dari data yang ada, tidak disimpan.
- Detail barang membaca `barang`, `v_stock`, dan `transaksi` (20 mutasi terbaru). Bila hitungan ulang dengan tanggal mulai berbeda dari `v_stock`, peringatan ditampilkan; angka database tetap dipakai.
- Tambah barang: nama (maks. 150 karakter, tidak boleh kembar), brand, stok awal. Ubah barang: nama dan brand saja. Stok awal tidak bisa diubah dan barang tidak bisa dihapus; koreksi stok lewat Mutasi atau Adjust.
- Ekspor PDF dan Excel memuat semua baris sesuai pencarian dan filter brand yang aktif (bukan hanya halaman yang tampil).

## Modul Penjualan

- Simpan dan koreksi hanya lewat fungsi database `catat_penjualan_atomic` dan `edit_penjualan_atomic` (6 argumen bernama). Satu penjualan = satu transaksi `laku`; koreksi mengubah transaksi yang sama, jadi stok tidak terpotong dua kali. Aplikasi tidak menulis langsung ke `transaksi` atau `barang`.
- Tombol simpan dikunci selama proses berjalan (klik ganda hanya mengirim satu permintaan).
- Sebelum simpan, form menampilkan perkiraan stok dan kebutuhan PO (hanya untuk tanggal hari ini); angka resmi dihitung database saat menyimpan.
- Daftar: kolom Tanggal, Nama Barang, Qty, Harga, Total, Brand, Aksi; filter rentang tanggal dan brand; ringkasan (jumlah penjualan, unit, nilai) mengikuti filter.

## Mutasi stok (masuk, keluar, adjust) dan Riwayat In/Out

- Satu-satunya jalur tulis: fungsi database `catat_transaksi_stok_atomic` (jenis `masuk`, `laku` untuk keluar, `adjust`). Tidak ada sistem adjust kedua dan tidak ada tulis langsung ke `transaksi`.
- Stok yang tampil di form selalu dari database, tidak dihitung di frontend: hari ini dari `v_stock`; tanggal lampau dari penolakan fungsi di atas bila diberi stok harapan yang mustahil (fungsi membandingkan stok sebelum menulis, jadi pemanggilan itu tidak pernah menulis).
- Adjust: isi **stok sebenarnya**; database menyimpan selisih bertanda (+/-), jadi mendukung penambahan dan pengurangan. Stok yang sudah sama ditolak.
- Bila stok berubah saat form terbuka, database menolak, angka terbaru ditampilkan, dan pengguna menyimpan ulang.
- Keluar manual boleh membuat stok minus; minus = kekurangan PO (`max(0, -stok)`).
- Riwayat In/Out: filter tanggal dan jenis (masuk, terjual, keluar manual, koreksi), detail catatan, serta tombol Catat Mutasi yang memakai dialog yang sama dengan halaman Stok Barang.
