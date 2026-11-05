import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CardBody } from '@/components/ui/card'
import { Field, Input } from '@/components/ui/field'
import { FormMessage } from '@/components/ui/form-error'
import { useMutation } from '@/hooks/use-mutation'
import { useAuth } from '@/lib/auth-context'
import { validatePasswordChange } from '@/lib/validation'
import { changePassword } from '@/services/auth'

const blank = { current: '', next: '', confirm: '' }

export function GantiPassword() {
  const { email } = useAuth()
  const [value, setValue] = useState(blank)
  const [error, setError] = useState('')
  const save = useMutation(changePassword)
  const set = (key) => (event) => setValue((current) => ({ ...current, [key]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    const problem = validatePasswordChange(value)
    setError(problem ?? '')
    if (problem) return
    try {
      const done = await save.run({ email, current: value.current, next: value.next })
      if (!done) return
      setValue(blank)
      toast.success('Password diganti', { description: 'Berlaku juga di aplikasi lama.' })
    } catch (failure) {
      setError(failure.message)
    }
  }

  return (
    <CardBody>
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4" noValidate>
        <Field label="Password saat ini" htmlFor="pw-current">
          <Input id="pw-current" type="password" autoComplete="current-password" value={value.current} onChange={set('current')} />
        </Field>
        <Field label="Password baru" htmlFor="pw-next" hint="Minimal 8 karakter.">
          <Input id="pw-next" type="password" autoComplete="new-password" value={value.next} onChange={set('next')} />
        </Field>
        <Field label="Ulangi password baru" htmlFor="pw-confirm">
          <Input id="pw-confirm" type="password" autoComplete="new-password" value={value.confirm} onChange={set('confirm')} />
        </Field>
        <FormMessage>{error}</FormMessage>
        <div>
          <Button type="submit" variant="outline" disabled={save.pending}>
            {save.pending ? 'Menyimpan…' : 'Ganti Password'}
          </Button>
        </div>
      </form>
    </CardBody>
  )
}
