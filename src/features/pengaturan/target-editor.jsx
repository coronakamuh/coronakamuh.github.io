import { useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { FormMessage } from '@/components/ui/form-error'
import { useMutation } from '@/hooks/use-mutation'
import { parseTarget } from '@/lib/validation'
import { simpanTarget } from '@/services/brands'

function TargetRow({ row, onSaved }) {
  const initial = row.target === null ? '' : String(row.target)
  const [text, setText] = useState(initial)
  const [error, setError] = useState('')
  const save = useMutation(simpanTarget)
  const changed = text.trim() !== initial

  async function handleSubmit(event) {
    event.preventDefault()
    const parsed = parseTarget(text)
    setError(parsed.error ?? '')
    if (parsed.error) return
    try {
      const done = await save.run({ brand: row.brand, target: parsed.value })
      if (!done) return
      toast.success('Target tersimpan', { description: row.brand })
      onSaved()
    } catch (failure) {
      setError(failure.message)
    }
  }

  return (
    <li className="px-3.5 py-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2" noValidate>
        <label htmlFor={`target-${row.id}`} className="min-w-0 flex-1 truncate text-sm font-medium">
          {row.brand}
        </label>
        <Input
          id={`target-${row.id}`}
          inputMode="numeric"
          placeholder="Belum diatur"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="h-9 w-32 text-right"
        />
        <Button
          type="submit"
          variant={changed ? 'primary' : 'outline'}
          size="icon-sm"
          className="size-9"
          disabled={!changed || save.pending}
          aria-label={`Simpan target ${row.brand}`}
          title="Simpan"
        >
          <Check />
        </Button>
      </form>
      <div className="mt-1.5 empty:hidden">
        <FormMessage>{error}</FormMessage>
      </div>
    </li>
  )
}

/** Satu baris per brand aktif. Kosongkan isian untuk "belum diatur". */
export function TargetEditor({ rows, onSaved }) {
  return (
    <ul className="divide-y divide-garis-halus">
      {rows.map((row) => (
        <TargetRow key={`${row.id}-${row.target}`} row={row} onSaved={onSaved} />
      ))}
    </ul>
  )
}
