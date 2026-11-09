import { toast } from 'sonner'

/** Bytes (atau teks) menjadi base64, per potongan agar file besar tidak membuat error. */
function toBase64(bytes) {
  const data = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < data.length; i += 0x8000) binary += String.fromCharCode.apply(null, data.subarray(i, i + 0x8000))
  return btoa(binary)
}

/**
 * Di aplikasi Android (WebView), tautan unduhan biasa tidak berfungsi.
 * File disimpan sementara lewat plugin Filesystem lalu dibuka lewat menu Bagikan,
 * sehingga bisa disimpan, dibuka, atau dikirim.
 */
async function saveInApp(filename, bytes) {
  const { Filesystem, Share } = window.Capacitor.Plugins
  if (!Filesystem || !Share) {
    toast.error('Unduhan belum didukung di versi aplikasi ini', { description: 'Pasang APK terbaru.' })
    return
  }
  try {
    const saved = await Filesystem.writeFile({ path: filename, data: toBase64(bytes), directory: 'CACHE' })
    await Share.share({ title: filename, files: [saved.uri], dialogTitle: 'Simpan atau bagikan file' })
  } catch (failure) {
    if (/cancel/i.test(String(failure?.message ?? failure))) return
    toast.error('File gagal disimpan', { description: failure?.message })
  }
}

/** Mengunduh data biner/teks sebagai file (peramban biasa, atau aplikasi Android). */
export function downloadFile(filename, bytes, mime) {
  if (window.Capacitor?.isNativePlatform?.()) return saveInApp(filename, bytes)
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
