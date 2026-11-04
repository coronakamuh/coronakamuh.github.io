// Menerjemahkan pesan database menjadi kalimat yang jelas untuk pengguna.
export class AppError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

export function friendlyError(error) {
  const message = error?.message ?? 'Terjadi kesalahan.'
  if (/belum memiliki brand aktif/i.test(message)) {
    return new AppError('Barang ini belum punya brand aktif, jadi penjualan ditolak.', 'brand')
  }
  const stale = message.match(/Stok berubah menjadi ([\d.,-]+)/i)
  if (stale) return new AppError(`Stok berubah menjadi ${stale[1]} karena ada transaksi lain. Data sudah dimuat ulang, periksa lagi lalu simpan.`, 'stale')
  if (/Stok sudah sesuai/i.test(message)) return new AppError('Stok sudah sesuai, tidak ada yang disesuaikan.', 'noop')
  if (/row-level security|permission denied/i.test(message)) return new AppError('Akun ini tidak punya izin untuk menyimpan.', 'denied')
  if (/Failed to fetch|NetworkError|network/i.test(message)) return new AppError('Tidak bisa terhubung. Periksa internet lalu coba lagi.', 'network')
  return new AppError(message, 'unknown')
}
