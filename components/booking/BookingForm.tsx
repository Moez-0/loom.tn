'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import DatePicker from './DatePicker'
import TimeSlotPicker from './TimeSlotPicker'
import ServicePicker from './ServicePicker'
import StaffPicker from './StaffPicker'
import type { BusinessType, Service, StaffMember } from '@/types'

type BookingFormProps = {
  businessId: string
  slug: string
  businessType: BusinessType
  services: Service[]
  staff: StaffMember[]
  brand: {
    name: string
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
  }
}

type FormValues = {
  customer_name: string
  customer_phone: string
  customer_email?: string
  date: string
  time_slot: string
  service_id?: string
  staff_id?: string
  checkout_date?: string
  party_size: number
  special_requests?: string
}

export default function BookingForm({
  businessId,
  slug,
  businessType,
  services,
  staff,
  brand,
}: BookingFormProps) {
  const router = useRouter()
  const t = useTranslations('booking')
  const locale = useLocale() as 'en' | 'fr' | 'ar'
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schema = useMemo(
    () =>
      z.object({
        customer_name: z.string().min(2, t('errors.nameRequired')),
        customer_phone: z.string().min(6, t('errors.phoneRequired')),
        customer_email: z.string().email(t('errors.invalidEmail')).optional().or(z.literal('')),
        date: z.string().min(1, t('errors.dateRequired')),
        time_slot: z.string().min(1, t('errors.timeRequired')),
        service_id: z.string().uuid().optional().or(z.literal('')),
        staff_id: z.string().uuid().optional().or(z.literal('')),
        checkout_date: z.string().optional().or(z.literal('')),
        party_size: z.number().int().min(1).max(20),
        special_requests: z.string().optional(),
      }),
    [t]
  )

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      date: '',
      time_slot: '',
      service_id: '',
      staff_id: '',
      checkout_date: '',
      party_size: 2,
      special_requests: '',
    },
  })

  const date = watch('date')
  const timeSlot = watch('time_slot')
  const serviceId = watch('service_id')
  const staffId = watch('staff_id')

  const requiresService = businessType === 'salon' || businessType === 'clinic' || businessType === 'consultancy'
  const supportsStaff = businessType === 'salon' || businessType === 'clinic'
  const isHotel = businessType === 'hotel'
  const accent = brand.primaryColor || '#111827'
  const soft = brand.secondaryColor || '#f4f4f5'
  const inputClass = 'w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-700'
  const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500'

  useEffect(() => {
    if (!date) {
      setSlots([])
      setValue('time_slot', '')
      return
    }

    const controller = new AbortController()
    setLoadingSlots(true)
    setSubmitError(null)

    fetch(`/api/availability?businessId=${businessId}&date=${date}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Could not load slots')
        }
        const data = (await response.json()) as { slots: string[] }
        setSlots(data.slots || [])
        if (timeSlot && !data.slots?.includes(timeSlot)) {
          setValue('time_slot', '')
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSlots([])
          setSubmitError(t('errors.loadSlots'))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingSlots(false)
        }
      })

    return () => controller.abort()
  }, [businessId, date, setValue, t, timeSlot])

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return t('submitting')
    }
    return t('submit')
  }, [isSubmitting, t])

  async function onSubmit(values: FormValues) {
    setSubmitError(null)

    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        business_id: businessId,
        reservation_language: locale,
      }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      setSubmitError(payload?.error || t('errors.submitFailed'))
      return
    }

    router.push(`/${slug}/reserve/success`)
  }

  return (
    <form
      className="space-y-5"
      style={{
        ['--booking-accent' as string]: accent,
      }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-2 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="h-9 w-9 rounded object-cover" /> : null}
        <div>
          <p className="text-sm font-semibold text-zinc-900">{brand.name}</p>
            <p className="text-xs text-zinc-500">{t('reservationHelp')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="customer_name">
            {t('name')}
          </label>
          <input id="customer_name" className={inputClass} {...register('customer_name')} />
          {errors.customer_name ? <p className="mt-1 text-sm text-loom-error">{errors.customer_name.message}</p> : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="customer_phone">
            {t('phone')}
          </label>
          <input id="customer_phone" className={inputClass} {...register('customer_phone')} />
          {errors.customer_phone ? <p className="mt-1 text-sm text-loom-error">{errors.customer_phone.message}</p> : null}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="customer_email">
          {t('emailOptional')}
        </label>
        <input id="customer_email" type="email" className={inputClass} {...register('customer_email')} />
        {errors.customer_email ? <p className="mt-1 text-sm text-loom-error">{errors.customer_email.message}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {requiresService ? (
          <div>
            <label className={labelClass}>{t('service')}</label>
            <ServicePicker
              services={services}
              value={serviceId || ''}
              onChange={(value) => setValue('service_id', value, { shouldValidate: true })}
              placeholder={t('service')}
              className={inputClass}
            />
          </div>
        ) : null}

        {supportsStaff ? (
          <div>
            <label className={labelClass}>{t('staff')}</label>
            <StaffPicker
              staff={staff}
              value={staffId || ''}
              onChange={(value) => setValue('staff_id', value, { shouldValidate: true })}
              placeholder={t('staffOptional')}
              className={inputClass}
            />
          </div>
        ) : null}

        <div>
          <label className={labelClass} htmlFor="date">
            {t('date')}
          </label>
          <DatePicker value={date || ''} onChange={(value) => setValue('date', value)} className={`${inputClass} font-mono`} />
          {errors.date ? <p className="mt-1 text-sm text-loom-error">{errors.date.message}</p> : null}
        </div>

        {isHotel ? (
          <div>
            <label className={labelClass} htmlFor="checkout_date">
              {t('checkOut')}
            </label>
            <input id="checkout_date" type="date" className={`${inputClass} font-mono`} {...register('checkout_date')} />
          </div>
        ) : null}

        <div>
          <label className={labelClass} htmlFor="party_size">
            {t('partySize')}
          </label>
          <input
            id="party_size"
            type="number"
            min={1}
            max={20}
            className={inputClass}
            {...register('party_size', { valueAsNumber: true })}
          />
          {errors.party_size ? <p className="mt-1 text-sm text-loom-error">{errors.party_size.message}</p> : null}
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('time')}</label>
        {loadingSlots ? (
          <p className="text-sm text-loom-muted">{t('loadingSlots')}</p>
        ) : (
          <TimeSlotPicker
            slots={slots}
            value={timeSlot || ''}
            onChange={(slot) => setValue('time_slot', slot, { shouldValidate: true })}
            activeClassName="border-[var(--booking-accent)] bg-[var(--booking-accent)] text-white"
            defaultClassName="border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
          />
        )}
        <input type="hidden" {...register('time_slot')} />
        <input type="hidden" {...register('service_id')} />
        <input type="hidden" {...register('staff_id')} />
        {errors.time_slot ? <p className="mt-1 text-sm text-loom-error">{errors.time_slot.message}</p> : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="special_requests">
          {t('notes')}
        </label>
        <textarea id="special_requests" className={`${inputClass} min-h-24`} {...register('special_requests')} />
      </div>

      {submitError ? <p className="text-sm text-loom-error">{submitError}</p> : null}

      <button
        type="submit"
        className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
        style={{ backgroundColor: accent, boxShadow: `0 10px 24px ${accent}33` }}
        disabled={isSubmitting}
      >
        {submitLabel}
      </button>

      <div className="h-1 w-full rounded-full" style={{ backgroundColor: soft }} />
    </form>
  )
}
