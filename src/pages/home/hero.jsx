import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { LedgerSheet } from '@/pages/home/ledger-sheet'

export function Hero() {
  return (
    <section className="pt-10 pb-16 sm:pt-16 lg:pt-20">
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:gap-16">
        <div>
          <h1 className="font-display text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            Stok dan penjualan, tercatat rapi.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-tinta-redup">
            Dhouse Digital membantu mencatat penjualan, mengelola barang dan stok, mencatat mutasi,
            serta menyusun laporan.
          </p>
          <div className="mt-8">
            <Button asChild>
              <a href="#modul">Lihat modul</a>
            </Button>
          </div>
        </div>

        <LedgerSheet />
      </Container>
    </section>
  )
}
