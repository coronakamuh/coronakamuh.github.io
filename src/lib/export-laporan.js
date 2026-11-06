// Pembuat laporan bergaya (sel gabungan, warna, subtotal) untuk Excel dan PDF, tanpa pustaka tambahan.
// Dipakai laporan penjualan per brand dan per tanggal. Pembuat tabel datar tetap di export-xlsx.js / export-pdf.js.
import { assemblePdf, escapePdf, textWidth, wrapText } from '@/lib/export-pdf'
import { columnName, escapeXml, zipStore } from '@/lib/export-xlsx'

const encoder = new TextEncoder()

/* ---------------------------------- Excel ---------------------------------- */

const BORDER_COLOR = 'FFDFC5CE'
const argb = (hex) => `FF${String(hex).replace('#', '').toUpperCase()}`

/**
 * rows: [{ height?, cells: [{ v, s }] }] ; s = { sz, b, color, fill, border, h: 'left'|'center'|'right', rp, wrap }
 * merges: ['A1:C1', ...] ; widths: lebar kolom (karakter).
 * Sel tanpa nilai tetap digambar bila punya gaya (agar warna dan garis sel gabungan utuh).
 */
export function buildReportXlsx({ sheetName = 'Laporan', widths, rows, merges = [] }) {
  const fonts = []
  const fills = []
  const xfs = []
  const index = (list, key) => {
    const found = list.indexOf(key)
    if (found >= 0) return found
    list.push(key)
    return list.length - 1
  }
  const xfFor = (style = {}) => {
    const font = index(fonts, JSON.stringify([style.sz ?? 8, Boolean(style.b), style.color ?? '35262C']))
    const fill = style.fill ? index(fills, style.fill) + 2 : 0
    const key = JSON.stringify([font, fill, Boolean(style.border), style.h ?? 'left', Boolean(style.rp), Boolean(style.wrap)])
    return index(xfs, key)
  }
  xfFor({}) // gaya 0 = bawaan

  const lastColumn = columnName(widths.length - 1)
  const sheetRows = rows
    .map((row, r) => {
      const cells = row.cells
        .map((cell, c) => {
          const ref = `${columnName(c)}${r + 1}`
          const hasValue = cell.v !== '' && cell.v !== null && cell.v !== undefined
          const s = cell.s ? ` s="${xfFor(cell.s)}"` : ''
          if (!hasValue) return cell.s ? `<c r="${ref}"${s}/>` : ''
          if (typeof cell.v === 'number') return `<c r="${ref}"${s}><v>${cell.v}</v></c>`
          return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell.v)}</t></is></c>`
        })
        .join('')
      const height = row.height ? ` ht="${row.height}" customHeight="1"` : ''
      return `<row r="${r + 1}"${height}>${cells}</row>`
    })
    .join('')
  const cols = widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')
  const mergeXml = merges.length ? `<mergeCells count="${merges.length}">${merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : ''
  const sheet =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>' +
    `<dimension ref="A1:${lastColumn}${rows.length}"/>` +
    '<sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>' +
    `<cols>${cols}</cols><sheetData>${sheetRows}</sheetData>${mergeXml}` +
    '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>' +
    '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>'

  const fontXml = [
    '<font><sz val="11"/><name val="Calibri"/></font>',
    ...fonts.map((key) => {
      const [sz, bold, color] = JSON.parse(key)
      return `<font>${bold ? '<b/>' : ''}<sz val="${sz}"/><color rgb="${argb(color)}"/><name val="Calibri"/></font>`
    }),
  ]
  // Indeks font: 0 = bawaan, 1.. = fonts (dimulai dari 1).
  const fillXml = [
    '<fill><patternFill patternType="none"/></fill>',
    '<fill><patternFill patternType="gray125"/></fill>',
    ...fills.map((hex) => `<fill><patternFill patternType="solid"><fgColor rgb="${argb(hex)}"/><bgColor indexed="64"/></patternFill></fill>`),
  ]
  const side = (name) => `<${name} style="thin"><color rgb="${BORDER_COLOR}"/></${name}>`
  const styles =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;Rp&quot;\\ #,##0"/></numFmts>' +
    `<fonts count="${fontXml.length}">${fontXml.join('')}</fonts>` +
    `<fills count="${fillXml.length}">${fillXml.join('')}</fills>` +
    `<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border>${side('left')}${side('right')}${side('top')}${side('bottom')}<diagonal/></border></borders>` +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    `<cellXfs count="${xfs.length}">${xfs
      .map((key, i) => {
        if (i === 0) return '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        const [font, fill, border, h, rp, wrap] = JSON.parse(key)
        return (
          `<xf numFmtId="${rp ? 164 : 0}" fontId="${font + 1}" fillId="${fill}" borderId="${border ? 1 : 0}" xfId="0" applyFont="1"` +
          `${fill ? ' applyFill="1"' : ''}${border ? ' applyBorder="1"' : ''}${rp ? ' applyNumberFormat="1"' : ''} applyAlignment="1">` +
          `<alignment horizontal="${h}" vertical="center"${wrap ? ' wrapText="1"' : ''}/></xf>`
        )
      })
      .join('')}</cellXfs>` +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'

  const safeName = escapeXml(sheetName.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Laporan')
  const xml = (body) => encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${body}`)
  return zipStore([
    {
      name: '[Content_Types].xml',
      data: xml(
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      ),
    },
    {
      name: '_rels/.rels',
      data: xml(
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      ),
    },
    {
      name: 'xl/workbook.xml',
      data: xml(
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          `<sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      ),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: xml(
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
          '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      ),
    },
    { name: 'xl/styles.xml', data: encoder.encode(styles) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheet) },
  ])
}

