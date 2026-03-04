-- LOOM RLS FIX
-- Purpose:
-- 1) Remove recursive policy patterns that can cause "stack depth limit exceeded"
-- 2) Keep public booking reads/inserts working
-- 3) Keep owner and superadmin access rules working

begin;

-- 1) Helper functions (SECURITY DEFINER) to read role/business safely
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
  limit 1;
$$;

create or replace function public.current_user_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.business_id
  from public.users u
  where u.id = auth.uid()
  limit 1;
$$;

grant execute on function public.current_user_role() to anon, authenticated, service_role;
grant execute on function public.current_user_business_id() to anon, authenticated, service_role;

-- 2) Rebuild businesses policies
drop policy if exists "public read active businesses" on public.businesses;
drop policy if exists "owners see own business" on public.businesses;
drop policy if exists "superadmin all" on public.businesses;

create policy "public read active businesses"
on public.businesses
for select
using (is_active = true);

create policy "owners read own business"
on public.businesses
for select
to authenticated
using (id = public.current_user_business_id());

create policy "owners update own business"
on public.businesses
for update
to authenticated
using (id = public.current_user_business_id())
with check (id = public.current_user_business_id());

create policy "superadmin all businesses"
on public.businesses
for all
to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');

-- 3) Rebuild reservations policies
drop policy if exists "public create reservations" on public.reservations;
drop policy if exists "owners see own reservations" on public.reservations;

create policy "public create reservations"
on public.reservations
for insert
with check (true);

create policy "owners manage own reservations"
on public.reservations
for all
to authenticated
using (business_id = public.current_user_business_id())
with check (business_id = public.current_user_business_id());

create policy "superadmin all reservations"
on public.reservations
for all
to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');

-- 4) Rebuild services policies
drop policy if exists "public read services" on public.services;

create policy "public read services"
on public.services
for select
using (is_active = true);

create policy "owners manage own services"
on public.services
for all
to authenticated
using (business_id = public.current_user_business_id())
with check (business_id = public.current_user_business_id());

create policy "superadmin all services"
on public.services
for all
to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');

-- 5) Rebuild staff policies (table name in your app is "staff")
drop policy if exists "public read staff" on public.staff;

create policy "public read staff"
on public.staff
for select
using (is_active = true);

create policy "owners manage own staff"
on public.staff
for all
to authenticated
using (business_id = public.current_user_business_id())
with check (business_id = public.current_user_business_id());

create policy "superadmin all staff"
on public.staff
for all
to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');

-- 6) Rebuild users policies
drop policy if exists "users read own profile" on public.users;
drop policy if exists "users update own profile" on public.users;
drop policy if exists "superadmin all users" on public.users;

create policy "users read own profile"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "users update own profile"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_user_role()
  and coalesce(business_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(public.current_user_business_id(), '00000000-0000-0000-0000-000000000000'::uuid)
);

create policy "superadmin all users"
on public.users
for all
to authenticated
using (public.current_user_role() = 'superadmin')
with check (public.current_user_role() = 'superadmin');

commit;
