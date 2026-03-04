'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

type SignupFormProps = {
  nextPath: string
}

export default function SignupForm({ nextPath }: SignupFormProps) {
  const router = useRouter()
  const t = useTranslations('auth')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function getAuthRedirectBaseUrl() {
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.trim()
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin
    }

    if (appUrl) {
      return appUrl
    }

    if (appDomain) {
      return `https://${appDomain}`
    }

    return 'http://localhost:3000'
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', getAuthRedirectBaseUrl())
    callbackUrl.searchParams.set('next', '/auth/login?verified=1')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim() || null,
        },
        emailRedirectTo: callbackUrl.toString(),
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setSubmitting(false)
      return
    }

    if (data.session) {
      router.push(nextPath)
      router.refresh()
      return
    }

    setSuccess(t('signupCheckEmail'))
    setSubmitting(false)
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-[#888888]" htmlFor="full_name">
          {t('fullName')}
        </label>
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          className="w-full rounded-md border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none transition focus:border-[#0067b0]"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
      </div>

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
          autoComplete="new-password"
          className="w-full rounded-md border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none transition focus:border-[#0067b0]"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-[#888888]" htmlFor="confirm_password">
          {t('confirmPassword')}
        </label>
        <input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-md border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none transition focus:border-[#0067b0]"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? (
        <div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3">
          <p className="text-sm text-emerald-300">{success}</p>
          <p className="mt-1 text-xs text-emerald-200">{t('signupCheckEmailHint')}</p>
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-md bg-[#0067b0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={submitting}
      >
        {submitting ? t('signupSubmitting') : t('signupSubmit')}
      </button>

      <p className="text-sm text-[#888888]">
        {t('haveAccount')}{' '}
        <Link href={`/auth/login?next=${encodeURIComponent(nextPath)}`} className="text-white underline underline-offset-4">
          {t('signIn')}
        </Link>
      </p>
    </form>
  )
}