/* ----------------------------------- PDF ----------------------------------- */

const MM = 72 / 25.4
const PAGE = { w: 595.28, h: 841.89 }
const MARGIN = 10 * MM
const TABLE_W = 190 * MM
const COL_W = [17, 61, 12, 32, 32, 36].map((mm) => mm * MM)
const FONT = 7
const LEAD = 8.4
const PAD = 2
const MIN_ROW = 4.2 * MM
const HEAD_H = 6.5 * MM

const rgb = (hex) => {
  const n = parseInt(String(hex).replace('#', ''), 16)
  return `${((n >> 16) & 255) / 255} ${((n >> 8) & 255) / 255} ${(n & 255) / 255}`
}
const COLOR = { head: '800020', brand: 'F4E5EA', sub: 'FAF2F5', grand: 'E9CBD5', text: '35262C', line: 'DFC5CE' }

/**
 * Laporan PDF A4 tegak. groups: [{ brand, days: [{ label, dailyTotal, items: [{ name, qty, priceText, totalText }] }], subtotalText }]
 */
export function buildReportPdf({ title, subtitle, groups, grandTotalText, dailyTotalText }) {
  const pages = []
  let ops = []
  let y = 0 // jarak dari atas halaman (pt)

  const top = (value) => PAGE.h - value
  const text = (value, x, baseline, { bold = false, color = COLOR.text, size = FONT } = {}) =>
    `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${rgb(color)} rg ${x.toFixed(2)} ${top(baseline).toFixed(2)} Td (${escapePdf(value)}) Tj ET`
  const box = (x, yy, w, h, fill) =>
    `${fill ? `${rgb(fill)} rg ${x.toFixed(2)} ${top(yy + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f ` : ''}` +
    `${rgb(COLOR.line)} RG 0.4 w ${x.toFixed(2)} ${top(yy + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`
  const colX = (i) => MARGIN + COL_W.slice(0, i).reduce((a, b) => a + b, 0)
  const spanW = (from, to) => COL_W.slice(from, to + 1).reduce((a, b) => a + b, 0)

  // Teks dalam sel: rata kiri/tengah/kanan, di tengah vertikal.
  function cellText(lines, x, w, yy, h, align, opts) {
    const block = lines.length * LEAD
    let baseline = yy + (h - block) / 2 + LEAD - 1.6
    for (const line of lines) {
      const width = textWidth(line, FONT, opts?.bold)
      const tx = align === 'center' ? x + (w - width) / 2 : align === 'right' ? x + w - PAD - width : x + PAD
      ops.push(text(line, tx, baseline, opts))
      baseline += LEAD
    }
  }
  function drawHead() {
    const labels = ['Tanggal', 'Nama Barang', 'Qty', 'Harga/Unit', 'Total', 'Total Harian']
    labels.forEach((label, i) => {
      ops.push(box(colX(i), y, COL_W[i], HEAD_H, COLOR.head))
      cellText([label], colX(i), COL_W[i], y, HEAD_H, 'center', { bold: true, color: 'FFFFFF' })
    })
    y += HEAD_H
  }
  function newPage(first) {
    ops = []
    pages.push(ops)
    y = MARGIN
    if (first) {
      ops.push(text(title, (PAGE.w - textWidth(title, 15, true)) / 2, 15 * MM, { bold: true, size: 15, color: '000000' }))
      ops.push(text(subtitle, (PAGE.w - textWidth(subtitle, 9, false)) / 2, 21 * MM, { size: 9, color: '000000' }))
      y = 28 * MM
    }
    drawHead()
  }
  const limit = PAGE.h - MARGIN
  const ensure = (height) => {
    if (y + height > limit) newPage(false)
  }
  const spanRow = (label, fromCol, toCol, valueText, fill, align) => {
    ensure(MIN_ROW)
    ops.push(box(colX(fromCol), y, spanW(fromCol, toCol), MIN_ROW, fill))
    cellText([label], colX(fromCol), spanW(fromCol, toCol), y, MIN_ROW, align, { bold: true })
    if (valueText !== null) {
      ops.push(box(colX(5), y, COL_W[5], MIN_ROW, fill))
      cellText([valueText], colX(5), COL_W[5], y, MIN_ROW, 'right', { bold: true })
    }
    y += MIN_ROW
  }

  newPage(true)
  for (const group of groups) {
    const firstDay = group.days[0]
    ensure(MIN_ROW + dayHeight(firstDay))
    spanRow(group.brand.toUpperCase(), 0, 5, null, COLOR.brand, 'center')
    for (const day of group.days) {
      const heights = day.items.map(rowHeight)
      const total = heights.reduce((a, b) => a + b, 0)
      ensure(total)
      const startY = y
      day.items.forEach((item, n) => {
        const h = heights[n]
        ops.push(box(colX(1), y, COL_W[1], h), box(colX(2), y, COL_W[2], h), box(colX(3), y, COL_W[3], h), box(colX(4), y, COL_W[4], h))
        cellText(nameLines(item.name), colX(1), COL_W[1], y, h, 'left')
        cellText([String(item.qty)], colX(2), COL_W[2], y, h, 'center')
        cellText([item.priceText], colX(3), COL_W[3], y, h, 'right')
        cellText([item.totalText], colX(4), COL_W[4], y, h, 'right')
        y += h
      })
      ops.push(box(colX(0), startY, COL_W[0], total), box(colX(5), startY, COL_W[5], total))
      cellText([day.label], colX(0), COL_W[0], startY, total, 'center')
      cellText([dailyTotalText(day)], colX(5), COL_W[5], startY, total, 'right', { bold: true })
    }
    spanRow(`TOTAL ${group.brand}`, 0, 4, group.subtotalText, COLOR.sub, 'right')
  }
  spanRow('TOTAL SEMUA', 0, 4, grandTotalText, COLOR.grand, 'right')

  return assemblePdf(pages)

  function nameLines(name) {
    return wrapText(name, COL_W[1] - PAD * 2, FONT, 3, false)
  }
  function rowHeight(item) {
    return Math.max(MIN_ROW, nameLines(item.name).length * LEAD + PAD * 2)
  }
  function dayHeight(day) {
    return day.items.map(rowHeight).reduce((a, b) => a + b, 0)
  }
}
