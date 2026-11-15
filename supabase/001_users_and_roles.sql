-- BCB Grounds · 001 · Users, roles and venue access
-- Run once in Supabase: SQL Editor → New query → paste all → Run.
-- Safe to read top to bottom; nothing here deletes existing data.

-- ── Roles ──────────────────────────────────────────────────────────────
-- visitor      : reads everything, edits nothing (e.g. the Chairman)
-- super_admin  : full access; manages users, roles and venue assignments
-- admin        : edits records only at the venues assigned to them
create type public.app_role as enum ('visitor', 'super_admin', 'admin');

-- ── Venues ─────────────────────────────────────────────────────────────
-- IDs match the existing app records (do not renumber); priority is the display order.
create table public.venues (
  id          int primary key,
  short_name  text not null,
  full_name   text,
  priority    int  not null unique,
  venue_type  text not null check (venue_type in ('BCB ground', 'Rented venue')),
  created_at  timestamptz not null default now()
);

insert into public.venues (id, short_name, full_name, priority, venue_type) values
  (1, 'SBNCS, Mirpur', 'Sher-e-Bangla National Cricket Stadium', 1, 'BCB ground'),
  (2, 'BSSFLMRCS, Chattogram', 'Bir Shrestha Shaheed Flight Lieutenant Matiur Rahman Cricket Stadium', 2, 'BCB ground'),
  (3, 'SICS, Sylhet', 'Sylhet International Cricket Stadium', 3, 'BCB ground'),
  (4, 'SRGCS, Fatullah', 'SRGCS, Fatullah', 4, 'BCB ground'),
  (5, 'DCS, Khulna', 'Khulna Divisional Cricket Stadium', 5, 'BCB ground'),
  (8, 'DCS, Rajshahi', 'Rajshahi Divisional Cricket Stadium', 6, 'BCB ground'),
  (6, 'SCS, Bogura', 'Shaheed Chandu Stadium', 7, 'BCB ground'),
  (9, 'KJDCS, Barishal', 'KJDCS, Barishal', 8, 'BCB ground'),
  (10, 'BKSP- 3 & 4', 'Bangladesh Krira Shikkha Protisthan · Grounds 3 & 4', 9, 'Rented venue'),
  (11, 'NCG, Purbachal', 'NCG, Purbachal', 10, 'Rented venue'),
  (7, 'Cox''s Bazar Cricket Stadium', 'Cox''s Bazar Cricket Stadium', 11, 'Rented venue'),
  (12, 'BT Ground, Teguria', 'BT Ground, Teguria', 12, 'Rented venue'),
  (13, 'City Club', 'City Club', 13, 'Rented venue'),
  (14, 'DUG', 'DUG', 14, 'Rented venue'),
  (15, 'JHG', 'JHG', 15, 'Rented venue'),
  (16, 'Fens Cricket Academy', 'Fens Cricket Academy', 16, 'Rented venue'),
  (17, 'Cricketers Academy', 'Cricketers Academy', 17, 'Rented venue'),
  (18, 'PKSP- 1 & 2', 'PKSP- 1 & 2', 18, 'Rented venue'),
  (19, 'Narayangonj Dristict Stadium', 'Narayanganj District Stadium', 19, 'Rented venue'),
  (20, 'Rangpur Cricket Garden', 'Rangpur Cricket Garden', 20, 'Rented venue'),
  (21, 'Ulab', 'Ulab', 21, 'Rented venue'),
  (22, 'Daffodils University', 'Daffodils University', 22, 'Rented venue');

-- ── Profiles (one per sign-in account) ─────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        public.app_role not null default 'visitor',
  is_active   boolean not null default false,   -- new accounts wait for a Super Admin
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.admin_venues (
  user_id   uuid not null references public.profiles (id) on delete cascade,
  venue_id  int  not null references public.venues (id),
  primary key (user_id, venue_id)
);

create table public.activity_log (
  id        bigint generated always as identity primary key,
  at        timestamptz not null default now(),
  actor_id  uuid references public.profiles (id) on delete set null,
  action    text not null,
  detail    jsonb not null default '{}'::jsonb
);
create index activity_log_at_idx on public.activity_log (at desc);

