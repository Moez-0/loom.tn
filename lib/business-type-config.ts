import type { BusinessType } from '@/types'

export type PublicOfferingsLabelKey = 'menuLabel' | 'servicesLabel' | 'expertiseLabel' | 'roomsLabel'

export const BUSINESS_TYPE_VALUES = [
  'restaurant',
  'cafe',
  'bar',
  'lounge',
  'salon',
  'clinic',
  'consultancy',
  'hotel',
  'architect',
  'doctor',
  'legal',
] as const satisfies readonly BusinessType[]

export type TemplateServiceSeed = {
  name: string
  description: string
  duration_minutes: number
  price: number | null
}

const BUSINESS_TYPE_SETTINGS: Record<
  BusinessType,
  {
    requiresService: boolean
    supportsStaff: boolean
    offeringsLabelKey: PublicOfferingsLabelKey
    defaultServices: TemplateServiceSeed[]
  }
> = {
  restaurant: {
    requiresService: false,
    supportsStaff: false,
    offeringsLabelKey: 'menuLabel',
    defaultServices: [],
  },
  cafe: {
    requiresService: false,
    supportsStaff: false,
    offeringsLabelKey: 'menuLabel',
    defaultServices: [],
  },
  bar: {
    requiresService: false,
    supportsStaff: false,
    offeringsLabelKey: 'menuLabel',
    defaultServices: [],
  },
  lounge: {
    requiresService: false,
    supportsStaff: false,
    offeringsLabelKey: 'menuLabel',
    defaultServices: [],
  },
  salon: {
    requiresService: true,
    supportsStaff: true,
    offeringsLabelKey: 'servicesLabel',
    defaultServices: [
      {
        name: 'Haircut & Styling',
        description: 'Personalized cut and styling finish.',
        duration_minutes: 60,
        price: 65,
      },
      {
        name: 'Color Touch-up',
        description: 'Root touch-up and tone balancing.',
        duration_minutes: 90,
        price: 95,
      },
      {
        name: 'Blowout',
        description: 'Wash and professional blow dry.',
        duration_minutes: 45,
        price: 40,
      },
    ],
  },
  clinic: {
    requiresService: true,
    supportsStaff: true,
    offeringsLabelKey: 'servicesLabel',
    defaultServices: [
      {
        name: 'Initial Consultation',
        description: 'First visit assessment and treatment plan.',
        duration_minutes: 30,
        price: 80,
      },
      {
        name: 'Follow-up Visit',
        description: 'Progress review and adjustment.',
        duration_minutes: 20,
        price: 50,
      },
      {
        name: 'Specialist Session',
        description: 'Dedicated specialist appointment.',
        duration_minutes: 45,
        price: 120,
      },
    ],
  },
  consultancy: {
    requiresService: true,
    supportsStaff: true,
    offeringsLabelKey: 'expertiseLabel',
    defaultServices: [
      {
        name: 'Discovery Call',
        description: 'Scope discussion and objectives alignment.',
        duration_minutes: 45,
        price: 0,
      },
      {
        name: 'Strategy Session',
        description: 'Deep-dive advisory workshop.',
        duration_minutes: 90,
        price: 180,
      },
      {
        name: 'Execution Review',
        description: 'Plan validation and implementation review.',
        duration_minutes: 60,
        price: 130,
      },
    ],
  },
  hotel: {
    requiresService: false,
    supportsStaff: false,
    offeringsLabelKey: 'roomsLabel',
    defaultServices: [
      {
        name: 'Standard Room',
        description: 'Comfort room with city view.',
        duration_minutes: 60,
        price: 120,
      },
      {
        name: 'Deluxe Room',
        description: 'Spacious room with premium amenities.',
        duration_minutes: 60,
        price: 180,
      },
      {
        name: 'Suite',
        description: 'Suite package for extended stays.',
        duration_minutes: 60,
        price: 260,
      },
    ],
  },
  architect: {
    requiresService: true,
    supportsStaff: true,
    offeringsLabelKey: 'expertiseLabel',
    defaultServices: [
      {
        name: 'Concept Consultation',
        description: 'Project brief and design direction workshop.',
        duration_minutes: 60,
        price: 140,
      },
      {
        name: 'Site Visit & Assessment',
        description: 'On-site measurements and feasibility review.',
        duration_minutes: 90,
        price: 220,
      },
      {
        name: 'Plan Review',
        description: 'Blueprint review with actionable feedback.',
        duration_minutes: 75,
        price: 180,
      },
    ],
  },
  doctor: {
    requiresService: true,
    supportsStaff: true,
    offeringsLabelKey: 'servicesLabel',
    defaultServices: [
      {
        name: 'General Consultation',
        description: 'Routine appointment and diagnosis.',
        duration_minutes: 25,
        price: 70,
      },
      {
        name: 'Follow-up Appointment',
        description: 'Post-treatment check and recommendations.',
        duration_minutes: 15,
        price: 45,
      },
      {
        name: 'Teleconsultation',
        description: 'Remote video consultation.',
        duration_minutes: 20,
        price: 55,
      },
    ],
  },
  legal: {
    requiresService: true,
    supportsStaff: true,
    offeringsLabelKey: 'expertiseLabel',
    defaultServices: [
      {
        name: 'Legal Consultation',
        description: 'Case review and legal guidance.',
        duration_minutes: 45,
        price: 120,
      },
      {
        name: 'Contract Review',
        description: 'Detailed contract risk and clause review.',
        duration_minutes: 60,
        price: 180,
      },
      {
        name: 'Representation Strategy',
        description: 'Preparation for negotiation or hearing.',
        duration_minutes: 75,
        price: 220,
      },
    ],
  },
}

export function requiresServiceSelection(businessType: BusinessType) {
  return BUSINESS_TYPE_SETTINGS[businessType].requiresService
}

export function supportsStaffSelection(businessType: BusinessType) {
  return BUSINESS_TYPE_SETTINGS[businessType].supportsStaff
}

export function offeringsLabelKeyForBusinessType(businessType: BusinessType) {
  return BUSINESS_TYPE_SETTINGS[businessType].offeringsLabelKey
}

export function getTemplateServicesForBusinessType(businessType: BusinessType): TemplateServiceSeed[] {
  return BUSINESS_TYPE_SETTINGS[businessType].defaultServices
}

export function usesAppointmentTerminology(businessType: BusinessType) {
  return businessType === 'salon'
    || businessType === 'clinic'
    || businessType === 'consultancy'
    || businessType === 'architect'
    || businessType === 'doctor'
    || businessType === 'legal'
}