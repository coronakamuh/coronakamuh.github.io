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
  const days = groups.flatMap((group) => group.days.map((day) => ({ ...day, brand: group.brand })))
  const middle = Math.ceil(days.length / 2)
  const panels = [days.slice(0, middle), days.slice(middle)]
  const LINE = true
  const blank = (n, s) => Array.from({ length: n }, () => ({ v: '', s }))
  const header = ['Tgl', 'Nama Barang', 'Qty', 'Harga/Unit', 'Harga Total', 'Total Harian']
  const buildPanel = (panel, columnOffset) => {
    const result = [{ cells: header.map((v, c) => ({ v, s: { sz: 8, b: true, color: 'FFFFFF', fill: '800020', border: LINE, h: c === 2 ? 'center' : c >= 3 ? 'right' : 'left' } })) }]
    const merges = []
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']
    const dateColumn = columns[columnOffset]
    const dailyTotalColumn = columns[columnOffset + 5]
    let brand = ''
    let subtotal = 0
    for (const day of panel) {
      if (brand !== day.brand) {
        if (brand) result.push({ cells: [...blank(4), { v: 'TOTAL ' + brand, s: { sz: 8, b: true, fill: 'FAF2F5', border: LINE, h: 'right' } }, { v: subtotal, s: { sz: 8, b: true, fill: 'FAF2F5', border: LINE, h: 'right', rp: true } }] })
        brand = day.brand
        subtotal = 0
        const style = { sz: 8, b: true, fill: 'F4E5EA', border: LINE }
        result.push({ height: 17, cells: [{ v: brand.toUpperCase(), s: style }, ...blank(5, style)] })
      }
      subtotal += day.total
      const firstRow = result.length + 2
      day.items.forEach((item, i) => {
        const style = (c) => ({ sz: 8, border: LINE, h: c === 2 ? 'center' : c >= 3 ? 'right' : 'left', rp: c >= 3, wrap: c === 1 })
        result.push({ cells: [
          { v: i === 0 ? dmy(day.date) : '', s: style(0) },
          { v: item.item, s: style(1) },
          { v: item.qty, s: style(2) },
          { v: item.price, s: style(3) },
          { v: item.total, s: style(4) },
          { v: i === 0 ? day.total : '', s: style(5) },
        ] })
      })
      if (day.items.length > 1) {
        const lastRow = firstRow + day.items.length - 1
        merges.push(`${dateColumn}${firstRow}:${dateColumn}${lastRow}`)
        merges.push(`${dailyTotalColumn}${firstRow}:${dailyTotalColumn}${lastRow}`)
      }
    }
    if (brand) result.push({ cells: [...blank(4), { v: 'TOTAL ' + brand, s: { sz: 8, b: true, fill: 'FAF2F5', border: LINE, h: 'right' } }, { v: subtotal, s: { sz: 8, b: true, fill: 'FAF2F5', border: LINE, h: 'right', rp: true } }] })
    return { rows: result, merges }
  }
  const left = buildPanel(panels[0], 0)
  const right = buildPanel(panels[1], 7)
  const title = 'PENJUALAN ' + reportTitle(filter)
  const out = [{ height: 17, cells: [{ v: title, s: { sz: 10, b: true } }, ...blank(12)] }]
  const max = Math.max(left.rows.length, right.rows.length)
  for (let i = 0; i < max; i++) out.push({ cells: [...(left.rows[i]?.cells ?? blank(6)), { v: '' }, ...(right.rows[i]?.cells ?? blank(6))] })
  const merges = [...left.merges, ...right.merges]
  const total = totals(rows)
  out.push({ height: 18, cells: [{ v: 'TOTAL SEMUA', s: { sz: 8, b: true, fill: 'E9CBD5', border: LINE } }, { v: total.count + ' transaksi', s: { sz: 8, b: true, fill: 'E9CBD5', border: LINE } }, { v: total.units, s: { sz: 8, b: true, fill: 'E9CBD5', border: LINE } }, ...blank(9), { v: total.revenue, s: { sz: 8, b: true, fill: 'E9CBD5', border: LINE, rp: true } }] })
  const width = (panel, c) => {
    const vals = panel.flatMap((d) => d.items.map((item) => [dmy(d.date), item.item, String(item.qty), String(item.price), String(item.total), String(d.total)][c]))
    return Math.max([8, 30, 7, 13, 13, 13][c], Math.min([12, 38, 10, 18, 19, 19][c], Math.max(header[c].length, ...vals.map((v) => v.length)) + 2))
  }
  const widths = [...Array.from({ length: 6 }, (_, i) => width(panels[0], i)), 2, ...Array.from({ length: 6 }, (_, i) => width(panels[1], i))]
  downloadFile(fileName(filter, 'xlsx'), buildReportXlsx({ sheetName: 'Penjualan', widths, rows: out, merges, pageSetup: { fitToHeight: 0 } }), XLSX_MIME)
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
