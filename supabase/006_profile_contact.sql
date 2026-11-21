-- BCB Grounds · 006 · Phone, designation and photo on each sign-in account
-- Filled in by the Super Admin's invite, so a new user sees their own details on first login.
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists designation text;
alter table public.profiles add column if not exists photo text;   -- small JPEG data URL or https URL

create or replace function public.update_my_contact(new_phone text default null, new_photo text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_active_user() then raise exception 'Your account is not active.' using errcode = '42501'; end if;
  if new_phone is not null and length(new_phone) > 30 then raise exception 'Phone number is too long.'; end if;
  if new_photo is not null and (length(new_photo) > 400000 or new_photo !~ '^(data:image/(jpeg|png|webp);base64,|https://)') then
    raise exception 'That photo could not be saved. Try a smaller image.';
  end if;
  update public.profiles
     set phone = coalesce(nullif(trim(new_phone), ''), case when new_phone is not null then null else phone end),
         photo = coalesce(new_photo, photo),
         updated_at = now()
   where id = auth.uid();
end $$;
revoke execute on function public.update_my_contact(text, text) from public, anon;
grant  execute on function public.update_my_contact(text, text) to authenticated;
