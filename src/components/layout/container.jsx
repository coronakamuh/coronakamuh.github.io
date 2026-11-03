import { cn } from '@/lib/cn'

/** Pembungkus lebar konten. Mobile-first: gutter 20px di ponsel, 32px di layar lebih besar. */
export function Container({ as: Component = 'div', className, ...props }) {
  return <Component className={cn('mx-auto w-full max-w-5xl px-5 sm:px-8', className)} {...props} />
}
