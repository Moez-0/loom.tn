import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { sendBookingConfirmation, sendOwnerAlert } from '@/lib/resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const reservationSchema = z.object({
  business_id: z.string().uuid(),
  customer_name: z.string().min(2),
  customer_phone: z.string().min(6),
  customer_email: z.string().email().optional().or(z.literal('')),
  date: z.string().min(10),
  time_slot: z.string().min(4),
  service_id: z.string().uuid().optional().or(z.literal('')),
  staff_id: z.string().uuid().optional().or(z.literal('')),
  checkout_date: z.string().optional().or(z.literal('')),
  party_size: z.number().int().min(1).max(20),
  special_requests: z.string().max(1000).optional().or(z.literal('')),
  reservation_language: z.enum(['en', 'fr', 'ar']).optional(),
})

export async function POST(request: Request) {
  const json = await request.json()
  const parsed = reservationSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const payload = parsed.data

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, address, email, logo_url, primary_color, secondary_color, language, is_active')
    .eq('id', payload.business_id)
    .single<{
      id: string
      name: string
      address: string | null
      email: string | null
      logo_url: string | null
      primary_color: string | null
      secondary_color: string | null
      language: 'en' | 'fr' | 'ar'
      is_active: boolean
    }>()

  if (!business?.is_active) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const reservationPayload = {
    business_id: payload.business_id,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    customer_email: payload.customer_email || null,
    date: payload.date,
    time_slot: payload.time_slot,
    service_id: payload.service_id || null,
    staff_id: payload.staff_id || null,
    checkout_date: payload.checkout_date || null,
    party_size: payload.party_size,
    special_requests: payload.special_requests || null,
    status: 'pending',
    source: 'online',
  }

  const reservationLanguage = payload.reservation_language || business.language || 'fr'

  const { error } = await supabase.from('reservations').insert(reservationPayload)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await Promise.allSettled([
    sendBookingConfirmation({ ...reservationPayload, reservation_language: reservationLanguage }, business),
    sendOwnerAlert({ ...reservationPayload, reservation_language: reservationLanguage }, business),
  ])

  return NextResponse.json({ ok: true })
}
