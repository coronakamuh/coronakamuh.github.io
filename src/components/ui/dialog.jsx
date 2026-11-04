import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const overlayClass = 'fixed inset-0 z-40 bg-tinta/40'

/** Jendela di tengah layar (untuk formulir singkat). */
export function Modal({ open, onOpenChange, title, description, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-lembar p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-tinta-redup">
                {description}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Tutup">
                <X />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="mt-5">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Panel yang meluncur dari kiri (untuk menu di HP). */
export function Drawer({ open, onOpenChange, title, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-lembar shadow-xl"
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
