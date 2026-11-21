-- BCB Grounds · 005 · Link a sign-in account to a staff record
-- so the app can show that person's own name, photo and details.
alter table public.profiles add column if not exists staff_id text;

create or replace function public.admin_link_staff(target uuid, staff text) returns void
language plpgsql security definer set search_path = '' as $$
declare s jsonb;
begin
  if not public.is_super_admin() then
    raise exception 'Only a Super Admin can link staff records.' using errcode = '42501';
  end if;
  if staff is null or staff = '' then
    update public.profiles set staff_id = null, updated_at = now() where id = target;
    return;
  end if;
  select data into s from public.records where collection = 'staff' and id = staff;
  if s is null then raise exception 'Staff record not found.'; end if;
  update public.profiles
     set staff_id = staff, full_name = coalesce(s ->> 'name', full_name), updated_at = now()
   where id = target;
  insert into public.activity_log (actor_id, action, detail)
  values (auth.uid(), 'Staff record linked', jsonb_build_object('user', target, 'staff', staff));
end $$;
revoke execute on function public.admin_link_staff(uuid, text) from public, anon;
grant  execute on function public.admin_link_staff(uuid, text) to authenticated;
