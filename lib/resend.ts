import { Resend } from 'resend'

type EmailBusiness = {
  name: string
  address?: string | null
  email?: string | null
  language?: 'en' | 'fr' | 'ar' | null
  logo_url?: string | null
  logoUrl?: string | null
  primary_color?: string | null
  primaryColor?: string | null
  secondary_color?: string | null
  secondaryColor?: string | null
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

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const DEFAULT_PRIMARY = '#111827'
const DEFAULT_SECONDARY = '#f4f4f5'

const EMAIL_COPY: Record<
  EmailLocale,
  {
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
> = {
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

function normalizeHexColor(color?: string | null, fallback = DEFAULT_PRIMARY) {
  if (!color) {
    return fallback
  }

  const trimmed = color.trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed
  }

  return fallback
}

function normalizeLocale(value?: string | null, fallback: EmailLocale = 'fr'): EmailLocale {
  return value === 'en' || value === 'fr' || value === 'ar' ? value : fallback
}

function translate(locale: EmailLocale, key: keyof (typeof EMAIL_COPY)['en'], variables?: Record<string, string>) {
  const template = EMAIL_COPY[locale][key]
  if (!variables) {
    return template
  }

  return Object.entries(variables).reduce((result, [name, replacement]) => {
    return result.replaceAll(`{${name}}`, replacement)
  }, template)
}

function getBranding(business: EmailBusiness) {
  return {
    logoUrl: business.logo_url ?? business.logoUrl ?? null,
    primary: normalizeHexColor(business.primary_color ?? business.primaryColor, DEFAULT_PRIMARY),
    secondary: normalizeHexColor(business.secondary_color ?? business.secondaryColor, DEFAULT_SECONDARY),
  }
}

const emailBase = (business: EmailBusiness, locale: EmailLocale, content: string) => {
  const brand = getBranding(business)
  const businessName = escapeHtml(business.name)
  const isArabic = locale === 'ar'
  const textAlign = isArabic ? 'right' : 'left'
  const direction = isArabic ? 'rtl' : 'ltr'
  const panelBg = '#ffffff'
  const pageBg = brand.secondary
  const muted = '#64748b'
  const border = '#e2e8f0'
  const logo =
    brand.logoUrl && /^https?:\/\//i.test(brand.logoUrl)
      ? `<img src="${escapeHtml(brand.logoUrl)}" alt="${businessName}" style="width:52px;height:52px;border-radius:14px;object-fit:cover;border:1px solid ${border};" />`
      : ''

  return `
  <div dir="${direction}" style="margin:0;background:${pageBg};padding:28px 16px;font-family:'DM Sans',system-ui,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:0 auto;background:${panelBg};border:1px solid ${border};border-radius:20px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.12);">
      <div style="height:5px;background:${brand.primary};"></div>
      <div style="padding:22px 24px 12px;display:flex;align-items:center;gap:12px;${isArabic ? 'flex-direction:row-reverse;' : ''}">
        ${logo}
        <div style="text-align:${textAlign};">
          <p style="margin:0;font-size:18px;font-weight:700;line-height:1.3;">${businessName}</p>
          <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${muted};">${escapeHtml(
            translate(locale, 'reservationUpdate')
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

const detailRow = (label: string, value: string | number) => `
  <tr>
    <td style="padding:11px 0;border-top:1px solid #e2e8f0;color:#64748b;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:11px 0;border-top:1px solid #e2e8f0;font-size:14px;">${escapeHtml(value)}</td>
  </tr>
`

export async function sendBookingConfirmation(reservation: EmailReservation, business: EmailBusiness) {
  if (!resend || !reservation.customer_email) {
    return
  }

  const locale = normalizeLocale(reservation.reservation_language ?? business.language ?? 'fr')
  const brand = getBranding(business)
  const intro = translate(locale, 'bookingConfirmedIntro', { businessName: business.name })

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: reservation.customer_email,
    subject: `${translate(locale, 'bookingConfirmedSubject')} — ${business.name}`,
    html: emailBase(
      business,
      locale,
      `
      <h2 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:${brand.primary};font-weight:800;">${escapeHtml(
        translate(locale, 'bookingConfirmedTitle')
      )}</h2>
      <p style="margin:0 0 18px;font-size:14px;color:#475569;">${escapeHtml(intro)}</p>
      <div style="border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">${escapeHtml(
          translate(locale, 'detailsTitle')
        )}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${detailRow(translate(locale, 'guest'), reservation.customer_name)}
          ${detailRow(translate(locale, 'date'), reservation.date)}
          ${detailRow(translate(locale, 'time'), reservation.time_slot)}
          ${detailRow(translate(locale, 'guests'), reservation.party_size)}
        </table>
      </div>
      ${
        business.address
          ? `<p style="margin:16px 0 0;padding:12px 14px;border-radius:12px;background:${brand.secondary};font-size:13px;color:#334155;">${escapeHtml(
              translate(locale, 'contactAddress')
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
  const brand = getBranding(business)
  const intro = translate(locale, 'ownerIntro', { businessName: business.name })

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: business.email,
    subject: `${translate(locale, 'ownerSubject')} — ${reservation.customer_name}`,
    html: emailBase(
      business,
      locale,
      `
      <h2 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:${brand.primary};font-weight:800;">${escapeHtml(
        translate(locale, 'ownerTitle')
      )}</h2>
      <p style="margin:0 0 18px;font-size:14px;color:#475569;">${escapeHtml(intro)}</p>
      <div style="border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">${escapeHtml(
          translate(locale, 'detailsTitle')
        )}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${detailRow(translate(locale, 'customer'), reservation.customer_name)}
          ${detailRow(translate(locale, 'phone'), reservation.customer_phone)}
          ${detailRow(translate(locale, 'date'), reservation.date)}
          ${detailRow(translate(locale, 'time'), reservation.time_slot)}
          ${detailRow(translate(locale, 'partySize'), reservation.party_size)}
          ${detailRow(translate(locale, 'notes'), reservation.special_requests || translate(locale, 'notProvided'))}
        </table>
      </div>
    `
    ),
  })
}
