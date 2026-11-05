// Fungsi murni untuk grafik (mudah diuji tanpa browser).

/** Batas atas sumbu yang "bulat" (1, 2, 2.5, 5, 10 × pangkat sepuluh). */
export function niceMax(max) {
  if (max <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(max))
  const n = max / power
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10
  return step * power
}

/** Indeks label sumbu-x yang ditampilkan: semua bila sedikit, selain itu sekitar 5 yang merata. */
export function tickIndexes(count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i)
  const picks = new Set([0, count - 1])
  for (let i = 1; i < 4; i += 1) picks.add(Math.round((i * (count - 1)) / 4))
  return [...picks].sort((a, b) => a - b)
}
