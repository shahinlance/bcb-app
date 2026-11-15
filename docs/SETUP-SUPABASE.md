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
- **Site URL**: the address where you open the app. While testing on your laptop, use `http://127.0.0.1:4173`. Change it to the Hostinger address later.
- **Redirect URLs**: add `http://127.0.0.1:4173/**`. Add the Hostinger address later too.

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

## What each role can do

| Role | Sees | Can change |
|---|---|---|
| Visitor | Everything | Nothing |
| Admin | Everything | Records at their assigned venues |
| Super Admin | Everything | Everything, including users |

These rules are enforced inside the database. Hiding a button is not what protects anything.

## Current limits (phase 1)
- Sign-in, roles and user management are real, and shared across all devices.
- Operational records are **still saved in each browser**: issues, inventory, matches, pitches and photos. Moving them to the shared database is phase 3. Until then, Admin venue limits are recorded but not yet applied to those records.
- New people are invited from the Supabase dashboard. An in-app **Invite** button is phase 2.
