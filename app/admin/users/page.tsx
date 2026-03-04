import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'

type ManagedUser = {
  id: string
  full_name: string | null
  role: 'superadmin' | 'owner' | 'staff'
  business_id: string | null
  created_at: string
}

type BusinessItem = {
  id: string
  name: string
}

async function assertSuperadmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin/users')
  }

  const profile = await ensureUserProfile(user)
  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  return { user }
}

async function performUserSync() {
  const admin = createAdminClient()
  if (!admin) {
    return
  }

  const { data: existingRows } = await admin.from('users').select('id')
  const existingIds = new Set((existingRows ?? []).map((row) => row.id))

  const superadminEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase()
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error || !data?.users?.length) {
      break
    }

    const missingUsers = data.users.filter((authUser) => !existingIds.has(authUser.id))

    if (missingUsers.length > 0) {
      await admin.from('users').insert(
        missingUsers.map((authUser) => ({
          id: authUser.id,
          full_name:
            (typeof authUser.user_metadata?.full_name === 'string' && authUser.user_metadata.full_name) ||
            (typeof authUser.user_metadata?.name === 'string' && authUser.user_metadata.name) ||
            authUser.email?.split('@')[0] ||
            null,
          role:
            superadminEmail && authUser.email?.toLowerCase() === superadminEmail
              ? 'superadmin'
              : 'owner',
        }))
      )

      missingUsers.forEach((authUser) => existingIds.add(authUser.id))
    }

    if (data.users.length < perPage) {
      break
    }

    page += 1
  }

  revalidatePath('/admin/users')
}

async function syncPublicUsersWithAuth() {
  'use server'

  await assertSuperadmin()
  await performUserSync()
}

async function updateUserAccess(formData: FormData) {
  'use server'

  await assertSuperadmin()

  const userId = String(formData.get('userId') ?? '')
  const role = String(formData.get('role') ?? 'owner')
  const businessIdRaw = String(formData.get('business_id') ?? '')
  const business_id = businessIdRaw || null

  if (!userId || !['superadmin', 'owner', 'staff'].includes(role)) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin
    .from('users')
    .update({
      role,
      business_id,
    })
    .eq('id', userId)

  revalidatePath('/admin/users')
}

export default async function AdminUsersPage() {
  const t = await getTranslations('admin')
  await assertSuperadmin()
  const admin = createAdminClient()

  if (!admin) {
    return (
      <main>
        <p className="border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('loadError')}: Missing SUPABASE_SERVICE_ROLE_KEY
        </p>
      </main>
    )
  }

  await performUserSync()

  const [{ data: usersData }, { data: businessesData }, authUsers] = await Promise.all([
    admin.from('users').select('id, full_name, role, business_id, created_at').order('created_at', { ascending: false }),
    admin.from('businesses').select('id, name').order('name', { ascending: true }),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const users = (usersData ?? []) as ManagedUser[]
  const businesses = (businessesData ?? []) as BusinessItem[]
  const emailMap = new Map<string, string>()

  for (const authUser of authUsers.data?.users ?? []) {
    if (authUser.email) {
      emailMap.set(authUser.id, authUser.email)
    }
  }

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('admin')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('usersTitle')}</h1>
        </div>
        <form action={syncPublicUsersWithAuth}>
          <button type="submit" className="btn-secondary inline-flex items-center">
            {t('syncUsers')}
          </button>
        </form>
      </div>

      <div className="overflow-x-auto border border-loom-border bg-loom-white">
        <table className="w-full border-collapse text-left text-[0.938rem]">
          <thead>
            <tr className="border-b border-loom-border bg-loom-surface">
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('usersTable.name')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('usersTable.email')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('usersTable.role')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('usersTable.business')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('usersTable.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-loom-muted" colSpan={5}>
                  {t('usersEmpty')}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-loom-border last:border-b-0">
                  <td className="px-4 py-3 text-loom-black">{user.full_name || '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm text-loom-muted">{emailMap.get(user.id) || '—'}</td>
                  <td className="px-4 py-3" colSpan={3}>
                    <form action={updateUserAccess} className="grid gap-3 md:grid-cols-[180px_220px_auto] md:items-center">
                      <input type="hidden" name="userId" value={user.id} />
                      <select name="role" className="input w-full md:max-w-[180px]" defaultValue={user.role}>
                        <option value="superadmin">{t('roles.superadmin')}</option>
                        <option value="owner">{t('roles.owner')}</option>
                        <option value="staff">{t('roles.staff')}</option>
                      </select>
                      <select name="business_id" className="input w-full md:max-w-[220px]" defaultValue={user.business_id ?? ''}>
                        <option value="">{t('usersUnassigned')}</option>
                        {businesses.map((business) => (
                          <option key={business.id} value={business.id}>
                            {business.name}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn-primary !px-4 !py-2 !text-xs">
                        {t('usersSave')}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
