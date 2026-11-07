// Pembuat PDF tabel sederhana tanpa pustaka tambahan: A4, font Helvetica bawaan PDF (tanpa embed font).
// Teks diubah ke WinAnsi/Latin-1; karakter di luar itu diganti "?".
// columns: [{ label, width (pt), align?: 'right', value: (row) => string }]

// Lebar huruf Helvetica (per 1000 satuan) untuk ASCII 32..126.
const W = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278,
  278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611,
  722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]

const BOLD = 1.06 // pendekatan lebar Helvetica-Bold

export function textWidth(text, size, bold = false) {
  let total = 0
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    total += code >= 32 && code <= 126 ? W[code - 32] : 556
  }
  return (total * size * (bold ? BOLD : 1)) / 1000
}

function toLatin1(text) {
  let out = ''
  for (const ch of String(text ?? '')) {
    const code = ch.charCodeAt(0)
    if (code === 0x2014 || code === 0x2013) out += '-'
    else if (code === 0x2026) out += '...'
    else if (code === 0xa0) out += ' '
    else if (code < 32) out += ' '
    else out += code <= 255 ? ch : '?'
  }
  return out
}

export const escapePdf = (text) => toLatin1(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

/** Memecah teks menjadi paling banyak `maxLines` baris sesuai lebar; sisanya dipotong dengan "...". */
export function wrapText(text, width, size, maxLines, bold = false) {
  const words = toLatin1(text).split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  const fit = (value) => textWidth(value, size, bold) <= width
  const clip = (value) => {
    let out = value
    while (out.length > 1 && !fit(`${out}...`)) out = out.slice(0, -1)
    return `${out}...`
  }
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (fit(candidate)) {
      line = candidate
      continue
    }
    if (line) lines.push(line)
    if (lines.length >= maxLines) return finish(lines, maxLines, clip, true)
    if (fit(word)) line = word
    else {
      let rest = word
      while (rest && !fit(rest)) {
        let cut = rest.length
        while (cut > 1 && !fit(rest.slice(0, cut))) cut -= 1
        lines.push(rest.slice(0, cut))
        rest = rest.slice(cut)
        if (lines.length >= maxLines) return finish(lines, maxLines, clip, true)
      }
      line = rest
    }
  }
  if (line) lines.push(line)
  return finish(lines, maxLines, clip, false)
}

function finish(lines, maxLines, clip, truncated) {
  const out = lines.slice(0, maxLines)
  if (truncated && out.length) out[out.length - 1] = clip(out[out.length - 1])
  return out.length ? out : ['']
}

const PAGE = { w: 595.28, h: 841.89, margin: 40 }
const FONT = 8
const LEAD = 10.5
const HEAD_H = 20

/**
 * Mengembalikan Uint8Array berisi PDF.
 * title, subtitle: teks di halaman pertama; summary: baris ringkasan (array teks).
 */
export function buildPdf({ title, subtitle, summary = [], columns, rows, footer = '' }) {
  const usable = PAGE.w - PAGE.margin * 2
  const scale = usable / columns.reduce((sum, c) => sum + c.width, 0)
  const cols = columns.map((c) => ({ ...c, width: c.width * scale }))
  const pad = 4

  const pages = []
  let ops = []
  let y = 0
  const newPage = (first) => {
    ops = []
    pages.push(ops)
    y = PAGE.h - PAGE.margin
    if (first) {
      ops.push(textOp(title, PAGE.margin, y - 14, 15, true))
      y -= 32
      if (subtitle) {
        ops.push(textOp(subtitle, PAGE.margin, y, 9, false, '0.4 0.4 0.4'))
        y -= 14
      }
      for (const line of summary) {
        ops.push(textOp(line, PAGE.margin, y, 9, false))
        y -= 12
      }
      y -= 8
    }
    drawHeader()
  }
  function textOp(text, x, yy, size, bold, color = '0 0 0') {
    return `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${color} rg ${x.toFixed(2)} ${yy.toFixed(2)} Td (${escapePdf(text)}) Tj ET`
  }
  function drawHeader() {
    ops.push(`0.91 0.92 0.94 rg ${PAGE.margin} ${(y - HEAD_H).toFixed(2)} ${usable.toFixed(2)} ${HEAD_H} re f`)
    let x = PAGE.margin
    for (const c of cols) {
      const label = c.label
      const tx = c.align === 'right' ? x + c.width - pad - textWidth(label, FONT, true) : x + pad
      ops.push(textOp(label, tx, y - 13, FONT, true))
      x += c.width
    }
    y -= HEAD_H
  }

  newPage(true)
  const bottom = PAGE.margin + 18
  for (const row of rows) {
    const cells = cols.map((c) => wrapText(String(c.value(row) ?? ''), c.width - pad * 2, FONT, 2, false))
    const lines = Math.max(...cells.map((cell) => cell.length))
    const height = lines * LEAD + 6
    if (y - height < bottom) newPage(false)
    let x = PAGE.margin
    cols.forEach((c, i) => {
      cells[i].forEach((line, n) => {
        const tx = c.align === 'right' ? x + c.width - pad - textWidth(line, FONT) : x + pad
        const negative = c.align === 'right' && /^-\d/.test(line)
        ops.push(textOp(line, tx, y - 3 - LEAD * (n + 1) + 3, FONT, false, negative ? '0.75 0.1 0.1' : '0 0 0'))
      })
      x += c.width
    })
    y -= height
    ops.push(`0.88 0.88 0.9 RG 0.4 w ${PAGE.margin} ${y.toFixed(2)} m ${(PAGE.margin + usable).toFixed(2)} ${y.toFixed(2)} l S`)
  }

  const total = pages.length
  pages.forEach((pageOps, index) => {
    const label = `${footer ? `${footer}  ·  ` : ''}Halaman ${index + 1} dari ${total}`
    pageOps.push(textOp(label, PAGE.margin, PAGE.margin - 6, 8, false, '0.45 0.45 0.45'))
  })

  return assemblePdf(pages)
}

/** Merakit PDF dari halaman-halaman: tiap halaman berupa array perintah gambar (operator PDF). */
export function assemblePdf(pages, size = { w: PAGE.w, h: PAGE.h }) {
  const total = pages.length
  // Susun objek PDF: 1 katalog, 2 daftar halaman, 3 Helvetica, 4 Helvetica-Bold, lalu (halaman, isi) berpasangan.
  const objects = []
  const add = (body) => objects.push(body)
  add('<< /Type /Catalog /Pages 2 0 R >>')
  add(`<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${total} >>`)
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  pages.forEach((pageOps, i) => {
    add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${size.w} ${size.h}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`,
    )
    const stream = pageOps.join('\n')
    add({ stream })
  })

  const chunks = []
  const offsets = []
  let length = 0
  const push = (text) => {
    const bytes = new Uint8Array(text.length)
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff
    chunks.push(bytes)
    length += bytes.length
  }
  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
  objects.forEach((object, i) => {
    offsets.push(length)
    if (typeof object === 'string') push(`${i + 1} 0 obj\n${object}\nendobj\n`)
    else push(`${i + 1} 0 obj\n<< /Length ${object.stream.length} >>\nstream\n${object.stream}\nendstream\nendobj\n`)
  })
  const xref = length
  push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`)
  for (const offset of offsets) push(`${String(offset).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  const out = new Uint8Array(length)
  let position = 0
  for (const chunk of chunks) {
    out.set(chunk, position)
    position += chunk.length
  }
  return out
}
