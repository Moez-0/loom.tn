import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { BusinessType } from '@/types'
import type { TemplateProps } from '@/types/template'

const restaurant = dynamic(() => import('@/components/templates/restaurant'))
const salon = dynamic(() => import('@/components/templates/salon'))
const clinic = dynamic(() => import('@/components/templates/clinic'))
const consultancy = dynamic(() => import('@/components/templates/consultancy'))
const hotel = dynamic(() => import('@/components/templates/hotel'))

export const templateMap: Record<BusinessType, ComponentType<TemplateProps>> = {
  restaurant,
  salon,
  clinic,
  consultancy,
  hotel,
}
