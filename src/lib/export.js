// Ekspor CSV di browser (tanpa pustaka tambahan). BOM ditambahkan agar Excel membaca UTF-8 dengan benar.
const cell = (value) => {
  const text = String(value ?? '')
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(columns, rows) {
  const lines = [columns.map((c) => cell(c.label)).join(',')]
  for (const row of rows) lines.push(columns.map((c) => cell(c.value(row))).join(','))
  return lines.join('\r\n')
}

export function downloadCsv(filename, columns, rows) {
  const blob = new Blob(['﻿', toCsv(columns, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
