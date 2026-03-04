import { Resend } from 'resend'

type EmailBusiness = {
  name: string
  address?: string | null
  email?: string | null
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
  date: string
  time_slot: string
  party_size: number
  special_requests?: string | null
}

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const DEFAULT_PRIMARY = '#111827'
const DEFAULT_SECONDARY = '#f4f4f5'

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

function getBranding(business: EmailBusiness) {
  return {
    logoUrl: business.logo_url ?? business.logoUrl ?? null,
    primary: normalizeHexColor(business.primary_color ?? business.primaryColor, DEFAULT_PRIMARY),
    secondary: normalizeHexColor(business.secondary_color ?? business.secondaryColor, DEFAULT_SECONDARY),
  }
}

const emailBase = (business: EmailBusiness, content: string) => {
  const brand = getBranding(business)
  const businessName = escapeHtml(business.name)
  const logo =
    brand.logoUrl && /^https?:\/\//i.test(brand.logoUrl)
      ? `<img src="${escapeHtml(brand.logoUrl)}" alt="${businessName}" style="width:44px;height:44px;border-radius:12px;object-fit:cover;border:1px solid #e4e4e7;" />`
      : ''

  return `
  <div style="margin:0;background:${brand.secondary};padding:28px 16px;font-family:'DM Sans',system-ui,sans-serif;color:#111827;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:18px;overflow:hidden;">
      <div style="height:4px;background:${brand.primary};"></div>
      <div style="padding:24px 24px 12px;display:flex;align-items:center;gap:12px;">
        ${logo}
        <div>
          <p style="margin:0;font-size:18px;font-weight:700;line-height:1.3;">${businessName}</p>
          <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Reservation Update</p>
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
    <td style="padding:11px 0;border-top:1px solid #e4e4e7;color:#71717a;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:11px 0;border-top:1px solid #e4e4e7;font-size:14px;">${escapeHtml(value)}</td>
  </tr>
`

export async function sendBookingConfirmation(reservation: EmailReservation, business: EmailBusiness) {
  if (!resend || !reservation.customer_email) {
    return
  }

  const brand = getBranding(business)

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: reservation.customer_email,
    subject: `Booking Confirmed — ${business.name}`,
    html: emailBase(
      business,
      `
      <h2 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:${brand.primary};">Your reservation is confirmed</h2>
      <p style="margin:0 0 18px;font-size:14px;color:#52525b;">Thanks for booking with ${escapeHtml(business.name)}. Here are your reservation details:</p>
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow('Guest', reservation.customer_name)}
        ${detailRow('Date', reservation.date)}
        ${detailRow('Time', reservation.time_slot)}
        ${detailRow('Guests', reservation.party_size)}
      </table>
      ${
        business.address
          ? `<p style="margin:18px 0 0;padding:12px 14px;border-radius:12px;background:${brand.secondary};font-size:13px;color:#3f3f46;">${escapeHtml(
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

  const brand = getBranding(business)

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: business.email,
    subject: `New Reservation — ${reservation.customer_name}`,
    html: emailBase(
      business,
      `
      <h2 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:${brand.primary};">New reservation received</h2>
      <p style="margin:0 0 18px;font-size:14px;color:#52525b;">A new booking was made for ${escapeHtml(business.name)}.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${detailRow('Customer', reservation.customer_name)}
        ${detailRow('Phone', reservation.customer_phone)}
        ${detailRow('Date', reservation.date)}
        ${detailRow('Time', reservation.time_slot)}
        ${detailRow('Party size', reservation.party_size)}
        ${detailRow('Notes', reservation.special_requests || '—')}
      </table>
    `
    ),
  })
}
