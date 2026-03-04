import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Business } from '@/types'

function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}

export const getBusinessBySlug = cache(async (slug: string): Promise<Business | null> => {
  const admin = createAdminClient()
  if (admin) {
    const { data } = await admin
      .from('businesses')
      .select(
        'id, name, slug, custom_domain, type, logo_url, cover_image_url, primary_color, secondary_color, description, address, phone, email, whatsapp_number, language, opening_time, closing_time, slot_duration_minutes, max_covers_per_slot, is_active, created_at'
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .single<Business>()

    return data ?? null
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select(
      'id, name, slug, custom_domain, type, logo_url, cover_image_url, primary_color, secondary_color, description, address, phone, email, whatsapp_number, language, opening_time, closing_time, slot_duration_minutes, max_covers_per_slot, is_active, created_at'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single<Business>()

  return data ?? null
})

export const getBusinessByDomain = cache(async (domain: string): Promise<Business | null> => {
  const normalizedDomain = normalizeDomain(domain)
  if (!normalizedDomain) {
    return null
  }

  const admin = createAdminClient()
  if (admin) {
    const { data } = await admin
      .from('businesses')
      .select(
        'id, name, slug, custom_domain, type, logo_url, cover_image_url, primary_color, secondary_color, description, address, phone, email, whatsapp_number, language, opening_time, closing_time, slot_duration_minutes, max_covers_per_slot, is_active, created_at'
      )
      .eq('custom_domain', normalizedDomain)
      .eq('is_active', true)
      .single<Business>()

    return data ?? null
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select(
      'id, name, slug, custom_domain, type, logo_url, cover_image_url, primary_color, secondary_color, description, address, phone, email, whatsapp_number, language, opening_time, closing_time, slot_duration_minutes, max_covers_per_slot, is_active, created_at'
    )
    .eq('custom_domain', normalizedDomain)
    .eq('is_active', true)
    .single<Business>()

  return data ?? null
})
