import { downloadFile } from '@/lib/download'
import { buildRecapPdf, buildReportXlsx } from '@/lib/export-laporan'
import { cellDisplay, dayLabel, lastDays, periodLabel, RECAP_LEGEND, buildStockRecap } from '@/lib/rekap-stok'
import { formatAngka } from '@/lib/format'
import { todayISO } from '@/lib/date'
import { singkatNama } from '@/lib/singkatan'
import { rangeDays } from '@/lib/rekap-rentang'
import { getRecapSource } from '@/services/queries'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const RECAP_DAYS = 30

/** Membaca data lalu menyusun rekap. Tanpa `range` (kosong): 30 hari terakhir. range: { from, to } tanggal ISO. Mengembalikan null bila tidak ada barang. */
export async function loadRecap(range) {
  const source = await getRecapSource()
  const dates = range ? lastDays(range.to, rangeDays(range.from, range.to)) : lastDays(todayISO(), RECAP_DAYS)
  const groups = buildStockRecap({ items: source.items, movements: source.movements, dates })
  const count = groups.reduce((sum, group) => sum + group.rows.length, 0)
  if (count === 0) return null
  return { dates, groups, count, label: periodLabel(dates) }
}

const fileBase = (label) => `Rekap-Stok-${label.replace(/[^A-Za-z0-9]+/g, '-')}`
const countText = (count) => `JUMLAH BARANG: ${formatAngka(count)}`

// Nama barang di file rekap: awalan brand menjadi singkatan brand dan kata panjang dipendekkan (lihat lib/singkatan).
const recapItemName = singkatNama
export function exportRecapExcel({ dates, groups, count, label }) {
  const columns = dates.length + 1
  const BORDER = true
  const blank = (n, s) => Array.from({ length: n }, () => ({ v: '', s }))
  const headStyle = { sz: 8, b: true, color: 'FFFFFF', fill: '000000', border: BORDER, h: 'center' }
  const brandStyle = { sz: 9, b: true, color: 'FFFFFF', fill: '808080', border: BORDER, h: 'center' }
  const rows = [{ height: 18, cells: [{ v: label, s: headStyle }, ...dates.map((date) => ({ v: dayLabel(date), s: headStyle }))] }]
  const merges = []
  for (const group of groups) {
    rows.push({ height: 16, cells: [{ v: group.brand.toUpperCase(), s: brandStyle }, ...blank(columns - 1, brandStyle)] })
    merges.push(`A${rows.length}:${colRef(columns - 1)}${rows.length}`)
    for (const row of group.rows) {
      const cells = [{ v: recapItemName(row.name, group.brand), s: { border: BORDER, h: 'left' } }]
      for (const cell of row.cells) {
        const d = cellDisplay(cell)
        const base = { border: BORDER, h: 'center', ...(d.black ? { fill: '000000', b: true, color: 'FFFFFF' } : {}) }
        if (!d.sup) {
          const number = Number(d.main)
          cells.push({ v: Number.isNaN(number) ? d.main : number, s: base })
        } else {
          const color = d.black ? 'FFFFFF' : '35262C'
          cells.push({ runs: [{ t: d.main, b: d.black, color }, { t: d.sup, sup: true, sz: 6, color }], s: base })
        }
      }
      rows.push({ cells })
    }
  }
  const footStyle = { b: true, fill: 'E5E7EB', border: BORDER, h: 'left' }
  rows.push({ cells: [{ v: countText(count), s: footStyle }, ...blank(columns - 1, footStyle)] })
  merges.push(`A${rows.length}:${colRef(columns - 1)}${rows.length}`)
  const legendStyle = { sz: 7, color: '4B5563', h: 'left' }
  rows.push({ cells: [{ v: RECAP_LEGEND, s: legendStyle }, ...blank(columns - 1, legendStyle)] })
  merges.push(`A${rows.length}:${colRef(columns - 1)}${rows.length}`)
  const bytes = buildReportXlsx({
    sheetName: 'Rekap Stok',
    widths: [34, ...dates.map(() => 5.2)],
    rows,
    merges,
    printTitleRows: 1,
  })
  downloadFile(`${fileBase(label)}.xlsx`, bytes, XLSX_MIME)
}

export async function exportRecapPdf({ dates, groups, count, label }) {
  const bytes = await buildRecapPdf({
    headLabel: label,
    dayLabels: dates.map(dayLabel),
    groups: groups.map((group) => ({
      brand: group.brand,
      rows: group.rows.map((row) => ({ name: recapItemName(row.name, group.brand), cells: row.cells.map(cellDisplay) })),
    })),
    countText: countText(count),
    legend: RECAP_LEGEND,
  })
  downloadFile(`${fileBase(label)}.pdf`, bytes, 'application/pdf')
}

function colRef(index) {
  let n = index
  let name = ''
  do {
    name = String.fromCharCode(65 + (n % 26)) + name
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return name
}
