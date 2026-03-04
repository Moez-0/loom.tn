import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

type UserProfile = {
  id: string
  role: 'superadmin' | 'owner' | 'staff'
  business_id: string | null
}

function isSuperadminEmail(email?: string | null) {
  const superadminEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase()
  if (!superadminEmail || !email) {
    return false
  }
  return email.toLowerCase() === superadminEmail
}

function getDefaultName(user: User) {
  const fromMetadata =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim())

  if (fromMetadata) {
    return fromMetadata
  }

  return user.email?.split('@')[0] || null
}

export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  const admin = createAdminClient()
  const fallbackRole: UserProfile['role'] = isSuperadminEmail(user.email) ? 'superadmin' : 'owner'

  if (!admin) {
    return {
      id: user.id,
      role: fallbackRole,
      business_id: null,
    }
  }

  const { data: existing } = await admin
    .from('users')
    .select('id, role, business_id')
    .eq('id', user.id)
    .single<UserProfile>()

  const targetRole: UserProfile['role'] = isSuperadminEmail(user.email) ? 'superadmin' : existing?.role || 'owner'

  if (!existing) {
    const { data: created } = await admin
      .from('users')
      .insert({
        id: user.id,
        role: targetRole,
        full_name: getDefaultName(user),
      })
      .select('id, role, business_id')
      .single<UserProfile>()

    return created ?? null
  }

  if (existing.role !== targetRole) {
    const { data: updated } = await admin
      .from('users')
      .update({ role: targetRole })
      .eq('id', user.id)
      .select('id, role, business_id')
      .single<UserProfile>()

    return updated ?? existing
  }

  return existing
}

export async function getPostLoginPath(user: User) {
  const profile = await ensureUserProfile(user)

  if (profile?.role === 'superadmin') {
    return '/admin'
  }

  return '/dashboard'
}
