import { Resend } from 'resend'
import type { BusinessType } from '@/types'
import { usesAppointmentTerminology } from '@/lib/business-type-config'

type EmailBusiness = {
  name: string
  type?: BusinessType | null
  address?: string | null
  email?: string | null
  language?: 'en' | 'fr' | 'ar' | null
  button_style?: 'rounded' | 'pill' | null
  brand_color?: string | null
  background_color?: string | null
  surface_color?: string | null
  text_color?: string | null
}

type EmailReservation = {
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  reservation_language?: 'en' | 'fr' | 'ar' | null
  date: string
  time_slot: string
  party_size: number
  special_requests?: string | null
}

type EmailLocale = 'en' | 'fr' | 'ar'
type EmailCopy = {
  reservationUpdate: string
  bookingConfirmedSubject: string
  bookingConfirmedTitle: string
  bookingConfirmedIntro: string
  detailsTitle: string
  guest: string
  date: string
  time: string
  guests: string
  contactAddress: string
  ownerSubject: string
  ownerTitle: string
  ownerIntro: string
  customer: string
  phone: string
  partySize: string
  notes: string
  notProvided: string
}

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const DEFAULT_BRAND = '#111827'
const DEFAULT_BACKGROUND = '#f8fafc'
const DEFAULT_SURFACE = '#ffffff'
const DEFAULT_TEXT = '#111827'

const EMAIL_COPY: Record<EmailLocale, EmailCopy> = {
  en: {
    reservationUpdate: 'Reservation Update',
    bookingConfirmedSubject: 'Booking Confirmed',
    bookingConfirmedTitle: 'Your reservation is confirmed',
    bookingConfirmedIntro: 'Thanks for booking with {businessName}. Here are your reservation details:',
    detailsTitle: 'Reservation details',
    guest: 'Guest',
    date: 'Date',
    time: 'Time',
    guests: 'Guests',
    contactAddress: 'Location',
    ownerSubject: 'New Reservation',
    ownerTitle: 'New reservation received',
    ownerIntro: 'A new booking was made for {businessName}.',
    customer: 'Customer',
    phone: 'Phone',
    partySize: 'Party size',
    notes: 'Notes',
    notProvided: '—',
  },
  fr: {
    reservationUpdate: 'Mise à jour de réservation',
    bookingConfirmedSubject: 'Réservation confirmée',
    bookingConfirmedTitle: 'Votre réservation est confirmée',
    bookingConfirmedIntro: 'Merci d’avoir réservé chez {businessName}. Voici les détails de votre réservation :',
    detailsTitle: 'Détails de réservation',
    guest: 'Client',
    date: 'Date',
    time: 'Heure',
    guests: 'Personnes',
    contactAddress: 'Adresse',
    ownerSubject: 'Nouvelle réservation',
    ownerTitle: 'Nouvelle réservation reçue',
    ownerIntro: 'Une nouvelle réservation a été enregistrée pour {businessName}.',
    customer: 'Client',
    phone: 'Téléphone',
    partySize: 'Nombre de personnes',
    notes: 'Notes',
    notProvided: '—',
  },
  ar: {
    reservationUpdate: 'تحديث الحجز',
    bookingConfirmedSubject: 'تم تأكيد الحجز',
    bookingConfirmedTitle: 'تم تأكيد حجزك',
    bookingConfirmedIntro: 'شكرًا لحجزك مع {businessName}. إليك تفاصيل الحجز:',
    detailsTitle: 'تفاصيل الحجز',
    guest: 'العميل',
    date: 'التاريخ',
    time: 'الوقت',
    guests: 'عدد الأشخاص',
    contactAddress: 'العنوان',
    ownerSubject: 'حجز جديد',
    ownerTitle: 'تم استلام حجز جديد',
    ownerIntro: 'تم إنشاء حجز جديد لدى {businessName}.',
    customer: 'العميل',
    phone: 'الهاتف',
    partySize: 'عدد الأشخاص',
    notes: 'ملاحظات',
    notProvided: '—',
  },
}

