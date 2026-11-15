# BCB Grounds

Grounds operations app for the Bangladesh Cricket Board: venues, inventory, grounds team, pitches and reports, issues, matches and photos. Opened by link in a phone or laptop browser.

## Status

Working prototype. Plain HTML, CSS and JavaScript, no build step. Records are currently saved only in each user's browser (localStorage) — there is no login or shared data yet.

## Roadmap

1. **Logins and roles** (Supabase Auth, invite-only)
   - **Visitor** — e.g. Chairman; views everything, edits nothing.
   - **Super Admin** — full access; invites users, assigns roles and venues.
   - **Admin** — edits records only for their assigned venue(s).
2. **Users & Access** section inside the app (Super Admin only), with activity log.
3. **Shared database and photo storage** (Supabase); move each module off localStorage.
4. **Real data** — venues, staff, equipment, replacing demo records and stock photos.
5. **Launch** — Hostinger deploys `app/` from the `main` branch.

## Branches

- `main` — approved, live version.
- `dev` — day-to-day work; merged into `main` when approved.

## Working locally

Requires Node.js. No dependencies to install.

```
npm start      # preview at http://127.0.0.1:4173
npm run check  # JavaScript syntax + asset reference checks
```

## Layout

```
app/       the web app (this folder is what gets hosted)
scripts/   local preview and checks
docs/      guide, product handoff, change notes, recovered chat history
```

## Rules

- Never commit passwords or secret keys. The Supabase **anon/public** key may live in the app; the **service_role** key must never be in this repo.
- Never invent staff identities, contact details or inspection photos. Demo and stock images must stay labelled as references.
- Preserve existing record IDs (e.g. ground IDs) — inventory and matches link to them.

## Known to-do

- `og:image` in `app/index.html` still points to the old ChatGPT Sites URL; update once the Hostinger domain is set.
