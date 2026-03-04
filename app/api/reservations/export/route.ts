import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'

type ExportReservation = {
  customer_name: string
  customer_phone: string | null
  date: string
  time_slot: string
  party_size: number
  status: string
  source: string
}

function toCsvValue(value: string | number | null | undefined) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await ensureUserProfile(user)

  if (!profile?.business_id) {
    return NextResponse.json({ error: 'No business assigned' }, { status: 400 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim()
  const status = url.searchParams.get('status') || ''
  const date = url.searchParams.get('date') || ''

  let query = admin
    .from('reservations')
    .select('customer_name, customer_phone, date, time_slot, party_size, status, source')
    .eq('business_id', profile.business_id)

  if (q) {
    const escaped = q.replace(/,/g, ' ')
    query = query.or(`customer_name.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%`)
  }

  if (status && ['pending', 'confirmed', 'cancelled', 'no_show', 'completed'].includes(status)) {
    query = query.eq('status', status)
  }

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query.order('date', { ascending: true }).order('time_slot', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as ExportReservation[]
  const header = ['name', 'phone', 'date', 'time', 'party_size', 'status', 'source']
  const body = rows.map((row) =>
    [
      toCsvValue(row.customer_name),
      toCsvValue(row.customer_phone),
      toCsvValue(row.date),
      toCsvValue(row.time_slot),
      toCsvValue(row.party_size),
      toCsvValue(row.status),
      toCsvValue(row.source),
    ].join(',')
  )

  const csv = [header.join(','), ...body].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="reservations.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
