import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type CallbackPageProps = {
  searchParams: {
    code?: string
    next?: string
  }
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const code = searchParams.code
  const next = searchParams.next || '/auth/redirect'

  if (!code) {
    redirect('/auth/login?error=missing_code')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    redirect('/auth/login?error=auth_callback_failed')
  }

  redirect(next)
}
