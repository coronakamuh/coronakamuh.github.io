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
export function buildReportXlsx({ sheetName = 'Laporan', widths, rows, merges = [], printTitleRows = 0, pageSetup = {} }) {
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
          const hasValue = cell.runs ? cell.runs.length > 0 : cell.v !== '' && cell.v !== null && cell.v !== undefined
          const s = cell.s ? ` s="${xfFor(cell.s)}"` : ''
          if (cell.runs) {
            const runs = cell.runs
              .map((run) => {
                const props = `${run.b ? '<b/>' : ''}${run.sup ? '<vertAlign val="superscript"/>' : ''}<sz val="${run.sz ?? 8}"/><color rgb="${argb(run.color ?? '35262C')}"/><rFont val="Calibri"/>`
                return `<r><rPr>${props}</rPr><t xml:space="preserve">${escapeXml(run.t)}</t></r>`
              })
              .join('')
            return `<c r="${ref}"${s} t="inlineStr"><is>${runs}</is></c>`
          }
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
    '<printOptions horizontalCentered="1" verticalCentered="1"/>' +
    '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>' +
    `<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="${pageSetup.fitToHeight ?? 0}"/></worksheet>`

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
          `<sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets>` +
          (printTitleRows ? `<definedNames><definedName name="_xlnm.Print_Titles" localSheetId="0">'${safeName}'!$1:$${printTitleRows}</definedName></definedNames>` : '') +
          '</workbook>',
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

/** Potong teks tepat sesuai lebar sel, tanpa menambahkan tanda titik. */
const fitCellText = (value, maxWidth, size) => {
  let output = String(value ?? '')
  while (output.length > 0 && textWidth(output, size) > maxWidth) output = output.slice(0, -1)
  return output.trimEnd()
}

/**
 * Laporan PDF A4 tegak. groups: [{ brand, days: [{ label, dailyTotal, items: [{ name, qty, priceText, totalText }] }], subtotalText }]
 */
export function buildReportPdf({ title, subtitle, groups, grandTotalText, dailyTotalText }) {
  const W = 841.89
  const H = 595.28
  const MM = 72 / 25.4
  const M = 5 * MM
  const GAP = 9
  const PANEL = (W - M * 2 - GAP) / 2
  const BASE_FONT = 8
  const BASE_LEAD = 9
  const BASE_PAD = 2
  const BASE_HEAD = 7 * MM
  const BASE_ROW = 5 * MM
  const days = groups.flatMap((g) => g.days.map((d) => ({ ...d, brand: g.brand })))
  const middle = Math.ceil(days.length / 2)
  const panels = [days.slice(0, middle), days.slice(middle)]
  const panelRows = (panel) => {
    let count = panel.reduce((sum, day) => sum + day.items.length, 0)
    let previousBrand = ''
    for (const day of panel) {
      if (day.brand !== previousBrand) {
        count += 1
        previousBrand = day.brand
      }
    }
    if (previousBrand) count += 1
    return count
  }
  // Skala tabel hanya bila perlu, lalu pusatkan kedua tabel pada halaman.
  const maxRows = Math.max(...panels.map(panelRows))
  const availableRowsHeight = H - 2 * M - BASE_HEAD
  const rowScale = Math.min(1, availableRowsHeight / Math.max(maxRows * BASE_ROW, 1))
  const FONT = BASE_FONT * rowScale
  const LEAD = BASE_LEAD * rowScale
  const PAD = BASE_PAD
  const HEAD = BASE_HEAD
  const ROW = BASE_ROW * rowScale
  const C = { head: '800020', brand: 'F4E5EA', subtotal: 'FAF2F5', total: 'E9CBD5', text: '35262C', line: 'DFC5CE' }
  const rgb = (hex) => { const n = parseInt(hex, 16); return ((n >> 16) & 255) / 255 + ' ' + ((n >> 8) & 255) / 255 + ' ' + (n & 255) / 255 }
  const top = (v) => H - v
  const txt = (ops, value, x, y, size = FONT, bold = false, color = C.text) => ops.push('BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf ' + rgb(color) + ' rg ' + x.toFixed(2) + ' ' + top(y).toFixed(2) + ' Td (' + escapePdf(value) + ') Tj ET')
  const rect = (ops, x, y, w, h, fill) => ops.push((fill ? rgb(fill) + ' rg ' + x.toFixed(2) + ' ' + top(y + h).toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re f ' : '') + rgb(C.line) + ' RG 0.35 w ' + x.toFixed(2) + ' ' + top(y + h).toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re S')
  const labels = ['Tgl', 'Nama Barang', 'Qty', 'Harga/Unit', 'Harga Total', 'Total Harian']
  const widthsFor = (panel) => {
    const values = [
      panel.map((d) => d.label),
      panel.flatMap((d) => d.items.map((i) => i.name)),
      panel.flatMap((d) => d.items.map((i) => String(i.qty))),
      panel.flatMap((d) => d.items.map((i) => i.priceText)),
      panel.flatMap((d) => d.items.map((i) => i.totalText)),
      panel.map((d) => dailyTotalText(d)),
    ]
    const min = [25, 0, 19, 43, 46, 43]
    const max = [38, 0, 30, 72, 78, 72]
    const fixed = [0, 2, 3, 4, 5].map((i) =>
      Math.max(min[i], Math.min(max[i], Math.max(textWidth(labels[i], FONT, true), ...values[i].map((v) => textWidth(v, FONT))) + PAD * 2)),
    )
    const MIN_NAME_WIDTH = 70
    const fixedTotal = fixed.reduce((sum, width) => sum + width, 0)
    const fixedScale = Math.min(1, (PANEL - MIN_NAME_WIDTH) / fixedTotal)
    const fitted = fixed.map((width) => width * fixedScale)
    const nameWidth = PANEL - fitted.reduce((sum, width) => sum + width, 0)
    return [fitted[0], nameWidth, fitted[1], fitted[2], fitted[3], fitted[4]]
  }
  const widths = panels.map(widthsFor)
  const pages = []
  const drawHeader = (ops, y, x0, colWidths) => {
    let x = x0
    labels.forEach((label, i) => {
      rect(ops, x, y, colWidths[i], HEAD, C.head)
      txt(ops, label, x + Math.max(PAD, (colWidths[i] - textWidth(label, FONT, true)) / 2), y + HEAD / 2 + FONT * 0.35, FONT, true, 'FFFFFF')
      x += colWidths[i]
    })
  }
  const renderPanel = (ops, panel, x0, colWidths, yStart) => {
    let y = yStart
    let brand = ''
    let subtotal = 0
    for (const day of panel) {
      if (brand !== day.brand) {
        if (brand) {
          rect(ops, x0, y, PANEL, ROW, C.subtotal)
          txt(ops, 'TOTAL ' + brand + '  ' + 'Rp ' + new Intl.NumberFormat('id-ID').format(subtotal), x0 + PAD, y + ROW / 2 + FONT * 0.35, FONT, true)
          y += ROW
        }
        brand = day.brand
        subtotal = 0
        rect(ops, x0, y, PANEL, ROW, C.brand)
        txt(ops, brand.toUpperCase(), x0 + PAD, y + ROW / 2 + FONT * 0.35, FONT, true)
        y += ROW
      }
      subtotal += day.total
      const heights = day.items.map(() => ROW)
      const dayHeight = heights.reduce((sum, h) => sum + h, 0)
      const dailyTotalWidth = colWidths[5]
      const dailyTotalX = x0 + colWidths.slice(0, 5).reduce((sum, width) => sum + width, 0)

      // Tanggal dan total harian masing-masing satu sel yang membentang seluruh baris hari ini.
      rect(ops, x0, y, colWidths[0], dayHeight)
      const dateWidth = textWidth(day.label, FONT)
      txt(ops, day.label, x0 + (colWidths[0] - dateWidth) / 2, y + dayHeight / 2 + FONT * 0.35, FONT)

      rect(ops, dailyTotalX, y, dailyTotalWidth, dayHeight)
      const dailyText = dailyTotalText(day)
      const dailyWidth = textWidth(dailyText, FONT, true)
      txt(ops, dailyText, dailyTotalX + dailyTotalWidth - PAD - dailyWidth, y + dayHeight / 2 + FONT * 0.35, FONT, true)

      let yy = y
      day.items.forEach((item, n) => {
        const h = heights[n]
        const values = [item.name, String(item.qty), item.priceText, item.totalText]
        let x = x0 + colWidths[0]
        values.forEach((value, index) => {
          const c = index + 1
          rect(ops, x, yy, colWidths[c], h)
          const lines = c === 1 ? [fitCellText(value, colWidths[c] - PAD * 2, FONT)] : [value]
          lines.forEach((line, li) => {
            const tw = textWidth(line, FONT)
            const tx = c === 2 ? x + (colWidths[c] - tw) / 2 : c >= 3 ? x + colWidths[c] - PAD - tw : x + PAD
            txt(ops, line, tx, yy + (h - lines.length * LEAD) / 2 + LEAD - 1 + li * LEAD, FONT)
          })
          x += colWidths[c]
        })
        yy += h
      })
      y = yy
    }
    if (brand) {
      rect(ops, x0, y, PANEL, ROW, C.subtotal)
      txt(ops, 'TOTAL ' + brand + '  ' + 'Rp ' + new Intl.NumberFormat('id-ID').format(subtotal), x0 + PAD, y + ROW / 2 + FONT * 0.35, FONT, true)
      y += ROW
    }
    return y
  }
  const ops = []
  const blockHeight = HEAD + maxRows * ROW
  const y = (H - blockHeight) / 2
  drawHeader(ops, y, M, widths[0])
  drawHeader(ops, y, M + PANEL + GAP, widths[1])
  renderPanel(ops, panels[0], M, widths[0], y + HEAD)
  renderPanel(ops, panels[1], M + PANEL + GAP, widths[1], y + HEAD)

  // Kedua tabel dipusatkan sebagai satu blok, tanpa baris total keseluruhan.
  return assemblePdf([ops], { w: W, h: H })
}
/**
 * Rekap stok PDF landscape A4: kolom nama + satu kolom per hari.
 * groups: [{ brand, rows: [{ name, cells: [{ main, sup, black }] }] }]
 */
export function buildRecapPdf({ headLabel, dayLabels, groups, countText, legend }) {
  const W = 841.89
  const H = 595.28
  const M = 10 * MM
  const NAME_W = 150
  const DAY_W = (W - M * 2 - NAME_W) / dayLabels.length
  const ROW = 10.6
  const HEAD = 13
  const F = 6.6
  const pages = []
  let ops = []
  let y = 0
  const top = (v) => H - v
  const fnt = (bold) => (bold ? 'F2' : 'F1')
  const text = (value, x, baseline, { bold = false, color = COLOR.text, size = F } = {}) =>
    `BT /${fnt(bold)} ${size} Tf ${rgb(color)} rg ${x.toFixed(2)} ${top(baseline).toFixed(2)} Td (${escapePdf(value)}) Tj ET`
  const cell = (x, yy, w, h, fill) =>
    `${fill ? `${rgb(fill)} rg ${x.toFixed(2)} ${top(yy + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f ` : ''}0.85 0.85 0.85 RG 0.3 w ${x.toFixed(2)} ${top(yy + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`
  const centered = (value, x, w, yy, h, opts) => {
    const width = textWidth(value, opts?.size ?? F, opts?.bold)
    ops.push(text(value, x + (w - width) / 2, yy + h / 2 + (opts?.size ?? F) * 0.35, opts))
  }
  const newPage = () => {
    ops = []
    pages.push(ops)
    y = M
    ops.push(cell(M, y, NAME_W, HEAD, '000000'))
    centered(headLabel, M, NAME_W, y, HEAD, { bold: true, color: 'FFFFFF' })
    dayLabels.forEach((label, i) => {
      ops.push(cell(M + NAME_W + i * DAY_W, y, DAY_W, HEAD, '000000'))
      centered(label, M + NAME_W + i * DAY_W, DAY_W, y, HEAD, { bold: true, color: 'FFFFFF', size: 6 })
    })
    y += HEAD
  }
  const ensure = (h) => {
    if (y + h > H - M) newPage()
  }
  const band = (label, fill, color, bold) => {
    ensure(ROW)
    ops.push(cell(M, y, W - M * 2, ROW, fill))
    centered(label, M, W - M * 2, y, ROW, { bold, color, size: bold ? 7.4 : 6 })
    y += ROW
  }
  newPage()
  for (const group of groups) {
    ensure(ROW * 2)
    band(group.brand.toUpperCase(), '808080', 'FFFFFF', true)
    for (const row of group.rows) {
      ensure(ROW)
      ops.push(cell(M, y, NAME_W, ROW))
      const name = fitText(row.name, NAME_W - 5, F)
      ops.push(text(name, M + 2.5, y + ROW / 2 + F * 0.35))
      row.cells.forEach((c, i) => {
        const x = M + NAME_W + i * DAY_W
        ops.push(cell(x, y, DAY_W, ROW, c.black ? '000000' : null))
        const color = c.black ? 'FFFFFF' : COLOR.text
        const mainSize = F + 0.4
        const mainW = textWidth(c.main, mainSize, c.black)
        const supW = c.sup ? textWidth(c.sup, 4.4, false) : 0
        let tx = x + (DAY_W - mainW - supW) / 2
        const base = y + ROW / 2 + mainSize * 0.35
        if (c.sup && !c.black && c.main === '0') {
          // stok minus: angka kecil di depan, 0 di belakang
          ops.push(text(c.sup, tx, base - 2.3, { size: 4.4, color: COLOR.text }))
          ops.push(text(c.main, tx + supW, base, { size: mainSize, color }))
        } else {
          ops.push(text(c.main, tx, base, { size: mainSize, bold: c.black, color }))
          if (c.sup) ops.push(text(c.sup, tx + mainW, base - 2.3, { size: 4.4, color }))
        }
      })
      y += ROW
    }
  }
  ensure(ROW * 2)
  ops.push(cell(M, y, W - M * 2, ROW, 'E5E7EB'))
  ops.push(text(countText, M + 3, y + ROW / 2 + F * 0.35, { bold: true }))
  y += ROW
  const legendLines = wrapText(legend, W - M * 2 - 6, 6.2, 3, false)
  if (y + 3 + legendLines.length * 8 > H - M + 6) newPage()
  legendLines.forEach((line, i) => ops.push(text(line, M + 3, y + 9 + i * 8, { size: 6.2, color: '4B5563' })))
  return assemblePdf(pages, { w: W, h: H })

  function fitText(value, maxWidth, size) {
    if (textWidth(value, size, false) <= maxWidth) return value
    let out = value
    while (out.length > 1 && textWidth(`${out}...`, size, false) > maxWidth) out = out.slice(0, -1)
    return `${out.trimEnd()}...`
  }
}
