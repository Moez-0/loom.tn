'use client'

import { useEffect } from 'react'
import type { PublicSiteSectionKey } from '@/types/public-site'

type WebsiteLivePreviewSyncProps = {
  formId: string
  iframeId: string
  slug: string
}

const DEFAULT_SECTION_ORDER: PublicSiteSectionKey[] = ['about', 'offerings', 'gallery', 'team', 'hours', 'contact']

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function parseSectionOrder(raw: string | null): PublicSiteSectionKey[] {
  if (!raw) {
    return DEFAULT_SECTION_ORDER
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return DEFAULT_SECTION_ORDER
    }

    const allowed = new Set<PublicSiteSectionKey>(DEFAULT_SECTION_ORDER)
    const unique = parsed.filter((item): item is PublicSiteSectionKey => typeof item === 'string' && allowed.has(item as PublicSiteSectionKey))
    const deduped = Array.from(new Set(unique))
    return deduped.length === DEFAULT_SECTION_ORDER.length ? deduped : DEFAULT_SECTION_ORDER
  } catch {
    return DEFAULT_SECTION_ORDER
  }
}

function nullableText(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeColor(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : null
}

export default function WebsiteLivePreviewSync({ formId, iframeId, slug }: WebsiteLivePreviewSyncProps) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null

    if (!form || !iframe) {
      return
    }

    let timeout: ReturnType<typeof setTimeout> | null = null

    const updatePreview = () => {
      const data = new FormData(form)

      const draft = {
        show_gallery: data.get('show_gallery') === 'on',
        show_team: data.get('show_team') === 'on',
        show_map: data.get('show_map') === 'on',
        show_hours: data.get('show_hours') === 'on',
        show_contact: data.get('show_contact') === 'on',
        show_offerings: data.get('show_offerings') === 'on',
        tagline: nullableText(data.get('tagline')),
        hero_cta_label: nullableText(data.get('hero_cta_label')),
        secondary_cta_label: nullableText(data.get('secondary_cta_label')),
        editor: {
          theme_preset: data.get('theme_preset') === 'soft' || data.get('theme_preset') === 'bold' ? data.get('theme_preset') : 'classic',
          color_preset:
            data.get('color_preset') === 'ocean' || data.get('color_preset') === 'forest' || data.get('color_preset') === 'charcoal'
              ? data.get('color_preset')
              : 'neutral',
          hero_alignment: data.get('hero_alignment') === 'center' ? 'center' : 'left',
          button_style: data.get('button_style') === 'pill' ? 'pill' : 'rounded',
          brand_color: normalizeColor(data.get('brand_color')),
          background_color: normalizeColor(data.get('background_color')),
          surface_color: normalizeColor(data.get('surface_color')),
          page_background_color: normalizeColor(data.get('page_background_color')),
          section_background_color: normalizeColor(data.get('section_background_color')),
          card_background_color: normalizeColor(data.get('card_background_color')),
          text_color: normalizeColor(data.get('text_color')),
          gallery_columns: data.get('gallery_columns') === '2' || data.get('gallery_columns') === '3' ? Number(data.get('gallery_columns')) : 4,
          section_order: parseSectionOrder(typeof data.get('section_order') === 'string' ? (data.get('section_order') as string) : null),
          nav_cta_label: nullableText(data.get('nav_cta_label')),
          hero_title: nullableText(data.get('hero_title')),
          about_title: nullableText(data.get('about_title')),
          about_body: nullableText(data.get('about_body')),
          offerings_title: nullableText(data.get('offerings_title')),
          gallery_title: nullableText(data.get('gallery_title')),
          team_title: nullableText(data.get('team_title')),
          hours_title: nullableText(data.get('hours_title')),
          contact_title: nullableText(data.get('contact_title')),
          contact_body: nullableText(data.get('contact_body')),
          footer_note: nullableText(data.get('footer_note')),
        },
      }

      const encodedDraft = toBase64Url(JSON.stringify(draft))
      iframe.src = `/${slug}?draft=${encodeURIComponent(encodedDraft)}`
    }

    const scheduleUpdate = () => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(updatePreview, 120)
    }

    form.addEventListener('input', scheduleUpdate)
    form.addEventListener('change', scheduleUpdate)
    updatePreview()

    return () => {
      form.removeEventListener('input', scheduleUpdate)
      form.removeEventListener('change', scheduleUpdate)
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [formId, iframeId, slug])

  return null
}
