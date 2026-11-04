import { useState } from 'react'
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
    <li className="py-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center" noValidate>
        <label htmlFor={`target-${row.id}`} className="min-w-0 flex-1 truncate text-sm font-medium">
          {row.brand}
        </label>
        <div className="flex gap-2 sm:w-80">
          <Input id={`target-${row.id}`} inputMode="numeric" placeholder="Belum diatur" value={text} onChange={(event) => setText(event.target.value)} />
          <Button type="submit" variant="outline" disabled={!changed || save.pending}>
            Simpan
          </Button>
        </div>
      </form>
      <div className="mt-2 empty:hidden">
        <FormMessage>{error}</FormMessage>
      </div>
    </li>
  )
}

/** Satu baris per brand aktif. Kosongkan isian untuk "belum diatur". */
export function TargetEditor({ rows, onSaved }) {
  return (
    <ul className="divide-y divide-garis-halus px-4 pb-2 sm:px-5">
      {rows.map((row) => (
        <TargetRow key={`${row.id}-${row.target}`} row={row} onSaved={onSaved} />
      ))}
    </ul>
  )
}
