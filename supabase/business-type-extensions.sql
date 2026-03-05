-- LOOM business type extensions
-- Adds support for: architect, doctor, legal
-- Safe for both enum-based and text+check schemas
-- Run in Supabase SQL Editor

begin;

do $$
declare
  type_data_type text;
  enum_type_name text;
  check_constraint_name text;
begin
  -- Detect the underlying data type for public.businesses.type
  select c.data_type, c.udt_name
  into type_data_type, enum_type_name
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'businesses'
    and c.column_name = 'type';

  if type_data_type is null then
    raise exception 'Column public.businesses.type not found';
  end if;

  -- Case 1: enum column -> append enum values
  if type_data_type = 'USER-DEFINED' then
    execute format('alter type public.%I add value if not exists ''architect''', enum_type_name);
    execute format('alter type public.%I add value if not exists ''doctor''', enum_type_name);
    execute format('alter type public.%I add value if not exists ''legal''', enum_type_name);

  -- Case 2: text/varchar + check constraint -> replace check constraint
  else
    select con.conname
    into check_constraint_name
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'businesses'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%type%in%restaurant%'
    limit 1;

    if check_constraint_name is not null then
      execute format('alter table public.businesses drop constraint if exists %I', check_constraint_name);
    end if;

    alter table public.businesses
      drop constraint if exists businesses_type_check;

    alter table public.businesses
      add constraint businesses_type_check
      check (
        type in (
          'restaurant',
          'cafe',
          'bar',
          'lounge',
          'salon',
          'clinic',
          'consultancy',
          'hotel',
          'architect',
          'doctor',
          'legal'
        )
      );
  end if;
end
$$;

commit;
