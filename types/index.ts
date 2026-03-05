export type BusinessType =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'lounge'
  | 'salon'
  | 'clinic'
  | 'consultancy'
  | 'hotel'
  | 'architect'
  | 'doctor'
  | 'legal'
export type Language = 'en' | 'fr' | 'ar'

export interface Business {
  id: string
  name: string
  slug: string
  custom_domain?: string | null
  type: BusinessType
  logo_url?: string | null
  cover_image_url?: string | null
  primary_color: string
  secondary_color: string
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  whatsapp_number?: string | null
  language: Language
  opening_time: string
  closing_time: string
  slot_duration_minutes: number
  max_covers_per_slot: number
  is_active: boolean
  trial_started_at: string
  trial_ends_at: string
  subscription_status: 'trialing' | 'active' | 'past_due' | 'cancelled'
  created_at: string
}

export interface StaffMember {
  id: string
  business_id: string
  name: string
  role?: string | null
  avatar_url?: string | null
  is_active: boolean
}

export interface Service {
  id: string
  business_id: string
  name: string
  description?: string | null
  duration_minutes: number
  price?: number | null
  is_active: boolean
}
