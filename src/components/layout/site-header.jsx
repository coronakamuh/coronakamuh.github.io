import { LogoMark } from '@/components/brand/logo-mark'
import { Container } from '@/components/layout/container'
import { site } from '@/config/site'

export function SiteHeader() {
  return (
    <header className="border-b border-garis-halus">
      <Container as="div" className="flex h-16 items-center gap-3">
        <LogoMark className="size-8 text-pena" />
        <span className="font-display text-lg font-semibold tracking-tight">{site.name}</span>
      </Container>
    </header>
  )
}
