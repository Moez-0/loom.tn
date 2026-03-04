# LOOM — Project Status & Rebuild Plan

## Current Snapshot (March 2026)

LOOM is already functional end-to-end for core reservation flows, but the product needs a stronger public-facing brand and a more premium visual identity across all pages.

---

## What Is Already Done

### Foundation
- Next.js App Router project scaffolded and stable.
- Global styling system in place (tokens + utility classes).
- Supabase clients for browser/server/middleware configured.
- Route protection middleware active for admin/dashboard.

### Authentication & Roles
- Email/password login flow implemented.
- Auth callback page implemented.
- Protected dashboard and admin areas implemented.
- Superadmin protection added for admin area and businesses API.

### Admin
- Businesses table list view implemented.
- New business creation implemented.
- Business detail edit page implemented (`/admin/businesses/[id]`).
- Businesses API route implemented (`GET`, `POST`, `PATCH`).

### Business Dashboard
- Dashboard layout with sidebar/header implemented.
- Overview stats (today/week/total) implemented.
- Reservations table with inline actions implemented.
- Manual reservation entry page implemented (`source = phone/whatsapp/walk_in`).
- Staff, services, settings pages implemented.

### Public Booking Experience
- Dynamic business page routing via slug implemented.
- Restaurant template implemented fully.
- Salon, clinic, consultancy, hotel templates implemented.
- Reservation form implemented with business-type adaptive fields.
- Availability API + reservation API implemented.
- Success page implemented.

### Notifications
- Email notifications integrated via Resend.
- Notifications API endpoint created.
- WhatsApp intentionally deferred/disabled for now.

### Localization
- EN / FR / AR setup via `next-intl` implemented.
- Locale switcher integrated in core surfaces.
- RTL direction support enabled when Arabic is active.

---

## What Still Needs Work

### Product & UX Polish
- Full visual overhaul toward premium modern SaaS look.
- Landing page copy and hierarchy optimized for conversion.
- Improve consistency of spacing, typography rhythm, and section patterns across all screens.
- Add stronger empty states and confirmation states in dashboard/admin.

### Landing & Marketing
- Finalize marketing-first homepage messaging (non-technical language).
- Add clearer value sections: outcomes, social proof, FAQ, stronger CTA funnel.
- Prepare bilingual/tri-lingual marketing copy (EN/FR/AR).

### Quality & Release
- Full responsive QA pass at mobile widths (especially 375px).
- End-to-end validation across all five business types.
- Production deployment pass (Netlify config + live route checks).

---

## Rebuild Direction (Design)

The next design phase focuses on:
- Cleaner visual hierarchy for public conversion pages.
- Softer, modern color system with clearer CTA contrast.
- More refined cards, forms, and data tables for trust and readability.
- Consistent premium feel across landing, admin, and owner dashboard.

---

## Immediate Next Actions

1. Complete global design token refresh (colors, radius, shadows, spacing behavior).
2. Apply revised component styles platform-wide (buttons/cards/inputs/badges).
3. Finalize marketing-only landing copy (no technical jargon).
4. Run lint/build + QA checks on critical flows.
