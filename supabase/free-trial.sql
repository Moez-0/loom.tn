-- LOOM free trial support
-- Run in Supabase SQL Editor

begin;

alter table if exists public.businesses
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists subscription_status text;

alter table if exists public.businesses
  alter column trial_started_at set default now(),
  alter column trial_ends_at set default (now() + interval '2 days'),
  alter column subscription_status set default 'trialing';

update public.businesses
set
  trial_started_at = coalesce(trial_started_at, created_at, now()),
  trial_ends_at = coalesce(trial_ends_at, coalesce(created_at, now()) + interval '2 days'),
  subscription_status = coalesce(subscription_status, 'trialing')
where trial_started_at is null
   or trial_ends_at is null
   or subscription_status is null;

alter table if exists public.businesses
  alter column trial_started_at set not null,
  alter column trial_ends_at set not null,
  alter column subscription_status set not null;

alter table if exists public.businesses
  drop constraint if exists businesses_subscription_status_check;

alter table if exists public.businesses
  add constraint businesses_subscription_status_check
  check (subscription_status in ('trialing', 'active', 'past_due', 'cancelled'));

commit;
