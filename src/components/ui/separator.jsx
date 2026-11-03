import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '@/lib/cn'

/** Garis pemisah berbasis Radix UI. Secara bawaan bersifat dekoratif (tidak dibacakan pembaca layar). */
export function Separator({ className, orientation = 'horizontal', decorative = true, ...props }) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-garis',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}
