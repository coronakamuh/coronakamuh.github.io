import { ExternalLink } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Separator } from '@/components/ui/separator'
import { site } from '@/config/site'

export function SiteFooter() {
  return (
    <footer className="mt-24">
      <Separator />
      <Container className="flex flex-col gap-3 py-8 text-sm text-tinta-redup sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <a
          href={site.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-pena"
        >
          Kode sumber
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(dibuka di tab baru)</span>
        </a>
      </Container>
    </footer>
  )
}
