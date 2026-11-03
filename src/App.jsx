import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { HomePage } from '@/pages/home/home-page'

export default function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#utama"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:bg-pena focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Lompat ke konten
      </a>
      <SiteHeader />
      <main id="utama" className="flex-1">
        <HomePage />
      </main>
      <SiteFooter />
    </div>
  )
}
