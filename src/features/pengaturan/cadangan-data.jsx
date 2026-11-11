import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SettingRow } from '@/features/pengaturan/setting-ui'
import { todayISO } from '@/lib/date'
import { downloadFile } from '@/lib/download'
import { buildWorkbook } from '@/lib/export-cadangan'
import { getBackupData } from '@/services/cadangan'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** Cadangan seluruh data ke satu berkas Excel (lembar: Barang, Penjualan, Mutasi, Brand, Target). Hanya membaca. */
export function CadanganData() {
  const [busy, setBusy] = useState(false)

  async function handleBackup() {
    if (busy) return
    setBusy(true)
    try {
      const data = await getBackupData()
      const bytes = buildWorkbook([
        {
          name: 'Barang',
          rows: data.barang,
          columns: [
            { label: 'ID', type: 'number', width: 8, value: (r) => r.id },
            { label: 'Nama barang', width: 44, value: (r) => r.nama },
            { label: 'Brand', width: 18, value: (r) => r.brand },
            { label: 'Stok awal', type: 'number', width: 11, value: (r) => r.stokAwal },
            { label: 'Tanggal mulai', width: 14, value: (r) => r.tanggalMulai },
            { label: 'Stok saat ini', type: 'number', width: 13, value: (r) => r.stok },
          ],
        },
        {
          name: 'Penjualan',
          rows: data.penjualan,
          columns: [
            { label: 'ID', type: 'number', width: 8, value: (r) => r.id },
            { label: 'Tanggal', width: 12, value: (r) => r.tanggal },
            { label: 'Brand', width: 18, value: (r) => r.brand },
            { label: 'Barang', width: 44, value: (r) => r.barang },
            { label: 'Jumlah', type: 'number', width: 9, value: (r) => r.qty },
            { label: 'Harga', type: 'rupiah', width: 14, value: (r) => r.harga },
            { label: 'Total', type: 'rupiah', width: 16, value: (r) => r.total },
          ],
        },
        {
          name: 'Mutasi',
          rows: data.mutasi,
          columns: [
            { label: 'ID', type: 'number', width: 8, value: (r) => r.id },
            { label: 'Tanggal', width: 12, value: (r) => r.tanggal },
            { label: 'Barang', width: 44, value: (r) => r.barang },
            { label: 'Jenis', width: 16, value: (r) => r.jenis },
            { label: 'Jumlah', type: 'number', width: 9, value: (r) => r.jumlah },
            { label: 'ID penjualan', type: 'number', width: 13, value: (r) => r.penjualanId },
          ],
        },
        {
          name: 'Brand',
          rows: data.brands,
          columns: [
            { label: 'ID', type: 'number', width: 8, value: (r) => r.id },
            { label: 'Nama brand', width: 24, value: (r) => r.name },
            { label: 'Status', width: 12, value: (r) => (r.active ? 'Aktif' : 'Nonaktif') },
          ],
        },
        {
          name: 'Target',
          rows: data.targets,
          columns: [
            { label: 'Brand', width: 24, value: (r) => r.brand },
            { label: 'Target', type: 'rupiah', width: 18, value: (r) => r.target },
          ],
        },
      ])
      await downloadFile(`Cadangan-DHouse-${todayISO()}.xlsx`, bytes, XLSX_MIME)
      toast.success('Cadangan siap', { description: `${data.barang.length} barang, ${data.penjualan.length} penjualan, ${data.mutasi.length} mutasi` })
    } catch (failure) {
      toast.error('Cadangan gagal', { description: failure.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <SettingRow label="Cadangan data (Excel)" hint="Unduh seluruh data (barang, penjualan, mutasi, brand, target) ke satu file Excel. Hanya membaca.">
      <Button variant="outline" size="sm" onClick={handleBackup} disabled={busy}>
        <Download />
        {busy ? 'Menyiapkan…' : 'Unduh'}
      </Button>
    </SettingRow>
  )
}
