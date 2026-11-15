# BCB Grounds

Grounds operations app for the Bangladesh Cricket Board: venues, inventory, grounds team, pitches and reports, issues, matches and photos. Opened by link in a phone or laptop browser.

## Status

Plain HTML, CSS and JavaScript, no build step. **Sign-in, roles and all records run on Supabase**; photos go to Supabase Storage. Setup steps: [docs/SETUP-SUPABASE.md](docs/SETUP-SUPABASE.md).

## Roadmap

1. ✅ **Logins and roles** (Supabase Auth, invite-only)
   - **Visitor** — e.g. Chairman; views everything, edits nothing.
   - **Super Admin** — full access; invites users, assigns roles and venues.
   - **Admin** — edits records only for their assigned venue(s).
2. ✅ **Users & Access** section inside the app (Super Admin only), with activity log. *Next: in-app Invite button (Edge Function).*
3. ✅ **Shared database and photo storage** — `app/sync.js` loads all records after sign-in and saves only what changed; the database enforces venue rules.
4. **Real data** — started empty; Super Admin builds the roster (Grounds Team → Add staff member), Admins add inventory, issues, pitch reports.
5. **Launch** — bcbgrounds.com (Hostinger, deployed from `main`; `.htaccess` serves `app/` at the root and keeps other folders private).

## Branches

- `main` — what runs at **https://bcbgrounds.com**. Hostinger auto-deploys every push to `main`.
- `dev` — work in progress; merged into `main` once checked. To undo a bad release, revert the commit on `main`.

## Working locally

Requires Node.js. No dependencies to install.

```
npm start      # preview at http://127.0.0.1:4173
npm run check  # JavaScript syntax + asset reference checks
```

## Layout

```
app/       the web app (this folder is what gets hosted)
supabase/  database setup scripts, run in order in the Supabase SQL Editor
scripts/   local preview and checks
docs/      guide, product handoff, change notes, recovered chat history
```

## Rules

- Never commit passwords or secret keys. The Supabase **anon/public** key may live in the app; the **service_role** key must never be in this repo.
- Never invent staff identities, contact details or inspection photos. Demo and stock images must stay labelled as references.
- Preserve existing record IDs (e.g. ground IDs) — inventory and matches link to them.

## Known to-do

- None open from the handover.
