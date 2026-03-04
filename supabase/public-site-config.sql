create table if not exists public.business_public_sites (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  show_gallery boolean not null default true,
  show_team boolean not null default true,
  show_map boolean not null default true,
  show_hours boolean not null default true,
  show_contact boolean not null default true,
  show_offerings boolean not null default true,
  tagline text,
  hero_cta_label text,
  secondary_cta_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_public_assets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null check (type in ('gallery', 'menu')),
  title text,
  file_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.business_public_sites enable row level security;
alter table public.business_public_assets enable row level security;

drop policy if exists "owners manage own public site config" on public.business_public_sites;
create policy "owners manage own public site config"
on public.business_public_sites
for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.business_id = business_public_sites.business_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.business_id = business_public_sites.business_id
  )
);

drop policy if exists "superadmin full public site config" on public.business_public_sites;
create policy "superadmin full public site config"
on public.business_public_sites
for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'superadmin'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'superadmin'
  )
);

drop policy if exists "owners manage own public assets" on public.business_public_assets;
create policy "owners manage own public assets"
on public.business_public_assets
for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.business_id = business_public_assets.business_id
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.business_id = business_public_assets.business_id
  )
);

drop policy if exists "superadmin full public assets" on public.business_public_assets;
create policy "superadmin full public assets"
on public.business_public_assets
for all
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'superadmin'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role = 'superadmin'
  )
);

drop policy if exists "public read active business assets" on public.business_public_assets;
create policy "public read active business assets"
on public.business_public_assets
for select
to anon, authenticated
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_public_assets.business_id
      and b.is_active = true
  )
);
