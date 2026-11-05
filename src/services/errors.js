// Menerjemahkan pesan database menjadi kalimat yang jelas untuk pengguna.
export class AppError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

export const SESSION_EVENT = 'dhouse:session-expired'

/** Token login sudah kedaluwarsa atau tidak valid (PostgREST: PGRST301 / "JWT expired"). */
export function isSessionError(error) {
  return error?.code === 'PGRST301' || error?.status === 401 || /JWT expired|invalid JWT|JWT is expired/i.test(error?.message ?? '')
}

export function friendlyError(error) {
  const message = error?.message ?? 'Terjadi kesalahan.'
  if (isSessionError(error)) {
    // Memberi tahu AuthProvider agar menyegarkan sesi, atau mengembalikan ke layar masuk bila gagal.
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_EVENT))
    return new AppError('Sesi login berakhir. Memeriksa ulang sesi Anda; bila diminta, masuk lagi.', 'session')
  }
  if (/belum memiliki brand aktif/i.test(message)) {
    return new AppError('Barang ini belum punya brand aktif, jadi penjualan ditolak.', 'brand')
  }
  const stale = message.match(/Stok berubah menjadi ([\d.,-]+)/i)
  if (stale) {
    const value = stale[1].replace(/[.,]+$/, '') // titik penutup kalimat ikut tertangkap
    const failure = new AppError(`Stok di database ${value}, berbeda dari yang tampil. Angka sudah diperbarui, periksa lagi lalu simpan.`, 'stale')
    failure.stock = Number(value)
    return failure
  }
  if (/Stok sudah sesuai/i.test(message)) return new AppError('Stok sudah sesuai, tidak ada yang disesuaikan.', 'noop')
  if (/row-level security|permission denied/i.test(message)) return new AppError('Akun ini tidak punya izin untuk menyimpan.', 'denied')
  if (/Failed to fetch|NetworkError|network/i.test(message)) return new AppError('Tidak bisa terhubung. Periksa internet lalu coba lagi.', 'network')
  return new AppError(message, 'unknown')
}
