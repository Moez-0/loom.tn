-- Supabase Storage setup for Loom dashboard uploads
-- Bucket: business-assets
-- Run this after supabase/rls-recursive-global-fix.sql in Supabase SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-assets',
  'business-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for uploaded business assets
drop policy if exists "public read business assets" on storage.objects;
create policy "public read business assets"
on storage.objects
for select
using (bucket_id = 'business-assets');

-- Authenticated users can upload only inside their own business folder:
-- object path format: <business_id>/<file-name>
drop policy if exists "owners upload own business assets" on storage.objects;
create policy "owners upload own business assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'business-assets'
  and (
    ((storage.foldername(name))[1] = public.current_user_business_uuid()::text)
    or public.current_user_is_superadmin_safe()
  )
);

-- Authenticated users can update objects only in their own business folder
drop policy if exists "owners update own business assets" on storage.objects;
create policy "owners update own business assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'business-assets'
  and (
    ((storage.foldername(name))[1] = public.current_user_business_uuid()::text)
    or public.current_user_is_superadmin_safe()
  )
)
with check (
  bucket_id = 'business-assets'
  and (
    ((storage.foldername(name))[1] = public.current_user_business_uuid()::text)
    or public.current_user_is_superadmin_safe()
  )
);

-- Authenticated users can delete objects only in their own business folder
drop policy if exists "owners delete own business assets" on storage.objects;
create policy "owners delete own business assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'business-assets'
  and (
    ((storage.foldername(name))[1] = public.current_user_business_uuid()::text)
    or public.current_user_is_superadmin_safe()
  )
);
