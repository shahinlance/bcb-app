-- BCB Grounds · 003 · Shared records and photos
-- Run once in Supabase: SQL Editor → New query → paste all → Run.
--
-- Every app record (issues, inventory, requests, transfers, matches, pitches,
-- ground photos, grounds team, activity) is one row here. venue_id decides who may
-- change it: Super Admins anywhere, Admins only at their assigned venues,
-- Visitors never. Records with no venue (e.g. grounds team) are Super Admin only.

create table public.records (
  collection  text not null,
  id          text not null,
  venue_id    int  references public.venues (id),
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  created_by  uuid references public.profiles (id) on delete set null default auth.uid(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles (id) on delete set null default auth.uid(),
  primary key (collection, id)
);
create index records_collection_idx on public.records (collection);
create index records_venue_idx on public.records (venue_id);

create function public.touch_record() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.created_by := old.created_by;
  end if;
  return new;
end $$;

create trigger records_touch before insert or update on public.records
  for each row execute function public.touch_record();

-- Who may write a record with this venue / collection
create function public.can_write_record(target_collection text, target_venue int, target_data jsonb) returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when target_collection = 'activity' then public.is_active_user()
    -- a transfer can be handled by either the sending or the receiving venue
    when target_collection = 'transfers' then public.can_edit_venue(target_venue)
      or public.can_edit_venue(nullif(target_data ->> 'to', '')::int)
    when target_venue is null then public.is_super_admin()
    else public.can_edit_venue(target_venue)
  end
$$;

alter table public.records enable row level security;

create policy "Active users read records" on public.records
  for select to authenticated using (public.is_active_user());

create policy "Write records you are allowed to" on public.records
  for insert to authenticated with check (public.can_write_record(collection, venue_id, data));

-- Updating: must be allowed for the record's current venue AND its new venue
-- (so an Admin cannot move a record out of, or into, a venue that isn't theirs).
create policy "Update records you are allowed to" on public.records
  for update to authenticated
  using (public.can_write_record(collection, venue_id, data) and collection <> 'activity')
  with check (public.can_write_record(collection, venue_id, data));

create policy "Delete records you are allowed to" on public.records
  for delete to authenticated
  using (collection <> 'activity' and public.can_write_record(collection, venue_id, data)
         or collection = 'activity' and public.is_super_admin());

-- Names of the active Admins at each venue (shown on venue pages)
create function public.venue_admins() returns table (venue_id int, full_name text)
language sql stable security definer set search_path = '' as $$
  select av.venue_id, coalesce(p.full_name, p.email)
    from public.admin_venues av join public.profiles p on p.id = av.user_id
   where p.is_active and p.role = 'admin' and public.is_active_user()
   order by av.venue_id, p.full_name
$$;
revoke execute on function public.venue_admins() from public, anon;
grant  execute on function public.venue_admins() to authenticated;

-- ── Photos ─────────────────────────────────────────────────────────────
-- Stored in the "photos" bucket under random names; the app shrinks them first.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins upload photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and public.my_role() in ('admin', 'super_admin'));

create policy "Super admins remove photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and public.is_super_admin());
