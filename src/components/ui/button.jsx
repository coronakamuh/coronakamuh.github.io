import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-pena text-white hover:bg-pena-tua',
        outline:
          'border border-garis bg-lembar text-tinta hover:border-pena hover:text-pena',
        ghost: 'text-tinta hover:bg-garis-halus',
      },
      size: {
        md: 'h-10 px-4',
        icon: 'size-10',
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
