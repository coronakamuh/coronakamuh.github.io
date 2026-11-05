// Fungsi tanggal untuk pemilih tanggal. Nilai tanggal disimpan sebagai teks "YYYY-MM-DD"
// memakai zona waktu perangkat, supaya tidak bergeser sehari karena UTC.

export const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// Pekan dimulai hari Senin.
export const weekdayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const pad = (n) => String(n).padStart(2, '0')

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Ubah "YYYY-MM-DD" menjadi Date. Mengembalikan null bila kosong atau tidak valid (misal 2026-02-31). */
export function parseISO(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text ?? '')) return null
  const [year, month, day] = text.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

/** Contoh: "4 Nov 2026". */
export function formatDisplay(text) {
  const date = parseISO(text)
  if (!date) return ''
  return `${date.getDate()} ${monthNames[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`
}

/** Contoh: "4 November 2026". Untuk label pembaca layar. */
export function formatLong(date) {
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

/** 42 tanggal (6 pekan) yang menutupi satu bulan, mulai hari Senin. Tinggi kalender jadi selalu sama. */
export function monthGrid(year, month) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => new Date(year, month, 1 - offset + index))
}

/** Tanggal hari ini di Jakarta (WIB) sebagai "YYYY-MM-DD", tidak bergantung zona waktu perangkat. */
export function todayISO() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

/** Tambah (atau kurangi) hari pada teks tanggal "YYYY-MM-DD". */
export function addDaysISO(text, days) {
  const date = new Date(`${text}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Awal bulan ini dan awal bulan berikutnya (batas atas tidak termasuk) untuk tanggal tertentu. */
export function monthRange(text) {
  const [year, month] = text.split('-').map(Number)
  const next = month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`
  return { start: `${year}-${pad(month)}-01`, next }
}

/** "2026-11-04" menjadi "4/11". */
export function shortDayMonth(text) {
  const [, month, day] = text.split('-').map(Number)
  return `${day}/${month}`
}

/** Contoh: "6 Nov 2026, 05.18" (WIB). Untuk waktu dari server (ISO). Kosong bila tidak valid. */
export function formatDateTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  return `${Number(parts.day)} ${monthNames[Number(parts.month) - 1].slice(0, 3)} ${parts.year}, ${parts.hour}.${parts.minute}`
}