const EMAIL_APPOINTMENT_COPY: Record<EmailLocale, EmailCopy> = {
  en: {
    reservationUpdate: 'Appointment Update',
    bookingConfirmedSubject: 'Appointment Confirmed',
    bookingConfirmedTitle: 'Your appointment is confirmed',
    bookingConfirmedIntro: 'Thanks for booking with {businessName}. Here are your appointment details:',
    detailsTitle: 'Appointment details',
    guest: 'Guest',
    date: 'Date',
    time: 'Time',
    guests: 'Guests',
    contactAddress: 'Location',
    ownerSubject: 'New Appointment',
    ownerTitle: 'New appointment received',
    ownerIntro: 'A new appointment was made for {businessName}.',
    customer: 'Customer',
    phone: 'Phone',
    partySize: 'Party size',
    notes: 'Notes',
    notProvided: '—',
  },
  fr: {
    reservationUpdate: 'Mise à jour de rendez-vous',
    bookingConfirmedSubject: 'Rendez-vous confirmé',
    bookingConfirmedTitle: 'Votre rendez-vous est confirmé',
    bookingConfirmedIntro: 'Merci d’avoir réservé chez {businessName}. Voici les détails de votre rendez-vous :',
    detailsTitle: 'Détails du rendez-vous',
    guest: 'Client',
    date: 'Date',
    time: 'Heure',
    guests: 'Personnes',
    contactAddress: 'Adresse',
    ownerSubject: 'Nouveau rendez-vous',
    ownerTitle: 'Nouveau rendez-vous reçu',
    ownerIntro: 'Un nouveau rendez-vous a été enregistré pour {businessName}.',
    customer: 'Client',
    phone: 'Téléphone',
    partySize: 'Nombre de personnes',
    notes: 'Notes',
    notProvided: '—',
  },
  ar: {
    reservationUpdate: 'تحديث الموعد',
    bookingConfirmedSubject: 'تم تأكيد الموعد',
    bookingConfirmedTitle: 'تم تأكيد موعدك',
    bookingConfirmedIntro: 'شكرًا لحجزك مع {businessName}. إليك تفاصيل الموعد:',
    detailsTitle: 'تفاصيل الموعد',
    guest: 'العميل',
    date: 'التاريخ',
    time: 'الوقت',
    guests: 'عدد الأشخاص',
    contactAddress: 'العنوان',
    ownerSubject: 'موعد جديد',
    ownerTitle: 'تم استلام موعد جديد',
    ownerIntro: 'تم إنشاء موعد جديد لدى {businessName}.',
    customer: 'العميل',
    phone: 'الهاتف',
    partySize: 'عدد الأشخاص',
    notes: 'ملاحظات',
    notProvided: '—',
  },
}

function escapeHtml(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeHexColor(color?: string | null, fallback = DEFAULT_BRAND) {
  if (!color) {
    return fallback
  }

  const trimmed = color.trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed
  }

  return fallback
}

function hexToRgb(hex: string) {
  const safe = hex.replace('#', '')
  const parsed = Number.parseInt(safe, 16)

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  }
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  const safeAlpha = Math.min(Math.max(alpha, 0), 1)
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`
}

function normalizeLocale(value?: string | null, fallback: EmailLocale = 'fr'): EmailLocale {
  return value === 'en' || value === 'fr' || value === 'ar' ? value : fallback
}

function resolveCopy(businessType?: BusinessType | null) {
  return businessType && usesAppointmentTerminology(businessType) ? EMAIL_APPOINTMENT_COPY : EMAIL_COPY
}

function translate(
  locale: EmailLocale,
  key: keyof EmailCopy,
  variables?: Record<string, string>,
  businessType?: BusinessType | null
) {
  const template = resolveCopy(businessType)[locale][key]

  if (!variables) {
    return template
  }

  return Object.entries(variables).reduce((result, [name, replacement]) => {
    return result.replaceAll(`{${name}}`, replacement)
  }, template)
}

function getBranding(business: EmailBusiness) {
  return {
    buttonStyle: business.button_style === 'pill' ? 'pill' : 'rounded',
    brand: normalizeHexColor(business.brand_color, DEFAULT_BRAND),
    background: normalizeHexColor(business.background_color, DEFAULT_BACKGROUND),
    surface: normalizeHexColor(business.surface_color, DEFAULT_SURFACE),
    text: normalizeHexColor(business.text_color, DEFAULT_TEXT),
  }
}

const emailBase = (business: EmailBusiness, locale: EmailLocale, content: string) => {
  const brand = getBranding(business)
  const businessName = escapeHtml(business.name)
  const isArabic = locale === 'ar'
  const textAlign = isArabic ? 'right' : 'left'
  const direction = isArabic ? 'rtl' : 'ltr'
  const pageBg = brand.background
  const panelBg = brand.surface
  const bodyText = brand.text
  const muted = withAlpha(brand.text, 0.65)
  const border = withAlpha(brand.text, 0.18)
  const shadow = withAlpha(brand.text, 0.18)

  return `
  <div dir="${direction}" style="margin:0;background:${pageBg};padding:28px 16px;font-family:'DM Sans',system-ui,sans-serif;color:${bodyText};">
    <div style="max-width:640px;margin:0 auto;background:${panelBg};border:1px solid ${border};border-radius:20px;overflow:hidden;box-shadow:0 18px 48px ${shadow};">
      <div style="height:5px;background:${brand.brand};"></div>
      <div style="padding:22px 24px 12px;display:flex;align-items:center;gap:12px;${isArabic ? 'flex-direction:row-reverse;' : ''}">
        <div style="text-align:${textAlign};">
          <p style="margin:0;font-size:18px;font-weight:700;line-height:1.3;">${businessName}</p>
          <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${muted};">${escapeHtml(
            translate(locale, 'reservationUpdate', undefined, business.type)
          )}</p>
        </div>
      </div>
      <div style="padding:12px 24px 24px;">
        ${content}
      </div>
    </div>
  </div>