-- New sign-in account → pending profile (inactive visitor until approved)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, lower(new.email), nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profile email in step if the sign-in email changes
create function public.handle_user_email_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = lower(new.email), updated_at = now() where id = new.id;
  return new;
end $$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ── Permission helpers (used by policies and by the app) ───────────────
create function public.my_role() returns public.app_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

create function public.is_super_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.my_role() = 'super_admin', false)
$$;

create function public.is_active_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.my_role() is not null
$$;

-- Use this in every future table's write policy: can_edit_venue(venue_id)
create function public.can_edit_venue(target_venue int) returns boolean
language sql stable security definer set search_path = '' as $$
  select case public.my_role()
    when 'super_admin' then true
    when 'admin' then exists (
      select 1 from public.admin_venues where user_id = auth.uid() and venue_id = target_venue)
    else false
  end
$$;

-- ── Row-level security ─────────────────────────────────────────────────
alter table public.venues       enable row level security;
alter table public.profiles     enable row level security;
alter table public.admin_venues enable row level security;
alter table public.activity_log enable row level security;

create policy "Active users read venues" on public.venues
  for select to authenticated using (public.is_active_user());
create policy "Super admins manage venues" on public.venues
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

-- Everyone can read their own profile (so pending users see their status);
-- Super Admins read all. Changes go only through the functions below.
create policy "Read own profile or all as super admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_super_admin());

create policy "Read own venues or all as super admin" on public.admin_venues
  for select to authenticated using (user_id = auth.uid() or public.is_super_admin());

create policy "Active users read activity" on public.activity_log
  for select to authenticated using (public.is_active_user());
create policy "Active users add own activity" on public.activity_log
  for insert to authenticated with check (public.is_active_user() and actor_id = auth.uid());

-- ── Actions ────────────────────────────────────────────────────────────
-- Super Admin: set a user's name, role, active state and venues in one step.
create function public.admin_update_user(
  target     uuid,
  new_role   public.app_role,
  new_active boolean,
  new_name   text,
  venue_ids  int[]
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  before public.profiles;
begin
  if not public.is_super_admin() then
    raise exception 'Only a Super Admin can change user access.' using errcode = '42501';
  end if;

  select * into before from public.profiles where id = target for update;
  if not found then raise exception 'User not found.'; end if;

  if target = auth.uid() and (new_role <> 'super_admin' or not new_active) then
    raise exception 'You cannot remove your own Super Admin access. Ask another Super Admin.';
  end if;

  update public.profiles
     set role = new_role,
         is_active = new_active,
         full_name = coalesce(nullif(trim(new_name), ''), full_name),
         updated_at = now()
   where id = target;

  delete from public.admin_venues where user_id = target;
  if new_role = 'admin' then
    insert into public.admin_venues (user_id, venue_id)
    select target, v from unnest(coalesce(venue_ids, '{}')) as v
    on conflict do nothing;
  end if;

  insert into public.activity_log (actor_id, action, detail)
  values (auth.uid(), 'User access updated', jsonb_build_object(
    'user', before.email,
    'role', jsonb_build_array(before.role, new_role),
    'active', jsonb_build_array(before.is_active, new_active),
    'venues', to_jsonb(coalesce(venue_ids, '{}'))));
end $$;

-- Any active user: change their own display name.
create function public.update_my_name(new_name text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if length(trim(coalesce(new_name, ''))) not between 2 and 80 then
    raise exception 'Enter your full name, between 2 and 80 characters.';
  end if;
  update public.profiles set full_name = trim(new_name), updated_at = now() where id = auth.uid();
end $$;

-- Lock function access to signed-in users
revoke execute on function public.admin_update_user(uuid, public.app_role, boolean, text, int[]) from public, anon;
revoke execute on function public.update_my_name(text) from public, anon;
grant  execute on function public.admin_update_user(uuid, public.app_role, boolean, text, int[]) to authenticated;
grant  execute on function public.update_my_name(text) to authenticated;
