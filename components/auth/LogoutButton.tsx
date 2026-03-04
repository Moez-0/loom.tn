'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type LogoutButtonProps = {
  label?: string
  className?: string
}

export default function LogoutButton({ label = 'Logout', className }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <button type="button" className={className ?? 'btn-secondary'} onClick={handleLogout} disabled={loading}>
      {loading ? 'Signing out...' : label}
    </button>
  )
}
