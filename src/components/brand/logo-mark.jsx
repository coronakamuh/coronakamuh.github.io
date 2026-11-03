/** Lambang Dhouse Digital: huruf D pada kotak berwarna. Warna kotak mengikuti `currentColor`. */
export function LogoMark(props) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path
        d="M11 9.5h5.2a6.5 6.5 0 0 1 0 13H11z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
