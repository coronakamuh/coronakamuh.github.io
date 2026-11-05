/** Mengunduh data biner/teks sebagai file di browser. */
export function downloadFile(filename, bytes, mime) {
  const blob = new Blob([bytes], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
