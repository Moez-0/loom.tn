import { Resend } from 'resend'

type EmailBusiness = {
  name: string
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

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const DEFAULT_BRAND = '#111827'
const DEFAULT_BACKGROUND = '#f8fafc'
const DEFAULT_SURFACE = '#ffffff'
const DEFAULT_TEXT = '#111827'

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
  const intro = translate(locale, 'bookingConfirmedIntro', { businessName: business.name })

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: reservation.customer_email,
    subject: `${translate(locale, 'bookingConfirmedSubject')} — ${business.name}`,
    html: emailBase(
      business,
      locale,
      `
      <div style="display:inline-block;margin:0 0 12px;padding:7px 12px;border-radius:${buttonRadius};background:${theme.brand};color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(
        translate(locale, 'bookingConfirmedSubject')
      )}</div>
      <h2 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:${textMain};font-weight:800;">${escapeHtml(
        translate(locale, 'bookingConfirmedTitle')
      )}</h2>
      <p style="margin:0 0 18px;font-size:14px;color:${textMuted};">${escapeHtml(intro)}</p>
      <div style="border:1px solid ${border};border-radius:14px;padding:14px 16px;background:${theme.surface};">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${textMuted};">${escapeHtml(
          translate(locale, 'detailsTitle')
        )}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${detailRow(translate(locale, 'guest'), reservation.customer_name, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'date'), reservation.date, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'time'), reservation.time_slot, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'guests'), reservation.party_size, textMain, border, textMuted)}
        </table>
      </div>
      ${
        business.address
          ? `<p style="margin:16px 0 0;padding:12px 14px;border-radius:12px;background:${theme.background};font-size:13px;color:${textMain};border:1px solid ${border};">${escapeHtml(
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
  const theme = getBranding(business)
  const textMain = theme.text
  const textMuted = withAlpha(theme.text, 0.74)
  const border = withAlpha(theme.text, 0.18)
  const buttonRadius = theme.buttonStyle === 'pill' ? '9999px' : '12px'
  const intro = translate(locale, 'ownerIntro', { businessName: business.name })

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: business.email,
    subject: `${translate(locale, 'ownerSubject')} — ${reservation.customer_name}`,
    html: emailBase(
      business,
      locale,
      `
      <div style="display:inline-block;margin:0 0 12px;padding:7px 12px;border-radius:${buttonRadius};background:${theme.brand};color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(
        translate(locale, 'ownerSubject')
      )}</div>
      <h2 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:${textMain};font-weight:800;">${escapeHtml(
        translate(locale, 'ownerTitle')
      )}</h2>
      <p style="margin:0 0 18px;font-size:14px;color:${textMuted};">${escapeHtml(intro)}</p>
      <div style="border:1px solid ${border};border-radius:14px;padding:14px 16px;background:${theme.surface};">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${textMuted};">${escapeHtml(
          translate(locale, 'detailsTitle')
        )}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${detailRow(translate(locale, 'customer'), reservation.customer_name, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'phone'), reservation.customer_phone, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'date'), reservation.date, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'time'), reservation.time_slot, textMain, border, textMuted)}
          ${detailRow(translate(locale, 'partySize'), reservation.party_size, textMain, border, textMuted)}
          ${detailRow(
            translate(locale, 'notes'),
            reservation.special_requests || translate(locale, 'notProvided'),
            textMain,
            border,
            textMuted
          )}
        </table>
      </div>
    `
    ),
  })
}
