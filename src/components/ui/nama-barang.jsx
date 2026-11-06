import { itemKind, KIND_LABEL } from '@/lib/item-kind'

// Ikon garis 14px, satu warna netral. aria-hidden: nama barang tetap menjadi teks utamanya.
const ICONS = {
  pintu: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="1" />
      <circle cx="15" cy="12.5" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  engsel: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M12 4v16" />
      <circle cx="8" cy="8" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  gembok: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
}

/** Nama barang dengan ikon jenis di sebelahnya bila jenisnya jelas dari nama. */
export function NamaBarang({ name }) {
  const kind = itemKind(name)
  if (!kind) return <>{name}</>
  return (
    <span className="inline-flex min-w-0 items-baseline gap-1.5">
      <span title={KIND_LABEL[kind]} className="shrink-0">
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="relative top-[2px] text-tinta-redup"
      >
        {ICONS[kind]}
      </svg>
      </span>
      <span className="min-w-0 break-words">{name}</span>
    </span>
  )
}
