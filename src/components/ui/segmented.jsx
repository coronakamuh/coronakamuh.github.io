import * as Tabs from '@radix-ui/react-tabs'

/** Pilihan beberapa opsi dalam satu baris (contoh: Minggu / Bulan). Bisa dioperasikan dengan keyboard. */
export function Segmented({ label, value, onValueChange, options, size = 'md' }) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange}>
      <Tabs.List aria-label={label} className="inline-flex gap-0.5 rounded-lg border border-garis bg-kertas p-0.5">
        {options.map((option) => (
          <Tabs.Trigger
            key={option.value}
            value={option.value}
            className={`${size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm'} rounded-md font-medium text-tinta-redup transition-colors hover:text-tinta data-[state=active]:bg-tombol data-[state=active]:text-white data-[state=active]:shadow-sm`}
          >
            {option.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
