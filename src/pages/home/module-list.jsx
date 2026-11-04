import { Container } from '@/components/layout/container'
import { plannedModules } from '@/config/modules'

export function ModuleList() {
  return (
    <section id="modul" aria-labelledby="judul-modul">
      <Container>
        <h2 id="judul-modul" className="text-sm font-medium text-tinta-redup">
          Modul yang direncanakan
        </h2>
        <ul className="mt-4 max-w-xl divide-y divide-garis border-y border-garis">
          {plannedModules.map(({ id, name, description, icon: Icon }) => (
            <li key={id} className="flex items-center gap-4 py-4">
              <Icon className="size-5 shrink-0 text-pena" aria-hidden="true" />
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-tinta-redup">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
