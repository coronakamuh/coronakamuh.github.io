import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        netral: 'bg-garis-halus text-tinta-redup',
        info: 'bg-info/10 text-info',
        sukses: 'bg-sukses/10 text-sukses',
        peringatan: 'bg-peringatan/10 text-peringatan',
        bahaya: 'bg-bahaya/10 text-bahaya',
      },
    },
    defaultVariants: { tone: 'netral' },
  },
)

/** Label status kecil. tone: netral | info | sukses | peringatan | bahaya. */
export function Badge({ tone, className, ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
