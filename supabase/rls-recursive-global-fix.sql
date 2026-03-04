-- LOOM GLOBAL RLS RECURSION FIX
-- Run this in Supabase SQL Editor.
-- Goal: remove recursive policy chains and unify helper functions.

begin;

-- Canonical helper functions (RLS-safe)
drop function if exists public.current_user_role() cascade;
drop function if exists public.current_user_business_id() cascade;
drop function if exists public.current_user_is_superadmin() cascade;

drop function if exists public.current_user_role_safe() cascade;
drop function if exists public.current_user_business_uuid() cascade;
drop function if exists public.current_user_is_superadmin_safe() cascade;

create or replace function public.current_user_role_safe()
returns text
language plpgsql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
declare
  v_role text;
begin
  if auth.uid() is null then
    return null;
  end if;

  select u.role into v_role
  from public.users u
  where u.id = auth.uid()
  limit 1;

  return v_role;
end;
$$;

create or replace function public.current_user_business_uuid()
returns uuid
language plpgsql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
declare
  v_business_id uuid;
begin
  if auth.uid() is null then
    return null;
  end if;

  select u.business_id into v_business_id
  from public.users u
  where u.id = auth.uid()
  limit 1;

  return v_business_id;
end;
$$;

create or replace function public.current_user_is_superadmin_safe()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select coalesce(public.current_user_role_safe() = 'superadmin', false);
$$;

grant execute on function public.current_user_role_safe() to anon, authenticated, service_role;
grant execute on function public.current_user_business_uuid() to anon, authenticated, service_role;
grant execute on function public.current_user_is_superadmin_safe() to anon, authenticated, service_role;

-- Drop all existing policies from key tables to avoid stale recursive ones
DO $$
DECLARE r record;
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' LOOP
      EXECUTE format('drop policy if exists %I on public.users', r.policyname);
    END LOOP;
  END IF;

  IF to_regclass('public.businesses') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'businesses' LOOP
      EXECUTE format('drop policy if exists %I on public.businesses', r.policyname);
    END LOOP;
  END IF;

  IF to_regclass('public.reservations') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reservations' LOOP
      EXECUTE format('drop policy if exists %I on public.reservations', r.policyname);
    END LOOP;
  END IF;

  IF to_regclass('public.services') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'services' LOOP
      EXECUTE format('drop policy if exists %I on public.services', r.policyname);
    END LOOP;
  END IF;

  IF to_regclass('public.staff_members') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'staff_members' LOOP
      EXECUTE format('drop policy if exists %I on public.staff_members', r.policyname);
    END LOOP;
  END IF;

  IF to_regclass('public.staff') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'staff' LOOP
      EXECUTE format('drop policy if exists %I on public.staff', r.policyname);
    END LOOP;
  END IF;
END
$$;

-- Ensure RLS is enabled
alter table if exists public.users enable row level security;
alter table if exists public.businesses enable row level security;
alter table if exists public.reservations enable row level security;
alter table if exists public.services enable row level security;
alter table if exists public.staff_members enable row level security;
alter table if exists public.staff enable row level security;

-- users: only self read for regular authenticated clients
create policy "users read own profile"
on public.users
for select
to authenticated
using (id = auth.uid());

-- businesses
create policy "public read active businesses"
on public.businesses
for select
using (is_active = true);

create policy "authenticated read own business"
on public.businesses
for select
to authenticated
using (id = public.current_user_business_uuid());

create policy "authenticated update own business"
on public.businesses
for update
to authenticated
using (id = public.current_user_business_uuid())
with check (id = public.current_user_business_uuid());

-- reservations
create policy "public create reservations"
on public.reservations
for insert
with check (true);

create policy "authenticated manage own reservations"
on public.reservations
for all
to authenticated
using (business_id = public.current_user_business_uuid())
with check (business_id = public.current_user_business_uuid());

-- services
create policy "public read active services"
on public.services
for select
using (is_active = true);

create policy "authenticated manage own services"
on public.services
for all
to authenticated
using (business_id = public.current_user_business_uuid())
with check (business_id = public.current_user_business_uuid());

-- staff_members (current table in app)
create policy "public read active staff_members"
on public.staff_members
for select
using (is_active = true);

create policy "authenticated manage own staff_members"
on public.staff_members
for all
to authenticated
using (business_id = public.current_user_business_uuid())
with check (business_id = public.current_user_business_uuid());

-- staff (legacy compatibility if this table exists)
DO $$
BEGIN
  IF to_regclass('public.staff') IS NOT NULL THEN
    EXECUTE 'create policy "public read active staff" on public.staff for select using (is_active = true)';
    EXECUTE 'create policy "authenticated manage own staff" on public.staff for all to authenticated using (business_id = public.current_user_business_uuid()) with check (business_id = public.current_user_business_uuid())';
  END IF;
END
$$;

commit;
