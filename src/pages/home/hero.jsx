import { Container } from '@/components/layout/container'
import { site } from '@/config/site'

export function Hero() {
  return (
    <section className="pt-14 pb-12 sm:pt-24">
      <Container>
        <p className="text-sm text-tinta-redup">
          Tahap {site.stage.number} · {site.stage.label}
        </p>
        <h1 className="mt-4 max-w-xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          Stok dan penjualan, tercatat rapi.
        </h1>
        <p className="mt-5 max-w-md leading-relaxed text-tinta-redup">
          Mencatat penjualan, mengelola barang dan stok, mencatat mutasi, dan menyusun laporan.
        </p>
      </Container>
    </section>
  )
}
