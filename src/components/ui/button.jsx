import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pena/15',
  {
    variants: {
      variant: {
        primary: 'bg-tombol text-white shadow-sm shadow-tombol/15 hover:bg-tombol-tua hover:shadow-md',
        outline: 'border border-garis bg-lembar text-tinta shadow-sm hover:border-pena/40 hover:bg-kertas hover:text-pena',
        ghost: 'text-tinta-redup hover:bg-garis-halus hover:text-tinta',
        danger: 'bg-bahaya-solid text-white shadow-sm hover:bg-bahaya-solid/90 focus-visible:ring-bahaya/20',
      },
      size: {
        md: 'h-10 px-4',
        icon: 'size-10',
        'icon-sm': 'size-8',
        sm: 'h-9 px-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

/** Tombol dasar. Pakai `asChild` untuk menampilkan tautan (<a>) dengan gaya tombol. */
export function Button({ className, variant, size, asChild = false, ...props }) {
  const Component = asChild ? Slot : 'button'
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
