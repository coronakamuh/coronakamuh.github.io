import { formatDisplay, todayISO } from '@/lib/date'
import { downloadFile } from '@/lib/download'
import { buildReportPdf, buildReportXlsx } from '@/lib/export-laporan'
import { formatRupiah } from '@/lib/format'

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** Keterangan filter yang dipakai, dicantumkan di PDF dan nama berkas. */
export function describeFilter({ from, to, brand }) {
  const parts = []
  if (from || to) parts.push(`Tanggal: ${from ? formatDisplay(from) : 'awal'} - ${to ? formatDisplay(to) : 'hari ini'}`)
  if (brand) parts.push(`Brand: ${brand}`)
  return parts.length ? parts.join(' · ') : 'Semua penjualan'
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** Bila filter tepat satu bulan (tanggal 1 sampai akhir bulan atau hari ini), kembalikan { year, month } (month 1-12). */
function wholeMonth({ from, to }) {
  if (!from || !to || from.slice(0, 7) !== to.slice(0, 7) || from.slice(8, 10) !== '01') return null
  const year = Number(from.slice(0, 4))
  const month = Number(from.slice(5, 7))
  const lastDay = new Date(year, month, 0).getDate()
  const endsMonth = Number(to.slice(8, 10)) === lastDay || to === todayISO()
  return endsMonth ? { year, month } : null
}

/** Judul laporan: "November, 2026" untuk satu bulan penuh, "Semua Periode", atau rentang tanggal. */
export function reportTitle(filter) {
  const whole = wholeMonth(filter)
  if (whole) return `${MONTHS[whole.month - 1]}, ${whole.year}`
  if (!filter.from && !filter.to) return 'Semua Periode'
  return `${filter.from ? formatDisplay(filter.from) : 'Awal'} - ${filter.to ? formatDisplay(filter.to) : formatDisplay(todayISO())}`
}

const slug = (text) => String(text).replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim()

/** Nama berkas: Penjualan[-Brand][-YYYY-MM | -dari_sampai]. */
export function fileName(filter, ext) {
  const whole = wholeMonth(filter)
  let name = 'Penjualan'
  if (filter.brand) name += `-${slug(filter.brand)}`
  if (whole) name += `-${whole.year}-${String(whole.month).padStart(2, '0')}`
  else if (filter.from || filter.to) name += `-${filter.from || 'awal'}_${filter.to || todayISO()}`
  return `${name}.${ext}`
}

const dmy = (date) => (/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}` : date || '-')

/** Kelompok per brand (abjad), lalu per tanggal (paling awal dulu) dengan total harian dan subtotal brand. */
export function groupSales(rows) {
  const byBrand = new Map()
  for (const row of rows) {
    const brand = String(row.brand || '').trim() || 'Tanpa brand'
    const key = brand.toLocaleLowerCase('id-ID')
    if (!byBrand.has(key)) byBrand.set(key, { brand, items: [] })
    byBrand.get(key).items.push(row)
  }
  const groups = [...byBrand.values()].sort((a, b) => a.brand.localeCompare(b.brand, 'id-ID'))
  for (const group of groups) {
    group.items.sort((a, b) => String(a.date).localeCompare(String(b.date)) || a.id - b.id)
    group.days = []
    for (const item of group.items) {
      const last = group.days[group.days.length - 1]
      if (last && last.date === item.date) last.items.push(item)
      else group.days.push({ date: item.date, items: [item] })
    }
    for (const day of group.days) day.total = day.items.reduce((sum, item) => sum + item.total, 0)
    group.subtotal = group.items.reduce((sum, item) => sum + item.total, 0)
  }
  return groups
}

export function totals(rows) {
  return {
    count: rows.length,
    units: rows.reduce((sum, row) => sum + row.qty, 0),
    revenue: rows.reduce((sum, row) => sum + row.total, 0),
  }
}

export function exportSalesExcel(rows, filter) {
  const groups = groupSales(rows)
  const LINE = true
  const head = (c) => ({ b: true, color: 'FFFFFF', fill: '800020', border: LINE, h: c === 3 ? 'center' : c >= 4 ? 'right' : 'left' })
  const align = (c) => (c === 3 ? 'center' : c >= 4 ? 'right' : 'left')
  const blank = (n, s) => Array.from({ length: n }, () => ({ v: '', s }))
  const out = [
    { height: 28, cells: [{ v: '' }, { v: reportTitle(filter), s: { sz: 16, b: true, h: 'left' } }, ...blank(5)] },
    { height: 19, cells: [{ v: '' }, { v: 'CATATAN PENJUALAN', s: { sz: 10, b: true, h: 'left' } }, ...blank(5)] },
    { height: 8, cells: blank(7) },
    { height: 24, cells: ['Tanggal', 'Nama Barang', 'Brand', 'Qty', 'Harga/Unit', 'Total', 'Total Harian'].map((v, c) => ({ v, s: head(c) })) },
  ]
  const merges = ['B1:G1', 'B2:G2']
  const brandStyle = { sz: 9, b: true, fill: 'F4E5EA', border: LINE, h: 'left' }
  const subStyle = (c) => ({ b: true, fill: 'FAF2F5', border: LINE, h: align(c), rp: c >= 4 })
  let grand = 0
  for (const group of groups) {
    out.push({ height: 22, cells: [{ v: '', s: brandStyle }, { v: group.brand.toUpperCase(), s: brandStyle }, ...blank(5, brandStyle)] })
    merges.push(`B${out.length}:G${out.length}`)
    for (const day of group.days) {
      const first = out.length + 1
      day.items.forEach((item, n) => {
        const st = (c) => ({ fill: 'FFFFFF', border: LINE, h: align(c), rp: c >= 4, wrap: c === 1 })
        out.push({
          cells: [
            { v: n === 0 ? dmy(day.date) : '', s: st(0) },
            { v: item.item, s: st(1) },
            { v: group.brand, s: st(2) },
            { v: item.qty, s: st(3) },
            { v: item.price, s: st(4) },
            { v: item.total, s: st(5) },
            { v: n === 0 ? day.total : '', s: st(6) },
          ],
        })
      })
      if (day.items.length > 1) merges.push(`A${first}:A${out.length}`, `G${first}:G${out.length}`)
    }
    out.push({ cells: [...blank(5, subStyle(0)), { v: `TOTAL ${group.brand}`, s: subStyle(5) }, { v: group.subtotal, s: subStyle(6) }] })
    grand += group.subtotal
  }
  const grandStyle = (c) => ({ b: true, fill: 'E9CBD5', border: LINE, h: c === 6 ? 'right' : 'right', rp: c === 6 })
  out.push({ cells: [{ v: 'TOTAL SEMUA', s: grandStyle(0) }, ...blank(4, grandStyle(0)), { v: '', s: grandStyle(5) }, { v: grand, s: grandStyle(6) }] })
  merges.push(`A${out.length}:F${out.length}`)
  const bytes = buildReportXlsx({ sheetName: 'Penjualan', widths: [13, 42, 18, 9, 17, 18, 20], rows: out, merges })
  downloadFile(fileName(filter, 'xlsx'), bytes, XLSX_MIME)
}

export function exportSalesPdf(rows, filter) {
  const groups = groupSales(rows)
  let grand = 0
  const mapped = groups.map((group) => {
    grand += group.subtotal
    return {
      brand: group.brand,
      subtotalText: formatRupiah(group.subtotal),
      days: group.days.map((day) => ({
        label: dmy(day.date).slice(0, 5),
        total: day.total,
        items: day.items.map((item) => ({ name: item.item, qty: item.qty, priceText: formatRupiah(item.price), totalText: formatRupiah(item.total) })),
      })),
    }
  })
  const bytes = buildReportPdf({
    title: reportTitle(filter),
    subtitle: 'CATATAN PENJUALAN',
    groups: mapped,
    grandTotalText: formatRupiah(grand),
    dailyTotalText: (day) => formatRupiah(day.total),
  })
  downloadFile(fileName(filter, 'pdf'), bytes, 'application/pdf')
}
