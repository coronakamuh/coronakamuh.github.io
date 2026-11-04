import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { controlClass } from '@/components/ui/field'
import { cn } from '@/lib/cn'

// Radix tidak menerima nilai kosong ('') pada pilihan, jadi dipetakan ke penanda ini.
const EMPTY = '__kosong__'

/**
 * Dropdown buatan sendiri (bukan bawaan peramban).
 * options: [{ value, label }]. value '' boleh dipakai untuk pilihan seperti "Semua brand".
 */
export function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder = 'Pilih',
  disabled,
  className,
  ...rest
}) {
  const hasEmptyOption = options.some((option) => option.value === '')
  const rootValue = value === '' ? (hasEmptyOption ? EMPTY : '') : value

  return (
    <SelectPrimitive.Root
      value={rootValue}
      onValueChange={(next) => onValueChange(next === EMPTY ? '' : next)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          controlClass,
          'flex items-center justify-between gap-2 text-left data-[placeholder]:text-tinta-redup',
          className,
        )}
        {...rest}
      >
        <span className="min-w-0 flex-1 truncate">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-tinta-redup" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          collisionPadding={8}
          className="z-[60] max-h-72 w-[var(--radix-select-trigger-width)] min-w-40 overflow-hidden rounded-md border border-garis bg-lembar shadow-lg"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value === '' ? EMPTY : option.value}
                className="relative flex h-10 cursor-pointer items-center rounded-sm pr-8 pl-3 text-sm outline-none select-none data-[highlighted]:bg-garis-halus data-[state=checked]:font-medium data-[state=checked]:text-pena"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-3">
                  <Check className="size-4" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
