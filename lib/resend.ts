import { Resend } from 'resend'

type EmailBusiness = {
  name: string
  address?: string | null
  email?: string | null
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

const emailBase = (content: string) => `
  <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0A0A0A;background:#FAFAFA;padding:40px;">
    <div style="border-bottom:1px solid #E2E1DC;padding-bottom:20px;margin-bottom:32px;">
      <span style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9B9A95;font-weight:500;">
        Loom — loom.tn
      </span>
    </div>
    ${content}
  </div>
`

export async function sendBookingConfirmation(reservation: EmailReservation, business: EmailBusiness) {
  if (!resend || !reservation.customer_email) {
    return
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: reservation.customer_email,
    subject: `Booking Confirmed — ${business.name}`,
    html: emailBase(`
      <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:400;margin-bottom:8px;">${business.name}</h2>
      <p style="color:#6B6A65;margin-bottom:32px;">Your reservation is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-top:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;width:40%;">Guest</td><td style="padding:12px 0;">${reservation.customer_name}</td></tr>
        <tr style="border-top:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Date</td><td style="padding:12px 0;font-family:monospace;">${reservation.date}</td></tr>
        <tr style="border-top:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Time</td><td style="padding:12px 0;font-family:monospace;">${reservation.time_slot}</td></tr>
        <tr style="border-top:1px solid #E2E1DC;border-bottom:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Guests</td><td style="padding:12px 0;">${reservation.party_size}</td></tr>
      </table>
      ${business.address ? `<p style="margin-top:24px;color:#6B6A65;font-size:14px;">${business.address}</p>` : ''}
    `),
  })
}

export async function sendOwnerAlert(reservation: EmailReservation, business: EmailBusiness) {
  if (!resend || !business.email) {
    return
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@loom.tn',
    to: business.email,
    subject: `New Reservation — ${reservation.customer_name}`,
    html: emailBase(`
      <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9B9A95;margin-bottom:24px;">New reservation received</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-top:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;width:40%;">Customer</td><td style="padding:12px 0;">${reservation.customer_name}</td></tr>
        <tr style="border-top:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Phone</td><td style="padding:12px 0;font-family:monospace;">${reservation.customer_phone}</td></tr>
        <tr style="border-top:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Date & Time</td><td style="padding:12px 0;font-family:monospace;">${reservation.date} at ${reservation.time_slot}</td></tr>
        <tr style="border-top:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Party size</td><td style="padding:12px 0;">${reservation.party_size}</td></tr>
        <tr style="border-top:1px solid #E2E1DC;border-bottom:1px solid #E2E1DC;"><td style="padding:12px 0;color:#9B9A95;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Notes</td><td style="padding:12px 0;">${reservation.special_requests || '—'}</td></tr>
      </table>
    `),
  })
}
