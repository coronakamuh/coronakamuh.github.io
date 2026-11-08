/**
 * Judul halaman gaya ringkas: kotak ikon, judul, keterangan kecil.
 * actions: tombol atau ringkasan di sisi kanan. Di HP turun ke bawah judul, kecuali inlineActions
 * (dipakai untuk ringkasan kecil yang tetap sebaris dengan judul).
 */
export function PageTitle({ icon: Icon, title, description, actions, inlineActions = false }) {
  return (
    <div className={inlineActions ? 'flex items-center justify-between gap-3' : 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'}>
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pena/10 text-pena">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-lg leading-tight font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-xs text-tinta-redup">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
