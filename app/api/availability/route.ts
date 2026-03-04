import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAvailableSlots } from '@/lib/availability'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get('businessId')
  const date = request.nextUrl.searchParams.get('date')

  if (!businessId || !date) {
    return NextResponse.json({ error: 'businessId and date are required' }, { status: 400 })
  }

  const slots = await getAvailableSlots(businessId, date, supabase)

  return NextResponse.json({ slots })
}
