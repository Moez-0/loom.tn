import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendBookingConfirmation, sendOwnerAlert } from '@/lib/resend'
import { BUSINESS_TYPE_VALUES } from '@/lib/business-type-config'

const reservationSchema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(6),
  customer_email: z.string().email().optional().or(z.literal('')),
  reservation_language: z.enum(['en', 'fr', 'ar']).optional(),
  date: z.string().min(10),
  time_slot: z.string().min(4),
  party_size: z.number().int().min(1).max(20),
  special_requests: z.string().optional().or(z.literal('')),
})

const businessSchema = z.object({
  name: z.string().min(1),
  type: z.enum(BUSINESS_TYPE_VALUES).nullable().optional(),
  language: z.enum(['en', 'fr', 'ar']).nullable().optional(),
  address: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  primary_color: z.string().nullable().optional(),
  primaryColor: z.string().nullable().optional(),
  secondary_color: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
})

const payloadSchema = z.object({
  reservation: reservationSchema,
  business: businessSchema,
})

export async function POST(request: Request) {
  const secret = process.env.NOTIFICATIONS_API_SECRET
  if (secret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const json = await request.json()
  const parsed = payloadSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const { reservation, business } = parsed.data

  await Promise.allSettled([
    sendBookingConfirmation(reservation, business),
    sendOwnerAlert(reservation, business),
  ])

  return NextResponse.json({ ok: true })
}
