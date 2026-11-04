import { Component } from 'react'

/**
 * Pengaman: bila ada bagian aplikasi yang error saat tampil, tampilkan pesannya
 * (bukan halaman kosong), supaya penyebabnya mudah dilaporkan.
 */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Dhouse Digital error:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
        <p className="mt-2 text-tinta-redup">
          Halaman gagal ditampilkan. Muat ulang halaman. Jika masih sama, kirim pesan di bawah ini.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-garis bg-garis-halus p-3 text-xs whitespace-pre-wrap">
          {String(this.state.error?.message ?? this.state.error)}
        </pre>
      </div>
    )
  }
}
