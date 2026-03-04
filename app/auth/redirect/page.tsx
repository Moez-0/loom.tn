import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPostLoginPath } from '@/lib/auth/profile'

export default async function AuthRedirectPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const destination = await getPostLoginPath(user)
  redirect(destination)
}
