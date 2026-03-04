import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/auth/profile'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createPublicSiteAsset,
  deletePublicSiteAsset,
  getPublicSiteAssets,
} from '@/lib/public-site'
import type { BusinessType } from '@/types'
import type { PublicSiteAssetType } from '@/types/public-site'

type UploadsBusiness = {
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

async function getBusinessContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard/uploads')
  }

  const profile = await ensureUserProfile(user)
  return profile?.business_id ?? null
}

async function uploadPublicAssetFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  type: PublicSiteAssetType,
  file: File
) {
  const extension = normalizeFileName(file.name)
  const path = `${businessId}/public/${type}-${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  })

  if (error) {
    return null
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function uploadsRedirectToken() {
  return `${Date.now()}`
}

async function uploadPublicAssets(formData: FormData) {
  'use server'

  const businessId = await getBusinessContext()
  if (!businessId) {
    return
  }

  const type = String(formData.get('type') ?? 'gallery') as PublicSiteAssetType
  if (!['gallery', 'menu'].includes(type)) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  const supabase = await createClient()
  const entries = Array.from(formData.entries()).filter(([key, value]) => key === 'files' && value instanceof File)

  let sortOrder = 0
  for (const [, rawFile] of entries) {
    const file = rawFile as File
    if (!file || file.size === 0) {
      continue
    }

    const publicUrl = await uploadPublicAssetFile(supabase, businessId, type, file)
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

  revalidatePath('/dashboard/uploads')
  revalidatePath('/dashboard/website')
  revalidatePath('/[slug]', 'page')
  redirect(`/dashboard/uploads?refresh=${uploadsRedirectToken()}`)
}

async function removePublicAsset(formData: FormData) {
  'use server'

  const businessId = await getBusinessContext()
  if (!businessId) {
    return
  }

  const assetId = String(formData.get('asset_id') ?? '').trim()
  if (!assetId) {
    return
  }

  const admin = createAdminClient()
  if (!admin) {
    return
  }

  await deletePublicSiteAsset(admin, businessId, assetId)
  revalidatePath('/dashboard/uploads')
  revalidatePath('/dashboard/website')
  revalidatePath('/[slug]', 'page')
  redirect(`/dashboard/uploads?refresh=${uploadsRedirectToken()}`)
}

export default async function DashboardUploadsPage() {
  const t = await getTranslations('dashboard')
  const tu = (key: string) => t(`uploadsPage.${key}`)
  const businessId = await getBusinessContext()

  if (!businessId) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('uploads')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">{t('noBusiness')}</p>
      </main>
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('uploads')}</h1>
        <p className="mt-4 border border-loom-error bg-loom-white p-4 text-sm text-loom-error">{t('missingServiceRoleKey')}</p>
      </main>
    )
  }

  const [{ data: business }, assets] = await Promise.all([
    admin.from('businesses').select('id, slug, type, name').eq('id', businessId).single<UploadsBusiness>(),
    getPublicSiteAssets(admin, businessId),
  ])

  if (!business) {
    return (
      <main>
        <p className="section-label">{t('dashboard')}</p>
        <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('uploads')}</h1>
        <p className="mt-4 border border-loom-border bg-loom-white p-4 text-sm text-loom-muted">{t('noBusiness')}</p>
      </main>
    )
  }

  const galleryAssets = assets.filter((asset) => asset.type === 'gallery')
  const menuAssets = assets.filter((asset) => asset.type === 'menu')

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{t('dashboard')}</p>
          <h1 className="mt-3 font-display text-[2rem] tracking-[-0.03em] text-loom-black">{t('uploads')}</h1>
          <p className="mt-1 text-sm text-loom-muted">{tu('description')}</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <Link href="/dashboard/website" className="btn-secondary inline-flex items-center">
            {tu('backToBuilder')}
          </Link>
          <Link href={`/${business.slug}`} className="btn-primary inline-flex items-center">
            {t('openPublicSite')}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
          <p className="section-label">{tu('galleryUploads')}</p>
          <form action={uploadPublicAssets} encType="multipart/form-data" className="space-y-3">
            <input type="hidden" name="type" value="gallery" />
            <input type="file" name="files" accept="image/*" multiple className="input" />
            <button type="submit" className="btn-secondary inline-flex items-center">{tu('uploadGalleryImages')}</button>
          </form>
          {galleryAssets.length > 0 ? (
            <div className="space-y-2">
              {galleryAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between gap-2 rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-xs">
                  <a href={asset.file_url} target="_blank" rel="noreferrer" className="truncate text-loom-black hover:underline">
                    {asset.title || asset.file_url}
                  </a>
                  <form action={removePublicAsset}>
                    <input type="hidden" name="asset_id" value={asset.id} />
                    <button type="submit" className="text-loom-error hover:underline">{tu('delete')}</button>
                  </form>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="card space-y-3 p-5">
          <p className="section-label">{tu('menuUploads')}</p>
          <form action={uploadPublicAssets} encType="multipart/form-data" className="space-y-3">
            <input type="hidden" name="type" value="menu" />
            <input type="file" name="files" accept="image/*,.pdf" multiple className="input" />
            <button type="submit" className="btn-secondary inline-flex items-center">{tu('uploadMenuFiles')}</button>
          </form>
          {menuAssets.length > 0 ? (
            <div className="space-y-2">
              {menuAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between gap-2 rounded-md border border-loom-border bg-loom-surface px-3 py-2 text-xs">
                  <a href={asset.file_url} target="_blank" rel="noreferrer" className="truncate text-loom-black hover:underline">
                    {asset.title || asset.file_url}
                  </a>
                  <form action={removePublicAsset}>
                    <input type="hidden" name="asset_id" value={asset.id} />
                    <button type="submit" className="text-loom-error hover:underline">{tu('delete')}</button>
                  </form>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
