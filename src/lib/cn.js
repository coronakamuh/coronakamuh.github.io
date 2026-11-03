import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Gabungkan class Tailwind dengan aman; class yang bentrok diselesaikan oleh class terakhir. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
