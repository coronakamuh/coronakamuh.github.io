import * as Tabs from '@radix-ui/react-tabs'

/** Pilihan beberapa opsi dalam satu baris (contoh: Minggu / Bulan). Bisa dioperasikan dengan keyboard. */
export function Segmented({ label, value, onValueChange, options }) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange}>
      <Tabs.List aria-label={label} className="inline-flex gap-0.5 rounded-lg border border-garis bg-kertas p-0.5">
        {options.map((option) => (
          <Tabs.Trigger
            key={option.value}
            value={option.value}
            className="h-8 rounded-md px-3 text-sm font-medium text-tinta-redup transition-colors hover:text-tinta data-[state=active]:bg-tombol data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            {option.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
