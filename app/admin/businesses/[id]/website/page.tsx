import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createPublicSiteAsset,
  deletePublicSiteAsset,
  getDefaultPublicSiteConfig,
  getPublicSiteAssets,
  getPublicSiteConfig,
  savePublicSiteConfig,
} from '@/lib/public-site'
import type { BusinessType } from '@/types'
import type { PublicSiteAssetType } from '@/types/public-site'

type AdminWebsiteBusiness = {
  id: string
  slug: string
  type: BusinessType
  name: string
}

const STORAGE_BUCKET = 'business-assets'

function normalizeFileName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase() ?? 'bin'
  return extension.replace(/[^a-z0-9]/g, '') || 'bin'
}

async function assertSuperadmin(nextPath: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`)
  }

  const profile = await ensureUserProfile(user)
  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }
}

async function uploadPublicAssetFile(
  admin: ReturnType<typeof createAdminClient>,
  businessId: string,
  type: PublicSiteAssetType,
  file: File
) {
  if (!admin) {
    return null
  }

  const extension = normalizeFileName(file.name)
  const path = `${businessId}/public/${type}-${crypto.randomUUID()}.${extension}`

  const { error } = await admin.storage.from(STORAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  })

  if (error) {
    return null
  }

  const { data } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function previewToken() {
  return `${Date.now()}`
}

type PageProps = {
  params: { id: string }
  searchParams?: { preview?: string }
}

export default async function AdminBusinessWebsitePage({ params, searchParams }: PageProps) {
  const nextPath = `/admin/businesses/${params.id}/website`
  const t = await getTranslations('admin')
  const td = await getTranslations('dashboard')
  const tPublic = await getTranslations('public')
  const tw = (key: string, values?: Record<string, string | number>) => td(`websiteEditor.${key}`, values)
  const tu = (key: string) => td(`uploadsPage.${key}`)
  await assertSuperadmin(nextPath)

  async function updateWebsiteConfig(formData: FormData) {
    'use server'

    const businessId = String(formData.get('business_id') ?? '').trim()
    if (!businessId) {
      return
    }

    await assertSuperadmin(nextPath)
    const admin = createAdminClient()
    if (!admin) {
      return
    }

    const currentConfig = (await getPublicSiteConfig(admin, businessId)) ?? getDefaultPublicSiteConfig()

    await savePublicSiteConfig(admin, businessId, {
      show_gallery: formData.get('show_gallery') === 'on',
      show_team: formData.get('show_team') === 'on',
      show_map: formData.get('show_map') === 'on',
      show_hours: formData.get('show_hours') === 'on',
      show_contact: formData.get('show_contact') === 'on',
      show_offerings: formData.get('show_offerings') === 'on',
      tagline: String(formData.get('tagline') ?? '').trim() || null,
      hero_cta_label: String(formData.get('hero_cta_label') ?? '').trim() || null,
      secondary_cta_label: String(formData.get('secondary_cta_label') ?? '').trim() || null,
      editor: currentConfig.editor,
    })

    revalidatePath(nextPath)
    redirect(`${nextPath}?preview=${previewToken()}`)
  }

  async function uploadPublicAssets(formData: FormData) {
    'use server'

    const businessId = String(formData.get('business_id') ?? '').trim()
    const type = String(formData.get('type') ?? 'gallery') as PublicSiteAssetType
    if (!businessId || !['gallery', 'menu'].includes(type)) {
      return
    }

    await assertSuperadmin(nextPath)
    const admin = createAdminClient()
    if (!admin) {
      return
    }

    const entries = Array.from(formData.entries()).filter(([key, value]) => key === 'files' && value instanceof File)

    let sortOrder = 0
    for (const [, rawFile] of entries) {
      const file = rawFile as File
      if (!file || file.size === 0) {
        continue
      }

      const publicUrl = await uploadPublicAssetFile(admin, businessId, type, file)
      if (!publicUrl) {
        continue
      }

      await createPublicSiteAsset(admin, {
        business_id: businessId,
        type,
        title: file.name,
        file_url: publicUrl,
        sort_order: sortOrder,
      })
      sortOrder += 1
    }

    revalidatePath(nextPath)
    redirect(`${nextPath}?preview=${previewToken()}`)
  }

  async function removePublicAsset(formData: FormData) {
    'use server'

    const businessId = String(formData.get('business_id') ?? '').trim()
    const assetId = String(formData.get('asset_id') ?? '').trim()
    if (!businessId || !assetId) {
      return
    }

    await assertSuperadmin(nextPath)
    const admin = createAdminClient()
    if (!admin) {
      return
    }

    await deletePublicSiteAsset(admin, businessId, assetId)
    revalidatePath(nextPath)
    redirect(`${nextPath}?preview=${previewToken()}`)
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="border border-loom-error bg-loom-white p-4 text-sm text-loom-error">
          {t('loadError')}: {td('missingServiceRoleKey')}
        </p>
      </main>
    )
  }

  const [{ data: business }, config, assets] = await Promise.all([
    admin.from('businesses').select('id, slug, type, name').eq('id', params.id).maybeSingle<AdminWebsiteBusiness>(),
    getPublicSiteConfig(admin, params.id),
    getPublicSiteAssets(admin, params.id),
  ])

  if (!business) {
    notFound()
  }

  const effective = config ?? getDefaultPublicSiteConfig()
  const offeringsLabel =
    business.type === 'restaurant' || business.type === 'cafe' || business.type === 'bar' || business.type === 'lounge'
      ? tPublic('menuLabel')
      : business.type === 'hotel'
        ? tPublic('roomsLabel')
        : business.type === 'consultancy'
          ? tPublic('expertiseLabel')
          : tPublic('servicesLabel')
  const galleryAssets = assets.filter((asset) => asset.type === 'gallery')
  const menuAssets = assets.filter((asset) => asset.type === 'menu')
  const iframeToken = searchParams?.preview || previewToken()

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('admin')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">
            {td('websiteEditor.title')} — {business.name}
          </h1>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <Link href={`/admin/businesses/${business.id}`} className="btn-secondary inline-flex items-center">
            {t('backToBusinesses')}
          </Link>
          <Link href={`/${business.slug}`} className="btn-primary inline-flex items-center">
            {td('openPublicSite')}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <form action={updateWebsiteConfig} className="card space-y-4 p-5">
            <input type="hidden" name="business_id" value={business.id} />
            <p className="section-label">{tw('sectionVisibility')}</p>

            <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-sm">
              <span>{offeringsLabel}</span>
              <input type="checkbox" name="show_offerings" defaultChecked={effective.show_offerings} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-sm">
              <span>{tw('gallery')}</span>
              <input type="checkbox" name="show_gallery" defaultChecked={effective.show_gallery} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-sm">
              <span>{tw('team')}</span>
              <input type="checkbox" name="show_team" defaultChecked={effective.show_team} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-sm">
              <span>{tw('hours')}</span>
              <input type="checkbox" name="show_hours" defaultChecked={effective.show_hours} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-sm">
              <span>{tw('contact')}</span>
              <input type="checkbox" name="show_contact" defaultChecked={effective.show_contact} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-sm">
              <span>{tw('map')}</span>
              <input type="checkbox" name="show_map" defaultChecked={effective.show_map} />
            </label>

            <div>
              <label className="label" htmlFor="tagline">{tw('heroSupportingTextOptional')}</label>
              <textarea id="tagline" name="tagline" className="input min-h-[90px]" defaultValue={effective.tagline ?? ''} />
            </div>
            <div>
              <label className="label" htmlFor="hero_cta_label">{tw('primaryCtaLabelOptional')}</label>
              <input id="hero_cta_label" name="hero_cta_label" className="input" defaultValue={effective.hero_cta_label ?? ''} />
            </div>
            <div>
              <label className="label" htmlFor="secondary_cta_label">{tw('secondaryCtaLabelOptional')}</label>
              <input id="secondary_cta_label" name="secondary_cta_label" className="input" defaultValue={effective.secondary_cta_label ?? ''} />
            </div>

            <button type="submit" className="btn-primary inline-flex items-center">{tw('saveWebsiteDesign')}</button>
          </form>

          <section className="card space-y-3 p-5">
            <p className="section-label">{tu('galleryUploads')}</p>
            <form action={uploadPublicAssets} encType="multipart/form-data" className="space-y-3">
              <input type="hidden" name="business_id" value={business.id} />
              <input type="hidden" name="type" value="gallery" />
              <input type="file" name="files" accept="image/*" multiple className="input" />
              <button type="submit" className="btn-secondary inline-flex items-center">{tu('uploadGalleryImages')}</button>
            </form>
            {galleryAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between gap-2 rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-xs">
                <a href={asset.file_url} target="_blank" rel="noreferrer" className="truncate text-loom-black hover:underline">
                  {asset.title || asset.file_url}
                </a>
                <form action={removePublicAsset}>
                  <input type="hidden" name="business_id" value={business.id} />
                  <input type="hidden" name="asset_id" value={asset.id} />
                  <button type="submit" className="text-loom-error hover:underline">{tu('delete')}</button>
                </form>
              </div>
            ))}
          </section>

          <section className="card space-y-3 p-5">
            <p className="section-label">{tu('menuUploads')}</p>
            <form action={uploadPublicAssets} encType="multipart/form-data" className="space-y-3">
              <input type="hidden" name="business_id" value={business.id} />
              <input type="hidden" name="type" value="menu" />
              <input type="file" name="files" accept="image/*,.pdf" multiple className="input" />
              <button type="submit" className="btn-secondary inline-flex items-center">{tu('uploadMenuFiles')}</button>
            </form>
            {menuAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between gap-2 rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-xs">
                <a href={asset.file_url} target="_blank" rel="noreferrer" className="truncate text-loom-black hover:underline">
                  {asset.title || asset.file_url}
                </a>
                <form action={removePublicAsset}>
                  <input type="hidden" name="business_id" value={business.id} />
                  <input type="hidden" name="asset_id" value={asset.id} />
                  <button type="submit" className="text-loom-error hover:underline">{tu('delete')}</button>
                </form>
              </div>
            ))}
          </section>
        </div>

        <section className="card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-loom-border bg-loom-surface px-4 py-3">
            <p className="text-sm font-medium text-loom-black">{tw('livePreview')}</p>
            <Link href={`/${business.slug}`} className="text-xs font-medium text-loom-accent hover:underline">{td('openFullPage')}</Link>
          </div>
          <iframe
            title={tw('livePreview')}
            src={`/${business.slug}?preview=${encodeURIComponent(iframeToken)}`}
            className="h-[80vh] w-full bg-white"
          />
        </section>
      </div>
    </main>
  )
}
