import { formatDisplay, todayISO } from '@/lib/date'
import { downloadFile } from '@/lib/download'
import { buildPdf } from '@/lib/export-pdf'
import { buildXlsx } from '@/lib/export-xlsx'
import { formatAngka, formatRupiah } from '@/lib/format'

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** Keterangan filter yang dipakai, dicantumkan di PDF dan nama berkas. */
export function describeFilter({ from, to, brand }) {
  const parts = []
  if (from || to) parts.push(`Tanggal: ${from ? formatDisplay(from) : 'awal'} - ${to ? formatDisplay(to) : 'hari ini'}`)
  if (brand) parts.push(`Brand: ${brand}`)
  return parts.length ? parts.join(' · ') : 'Semua penjualan'
}

export function fileName(filter, ext) {
  const range = filter.from || filter.to ? `-${filter.from || 'awal'}_${filter.to || todayISO()}` : `-${todayISO()}`
  const brand = filter.brand ? `-${filter.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}` : ''
  return `penjualan${range}${brand}.${ext}`
}

export function totals(rows) {
  return {
    count: rows.length,
    units: rows.reduce((sum, row) => sum + row.qty, 0),
    revenue: rows.reduce((sum, row) => sum + row.total, 0),
  }
}

export function exportSalesExcel(rows, filter) {
  const bytes = buildXlsx({
    sheetName: 'Penjualan',
    rows,
    columns: [
      { label: 'Tanggal', width: 14, value: (row) => row.date },
      { label: 'Nama Barang', width: 44, value: (row) => row.item },
      { label: 'Qty', width: 8, type: 'number', value: (row) => row.qty },
      { label: 'Harga', width: 16, type: 'rupiah', value: (row) => row.price },
      { label: 'Total', width: 16, type: 'rupiah', value: (row) => row.total },
      { label: 'Brand', width: 18, value: (row) => row.brand },
    ],
  })
  downloadFile(fileName(filter, 'xlsx'), bytes, XLSX_MIME)
}

export function exportSalesPdf(rows, filter) {
  const sum = totals(rows)
  const bytes = buildPdf({
    title: 'Laporan Penjualan',
    subtitle: `Dhouse Digital · ${formatDisplay(todayISO())} · ${describeFilter(filter)}`,
    summary: [`${formatAngka(sum.count)} penjualan · ${formatAngka(sum.units)} unit · Total ${formatRupiah(sum.revenue)}`],
    footer: 'Dhouse Digital',
    rows,
    columns: [
      { label: 'Tanggal', width: 62, value: (row) => formatDisplay(row.date) },
      { label: 'Nama Barang', width: 200, value: (row) => row.item },
      { label: 'Qty', width: 34, align: 'right', value: (row) => formatAngka(row.qty) },
      { label: 'Harga', width: 70, align: 'right', value: (row) => formatRupiah(row.price) },
      { label: 'Total', width: 80, align: 'right', value: (row) => formatRupiah(row.total) },
      { label: 'Brand', width: 70, value: (row) => row.brand },
    ],
  })
  downloadFile(fileName(filter, 'pdf'), bytes, 'application/pdf')
}
