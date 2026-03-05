import { addMinutes, format, isBefore, parse } from 'date-fns'
import type { SupabaseClient } from '@supabase/supabase-js'
import { usesAppointmentTerminology } from '@/lib/business-type-config'

export function normalizeTimeSlot(timeSlot: string) {
  return timeSlot.slice(0, 5)
}

export function generateTimeSlots(openingTime: string, closingTime: string, slotDuration: number) {
  const slots: string[] = []
  const base = new Date(2000, 0, 1)
  let current = parse(openingTime, 'HH:mm:ss', base)

  if (Number.isNaN(current.getTime())) {
    current = parse(openingTime, 'HH:mm', base)
  }

  let closing = parse(closingTime, 'HH:mm:ss', base)
  if (Number.isNaN(closing.getTime())) {
    closing = parse(closingTime, 'HH:mm', base)
  }

  while (isBefore(current, closing)) {
    slots.push(format(current, 'HH:mm'))
    current = addMinutes(current, slotDuration)
  }

  return slots
}

export async function getAvailableSlots(
  businessId: string,
  date: string,
  supabase: SupabaseClient
): Promise<string[]> {
  const { data: business } = await supabase
    .from('businesses')
    .select('type, opening_time, closing_time, slot_duration_minutes, max_covers_per_slot')
    .eq('id', businessId)
    .eq('is_active', true)
    .single<{
      type: import('@/types').BusinessType
      opening_time: string
      closing_time: string
      slot_duration_minutes: number
      max_covers_per_slot: number
    }>()

  if (!business) {
    return []
  }

  const allSlots = generateTimeSlots(
    business.opening_time,
    business.closing_time,
    business.slot_duration_minutes
  )

  const { data: reservations } = await supabase
    .from('reservations')
    .select('time_slot, party_size')
    .eq('business_id', businessId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed'])

  const counts: Record<string, number> = {}
  const isAppointmentBusiness = usesAppointmentTerminology(business.type)
  const maxPerSlot = isAppointmentBusiness ? 1 : business.max_covers_per_slot

  reservations?.forEach((reservation) => {
    const slot = reservation.time_slot ? normalizeTimeSlot(reservation.time_slot) : null
    if (!slot) {
      return
    }
    const slotWeight = isAppointmentBusiness ? 1 : (reservation.party_size || 1)
    counts[slot] = (counts[slot] || 0) + slotWeight
  })

  return allSlots.filter((slot) => (counts[slot] || 0) < maxPerSlot)
}
