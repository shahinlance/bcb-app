# Supabase setup: logins and roles (phase 1)

This is a one-time setup, about 10 minutes. Do the steps in this order.

## 1. Create the tables and rules
Supabase → **SQL Editor** → **New query**. Paste all of `supabase/001_users_and_roles.sql` and click **Run**. You should see "Success. No rows returned".

## 2. Turn off public sign-up
Supabase → **Authentication** → **Sign In / Providers**:
- Turn **Allow new users to sign up** OFF. Only invited people can get in.
- Leave the **Email** provider ON.

## 3. Tell Supabase where the app lives
Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: `https://bcbgrounds.com`
- **Redirect URLs**: add `https://bcbgrounds.com/**`. If you also preview on your laptop, add `http://127.0.0.1:4173/**`.

Invite and password-reset emails open this address.

## 4. Make yourself the first Super Admin
1. Supabase → **Authentication** → **Users** → **Invite user** → enter your own email.
2. Open the email and click the link. The app asks you to set a password, then shows "Waiting for access".
3. SQL Editor: open `supabase/002_make_first_super_admin.sql`, put your email in it and click **Run**.
4. In the app, click **Check again**. You're in. **Profile → Users & access** now appears.

## 5. Inviting everyone else
1. Supabase → Authentication → Users → **Invite user**.
2. They set their password from the email and see "Waiting for access".
3. You go to **Profile → Users & access**, open their name, and set:
   - their role,
   - their venues (Admins only),
   - **Account active** ON.

**Email limit:** until custom SMTP is set up, Supabase's built-in mailer only sends to members of your Supabase team, and at most 2 emails per hour. Before inviting other people, set up custom SMTP: Authentication → **Emails** → **SMTP Settings**. A Hostinger email account works. Its SMTP host is usually `smtp.hostinger.com`, port 465.

## 6. Shared records and photos (phase 3)
SQL Editor → New query → paste all of `supabase/003_shared_records.sql` → **Run**.
This creates the shared table for every app record and a **photos** storage bucket.
The app starts empty: add real staff, inventory, issues and matches from the app.

## What each role can do

| Role | Sees | Can change |
|---|---|---|
| Visitor | Everything | Nothing |
| Admin | Everything | Records at their assigned venues |
| Super Admin | Everything | Everything, including users |

These rules are enforced inside the database. Hiding a button is not what protects anything.

## Current limits
- New people are invited from the Supabase dashboard. An in-app **Invite** button is phase 2.
- Other people's changes appear when you return to the app or within a minute (not instantly).
- Photos are stored under random, unguessable web addresses. Anyone given a photo's exact link can open it; the app itself requires sign-in.
- Personal settings (profile photo, phone, notification "read" state) stay in each browser.
