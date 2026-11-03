import { Container } from '@/components/layout/container'
import { plannedModules } from '@/config/modules'

export function ModuleList() {
  return (
    <section id="modul" aria-labelledby="judul-modul" className="scroll-mt-6">
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        <div>
          <h2 id="judul-modul" className="font-display text-2xl font-semibold tracking-tight">
            Modul yang direncanakan
          </h2>
          <p className="mt-3 max-w-md text-tinta-redup">
            Belum ada yang bisa digunakan. Modul dikerjakan satu per satu.
          </p>
        </div>

        <ul className="divide-y divide-garis border-y border-garis">
          {plannedModules.map(({ id, name, description, icon: Icon }) => (
            <li key={id} className="flex gap-4 py-5">
              <Icon className="mt-0.5 size-5 shrink-0 text-pena" aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg leading-snug font-semibold">{name}</h3>
                <p className="text-tinta-redup">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
