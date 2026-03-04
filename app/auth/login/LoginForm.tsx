'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

type LoginFormProps = {
  nextPath: string
}

export default function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter()
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setSubmitting(false)
      return
    }

    router.push(nextPath)
    router.refresh()
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-[#888888]" htmlFor="email">
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none transition focus:border-[#0067b0]"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-[#888888]" htmlFor="password">
          {t('password')}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-md border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none transition focus:border-[#0067b0]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-md bg-[#0067b0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={submitting}
      >
        {submitting ? t('submitting') : t('submit')}
      </button>

      <p className="text-sm text-[#888888]">
        {t('noAccount')}{' '}
        <Link href={`/auth/signup?next=${encodeURIComponent(nextPath)}`} className="text-white underline underline-offset-4">
          {t('signUp')}
        </Link>
      </p>
    </form>
  )
}
