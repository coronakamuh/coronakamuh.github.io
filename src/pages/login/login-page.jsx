import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo-mark'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { useAuth } from '@/lib/auth-context'
import { site } from '@/config/site'

export function LoginPage() {
  const { signIn, notice } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(identifier, password)
    } catch (failure) {
      setError(failure.message)
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-5 py-10">
      <div className="flex items-center gap-3">
        <LogoMark className="size-9 text-pena" />
        <span className="text-lg font-semibold tracking-tight">{site.name}</span>
      </div>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight">Masuk</h1>
      <p className="mt-1 text-sm text-tinta-redup">Gunakan akun admin yang sama dengan aplikasi lama.</p>

      {notice ? (
        <p role="status" className="mt-4 rounded-md border border-garis bg-garis-halus p-3 text-sm">
          {notice}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Username atau email" htmlFor="login-id">
          <Input
            id="login-id"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </Field>
        <Field label="Password" htmlFor="login-password">
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        {error ? (
          <p role="alert" className="text-sm text-bahaya">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          <LogIn />
          {busy ? 'Memeriksa…' : 'Masuk'}
        </Button>
      </form>
    </main>
  )
}