`
}

const detailRow = (label: string, value: string | number, text: string, border: string, muted: string) => `
  <tr>
    <td style="padding:11px 0;border-top:1px solid ${border};color:${muted};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:11px 0;border-top:1px solid ${border};font-size:14px;color:${text};">${escapeHtml(value)}</td>
  </tr>
`

export async function sendBookingConfirmation(reservation: EmailReservation, business: EmailBusiness) {
  if (!resend || !reservation.customer_email) {
    return
  }

  const locale = normalizeLocale(reservation.reservation_language ?? business.language ?? 'fr')
  const theme = getBranding(business)
  const textMain = theme.text
  const textMuted = withAlpha(theme.text, 0.74)
  const border = withAlpha(theme.text, 0.18)
  const buttonRadius = theme.buttonStyle === 'pill' ? '9999px' : '12px'
  const intro = translate(locale, 'bookingConfirmedIntro', { businessName: business.name }, business.type)

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: reservation.customer_email,
    subject: `${translate(locale, 'bookingConfirmedSubject', undefined, business.type)} — ${business.name}`,
    html: emailBase(
      business,
      locale,
      `
      <div style="display:inline-block;margin:0 0 12px;padding:7px 12px;border-radius:${buttonRadius};background:${theme.brand};color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(
        translate(locale, 'bookingConfirmedSubject', undefined, business.type)
      )}</div>
      <h2 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:${textMain};font-weight:800;">${escapeHtml(
        translate(locale, 'bookingConfirmedTitle', undefined, business.type)
      )}</h2>
      <p style="margin:0 0 18px;font-size:14px;color:${textMuted};">${escapeHtml(intro)}</p>
      <div style="border:1px solid ${border};border-radius:14px;padding:14px 16px;background:${theme.surface};">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${textMuted};">${escapeHtml(
          translate(locale, 'detailsTitle', undefined, business.type)
        )}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${detailRow(translate(locale, 'guest', undefined, business.type), reservation.customer_name, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'date', undefined, business.type), reservation.date, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'time', undefined, business.type), reservation.time_slot, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'guests', undefined, business.type), reservation.party_size, textMain, border, textMuted)}
        </table>
      </div>
      ${
        business.address
          ? `<p style="margin:16px 0 0;padding:12px 14px;border-radius:12px;background:${theme.background};font-size:13px;color:${textMain};border:1px solid ${border};">${escapeHtml(
              translate(locale, 'contactAddress', undefined, business.type)
            )}: ${escapeHtml(
              business.address
            )}</p>`
          : ''
      }
    `
    ),
  })
}

export async function sendOwnerAlert(reservation: EmailReservation, business: EmailBusiness) {
  if (!resend || !business.email) {
    return
  }

  const locale = normalizeLocale(reservation.reservation_language ?? business.language ?? 'fr')
  const theme = getBranding(business)
  const textMain = theme.text
  const textMuted = withAlpha(theme.text, 0.74)
  const border = withAlpha(theme.text, 0.18)
  const chipRadius = theme.buttonStyle === 'pill' ? '9999px' : '10px'
  const intro = translate(locale, 'ownerIntro', { businessName: business.name }, business.type)

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: business.email,
    subject: `${translate(locale, 'ownerSubject', undefined, business.type)} — ${reservation.customer_name}`,
    html: emailBase(
      business,
      locale,
      `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;">
        <h2 style="margin:0;font-size:22px;line-height:1.25;color:${textMain};font-weight:800;">${escapeHtml(
          translate(locale, 'ownerTitle', undefined, business.type)
        )}</h2>
        <span style="display:inline-block;padding:5px 10px;border-radius:${chipRadius};border:1px solid ${withAlpha(theme.brand, 0.45)};background:${withAlpha(theme.brand, 0.12)};color:${theme.brand};font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap;">${escapeHtml(
          translate(locale, 'ownerSubject', undefined, business.type)
        )}</span>
      </div>
      <p style="margin:0 0 14px;font-size:14px;color:${textMuted};">${escapeHtml(intro)}</p>
      <div style="border:1px solid ${border};border-radius:14px;padding:14px 16px;background:${theme.surface};">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${textMuted};">${escapeHtml(
          translate(locale, 'detailsTitle', undefined, business.type)
        )}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${detailRow(translate(locale, 'customer', undefined, business.type), reservation.customer_name, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'phone', undefined, business.type), reservation.customer_phone, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'date', undefined, business.type), reservation.date, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'time', undefined, business.type), reservation.time_slot, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'partySize', undefined, business.type), reservation.party_size, textMain, border, textMuted)}
          ${detailRow(
            translate(locale, 'notes', undefined, business.type),
            reservation.special_requests || translate(locale, 'notProvided', undefined, business.type),
            textMain,
            border,
            textMuted
          )}
        </table>
      </div>
      <p style="margin:14px 0 0;font-size:12px;color:${textMuted};">${escapeHtml(
        translate(locale, 'ownerTitle', undefined, business.type)
      )}</p>
    `
    ),
  })
}
