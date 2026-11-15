-- BCB Grounds · 002 · Make the first Super Admin
-- 1. Supabase → Authentication → Users → "Invite user" → enter YOUR email.
-- 2. Open the invite email, set your password in the app.
-- 3. Replace the email below with yours, then run this once in SQL Editor.
--    After this, manage everyone else from the app (Profile → Users & access).

update public.profiles
   set role = 'super_admin', is_active = true, updated_at = now()
 where email = lower('YOUR-EMAIL@example.com');

-- Should return exactly one row:
select email, role, is_active from public.profiles where role = 'super_admin';
