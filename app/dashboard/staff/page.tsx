import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'

type StaffMember = {
  id: string
  name: string
  role: string | null
  avatar_url: string | null
  is_active: boolean
}

async function getBusinessId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/staff')
  }

  const profile = await ensureUserProfile(user)

  return profile?.business_id ?? null
}

async function addStaff(formData: FormData) {
  'use server'

  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  const avatarUrl = String(formData.get('avatar_url') ?? '').trim()
  const businessId = await getBusinessId()

  if (!businessId || !name) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin.from('staff_members').insert({
    business_id: businessId,
    name,
    role: role || null,
    avatar_url: avatarUrl || null,
  })

  revalidatePath('/dashboard/staff')
}

async function updateStaff(formData: FormData) {
  'use server'

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  const avatarUrl = String(formData.get('avatar_url') ?? '').trim()
  const businessId = await getBusinessId()

  if (!businessId || !id || !name) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin
    .from('staff_members')
    .update({ name, role: role || null, avatar_url: avatarUrl || null })
    .eq('id', id)
    .eq('business_id', businessId)

  revalidatePath('/dashboard/staff')
}

async function toggleStaff(formData: FormData) {
  'use server'

  const id = String(formData.get('id') ?? '')
  const nextActive = String(formData.get('next_active') ?? '') === 'true'
  const businessId = await getBusinessId()

  if (!businessId || !id) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await admin
    .from('staff_members')
    .update({ is_active: nextActive })
    .eq('id', id)
    .eq('business_id', businessId)

  revalidatePath('/dashboard/staff')
}

export default async function DashboardStaffPage() {
  const t = await getTranslations('staff')
  const businessId = await getBusinessId()

  if (!businessId) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">
          {t('noBusiness')}
        </p>
      </main>
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          Missing SUPABASE_SERVICE_ROLE_KEY
        </p>
      </main>
    )
  }

  const { data } = await admin
    .from('staff_members')
    .select('id, name, role, avatar_url, is_active')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  const staff = (data ?? []) as StaffMember[]

  return (
    <main>
      <p className="section-label">{t('dashboard')}</p>
      <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('title')}</h1>

      <section className="mt-6 border border-loom-border bg-loom-white p-6">
        <p className="section-label">{t('addLabel')}</p>
        <form action={addStaff} className="mt-4 grid gap-4 md:grid-cols-4">
          <input name="name" className="input" placeholder={t('form.name')} required />
          <input name="role" className="input" placeholder={t('form.role')} />
          <input name="avatar_url" className="input" placeholder={t('form.avatarUrl')} />
          <button type="submit" className="btn-primary">
            {t('actions.add')}
          </button>
        </form>
      </section>

      <section className="mt-6 overflow-x-auto border border-loom-border bg-loom-white">
        <table className="w-full border-collapse text-left text-[0.938rem]">
          <thead>
            <tr className="border-b border-loom-border bg-loom-surface">
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.name')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.role')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.avatarUrl')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.status')}</th>
              <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-loom-muted" colSpan={5}>
                  {t('empty')}
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="border-b border-loom-border last:border-b-0 align-top">
                  <td className="px-4 py-3" colSpan={3}>
                    <form action={updateStaff} className="grid gap-2 md:grid-cols-3">
                      <input type="hidden" name="id" value={member.id} />
                      <input name="name" className="input" defaultValue={member.name} required />
                      <input name="role" className="input" defaultValue={member.role ?? ''} />
                      <div className="flex gap-2">
                        <input
                          name="avatar_url"
                          className="input"
                          defaultValue={member.avatar_url ?? ''}
                        />
                        <button type="submit" className="btn-secondary !px-3 !py-2 !text-xs">
                          {t('actions.save')}
                        </button>
                      </div>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${member.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {member.is_active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleStaff}>
                      <input type="hidden" name="id" value={member.id} />
                      <input type="hidden" name="next_active" value={String(!member.is_active)} />
                      <button type="submit" className="btn-secondary !px-3 !py-2 !text-xs">
                        {member.is_active ? t('actions.disable') : t('actions.enable')}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  )
}
