-- BCB Grounds · 004b · What a venue viewer can see
-- venue_viewer: reads only records of the venue(s) assigned to them (admin_venues), changes nothing.
-- Everyone else who is active keeps reading everything.

create or replace function public.can_view_venue(target_venue int) returns boolean
language sql stable security definer set search_path = '' as $$
  select case public.my_role()
    when 'venue_viewer' then target_venue is not null and exists (
      select 1 from public.admin_venues where user_id = auth.uid() and venue_id = target_venue)
    else public.my_role() is not null
  end
$$;
revoke execute on function public.can_view_venue(int) from public, anon;
grant  execute on function public.can_view_venue(int) to authenticated;

drop policy if exists "Active users read records" on public.records;
drop policy if exists "Read records you are allowed to see" on public.records;
create policy "Read records you are allowed to see" on public.records
  for select to authenticated using (public.can_view_venue(venue_id));

drop policy if exists "Active users read venues" on public.venues;
drop policy if exists "Read venues you are allowed to see" on public.venues;
create policy "Read venues you are allowed to see" on public.venues
  for select to authenticated using (public.can_view_venue(id));

-- Super Admin assigns venues to Admins and to Venue viewers
create or replace function public.admin_update_user(
  target uuid, new_role public.app_role, new_active boolean, new_name text, venue_ids int[]
) returns void
language plpgsql security definer set search_path = '' as $$
declare before public.profiles;
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
     set role = new_role, is_active = new_active,
         full_name = coalesce(nullif(trim(new_name), ''), full_name), updated_at = now()
   where id = target;
  delete from public.admin_venues where user_id = target;
  if new_role in ('admin', 'venue_viewer') then
    insert into public.admin_venues (user_id, venue_id)
    select target, v from unnest(coalesce(venue_ids, '{}')) as v on conflict do nothing;
  end if;
  insert into public.activity_log (actor_id, action, detail)
  values (auth.uid(), 'User access updated', jsonb_build_object(
    'user', before.email, 'role', jsonb_build_array(before.role, new_role),
    'active', jsonb_build_array(before.is_active, new_active), 'venues', to_jsonb(coalesce(venue_ids, '{}'))));
end $$;

-- Tidy-ups flagged by Supabase's security check: internal helpers need no anonymous access
revoke execute on function public.my_role() from public, anon;
revoke execute on function public.is_super_admin() from public, anon;
revoke execute on function public.is_active_user() from public, anon;
revoke execute on function public.can_edit_venue(int) from public, anon;
revoke execute on function public.can_write_record(text, int, jsonb) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;
grant execute on function public.my_role(), public.is_super_admin(), public.is_active_user(),
  public.can_edit_venue(int), public.can_write_record(text, int, jsonb) to authenticated;

-- Only people who can change things write activity entries
create or replace function public.can_write_record(target_collection text, target_venue int, target_data jsonb) returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when target_collection = 'activity' then public.my_role() in ('admin', 'super_admin')
    when target_collection = 'transfers' then public.can_edit_venue(target_venue)
      or public.can_edit_venue(nullif(target_data ->> 'to', '')::int)
    when target_venue is null then public.is_super_admin()
    else public.can_edit_venue(target_venue)
  end
$$;
