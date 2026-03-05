import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { BUSINESS_TYPE_VALUES } from '@/lib/business-type-config'

const languageValues = ['en', 'fr', 'ar'] as const

const createBusinessSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  type: z.enum(BUSINESS_TYPE_VALUES),
  language: z.enum(languageValues).default('fr'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

const updateBusinessSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  type: z.enum(BUSINESS_TYPE_VALUES).optional(),
  language: z.enum(languageValues).optional(),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  slot_duration_minutes: z.number().int().min(5).max(240).optional(),
  max_covers_per_slot: z.number().int().min(1).max(1000).optional(),
  is_active: z.boolean().optional(),
})

async function requireSuperadmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const profile = await ensureUserProfile(user)

  if (profile?.role !== 'superadmin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  const admin = createAdminClient()

  if (!admin) {
    return { error: NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 }) }
  }

  return { admin }
}

export async function GET() {
  const auth = await requireSuperadmin()
  if (auth.error) {
    return auth.error
  }

  const { data, error } = await auth.admin
    .from('businesses')
    .select('id, name, slug, type, language, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const auth = await requireSuperadmin()
  if (auth.error) {
    return auth.error
  }

  const json = await request.json()
  const parsed = createBusinessSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const payload = parsed.data
  const trialStart = new Date()
  const trialEnd = new Date(trialStart.getTime() + 2 * 24 * 60 * 60 * 1000)
  const { data, error } = await auth.admin
    .from('businesses')
    .insert({
      name: payload.name,
      slug: payload.slug,
      type: payload.type,
      language: payload.language,
      trial_started_at: trialStart.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
      subscription_status: 'trialing',
      phone: payload.phone || null,
      email: payload.email || null,
      address: payload.address || null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}

export async function PATCH(request: Request) {
  const auth = await requireSuperadmin()
  if (auth.error) {
    return auth.error
  }

  const json = await request.json()
  const parsed = updateBusinessSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const { id, ...rawUpdate } = parsed.data
  const updatePayload = Object.fromEntries(
    Object.entries(rawUpdate).map(([key, value]) => [key, value === '' ? null : value])
  )

  const { error } = await auth.admin.from('businesses').update(updatePayload).eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
