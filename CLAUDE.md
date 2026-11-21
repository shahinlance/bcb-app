# BCB Grounds — project guide for Claude

Closed-group web app for **Bangladesh Cricket Board grounds operations**: venues, assets, Pitch Clay, staff and repair issues.
Live at **https://bcbgrounds.com**. Owner and only editor during testing: **Md. Shaheen Hossen (Shahin)**, Super Admin.

## How Shahin likes to work
- Keep replies **short**. When he has to do something himself, give **one step at a time**, in plain words (he is not a developer).
- He tests on his **phone**. Mobile layout is what matters.
- Never ask him to paste passwords, the database password or secret keys into chat.

## Stack (no build step)
- `app/`: plain HTML/CSS/JS, served as the site root. Entry point `app/index.html` loads the scripts in order.
- **Hosting:** Hostinger auto-deploys the `main` branch of the private GitHub repo `shahinlance/bcb-app` into `public_html`. `.htaccess` serves `app/` at `/` and blocks `docs/`, `supabase/` and `scripts/`.
- **Backend:** Supabase project `wwugezaqtlkhunpbxakg` (Tokyo). `app/config.js` holds the URL and the **publishable** key, which is allowed. The service_role/secret key must **never** be in the repo or the app.
- supabase-js v2.49.4 from the jsdelivr CDN (UMD build).
- Email (invites, resets) goes through custom SMTP using the Hostinger mailbox `shahin@bcbgrounds.com`.

## Branches and publishing
Work on `dev`, then publish:
```
git push origin dev
git checkout main && git merge --ff-only dev && git push origin main
git checkout dev
```
Hostinger picks up `main` within a minute or two. Commit only when asked or as part of an agreed change.

## Checks
- `npm run check`: JS syntax and asset-reference check. It must pass before publishing.
- `npm start`: local preview at http://127.0.0.1:4173.
- After UI changes, look at the result at phone width (~400px).

## Roles (`public.app_role`)
| Role | Who | Can |
|---|---|---|
| `super_admin` | Shahin | Everything: users, venues, all edits |
| `visitor` | Chairman and central members | View all venues, edit nothing |
| `admin` | Per-venue admin | Edit records at assigned venues (`admin_venues`) |
| `venue_viewer` | One login per venue | See **only** their venue, read-only |

During the test phase, editing stays with Shahin only.

Users other than the Super Admin get a **minimal profile page**: photo, name, email, phone and Sign out. There is no notification bell for them.

## Database (migrations in `supabase/`, all applied, numbered in order)
- `profiles`
  - Columns: id, email, full_name, role, is_active, staff_id, phone, designation, photo.
  - `photo` is a small JPEG data URL.
  - A trigger creates a profile on each new auth user.
- `admin_venues(user_id, venue_id)`: assigns venues to admins and venue viewers.
- `venues`: ids 1 MIR, 2 CTG, 3 SYL, 4 FAT, 5 KHU, 6 BOG, 8 RAJ, 9 BAR (BCB grounds), plus rented venues 7 and 10–22.
- `records(collection, id, venue_id, data jsonb)`: **all app data** lives here.
  - Collections: `assets`, `pitchClay`, `staff`, plus older prototype ones.
  - Record ids look like `CTG-A-007`, `CTG-CLAY-1`, `CTG-OT-02` and `CTG-GT-01`.
- `activity_log`.
- Storage bucket `photos`. Uploads are restricted to admin and super_admin.
- RLS helpers: `my_role()`, `is_super_admin()`, `is_active_user()`, `can_edit_venue(int)`, `can_view_venue(int)` and `can_write_record(...)`.
- Remote procedures: `admin_update_user`, `admin_link_staff`, `update_my_name`, `update_my_contact` and `venue_admins()`.
- Edge function `supabase/functions/invite-user`:
  - Super Admin only.
  - Either creates the account with a password Shahin chooses, or sends an invite link.
  - Saves name, phone, designation, photo, role and venues in advance.
  - The app then shows a ready-to-send welcome message.
- Security advisor warnings about "signed-in users can execute SECURITY DEFINER functions" are **by design**, because each function re-checks the caller.

New schema changes go in a new numbered SQL file (`007_...sql`), applied with Supabase MCP `apply_migration`. They must be safe to re-run (`if not exists`, `drop policy if exists`).

## Key app files
- `auth.js`
  - Sign-in, invite/reset password screens, `BCB_USER` (role, venues, staffId, phone, designation, photo).
  - Venue viewers have the venue list trimmed to their own venues.
- `sync.js`
  - Loads `records` into `db.*`.
  - `persist()` diffs and upserts only what changed.
  - Refreshes when the app comes back into view and every 60 seconds.
- `venue-data.js` / `venue-data.css`: the real data screens.
  - Assets: groups in sheet order, Needs repair group card, search.
  - Pitch Clay: venue card and national card.
  - Staff (Office Team / Grounds Team), the photo viewer (phone back button closes it first), the venue summary and the Issues-by-venue page.
- `client.js`: mobile home ("Hello," + name, Venues / Total issues, Assets and Staff tiles, All Venues) and the bottom menu (Home, Assets, Staff, Issues).
- `app.js`: routing (`go(screen, opts)`), venue cards and the venue overview (Ground issues → Pitch Clay → Assets → Staff).
- `profile.js`: My profile.
- `users.js`: Users & access, Invite a person.
- `app/media/<code>/`: imported venue photos (random file names), served by Hostinger.

## Venue data import (Google Drive → app)
- Drive folder **"BCB Grounds data"**:
  - One folder per venue.
  - Each holds one Google Sheet with tabs **Pitch Clay, Inventory, Grounds Team, Office Team**.
  - Photo subfolders are Inventory, Grounds Team and Office Team.
  - Photos are named by the Serial number (`12 (2).jpeg`, `31-1.jpg`, `Pitch Clay (3).jpg`).
- Shahin says "<venue> is ready / updated". Then:
  1. Read it with the Google Drive MCP.
  2. Run `scripts/import_venue.py` (it builds `records.json` and resizes photos into `app/media/<code>/`).
  3. Upsert with Supabase MCP `execute_sql`, using `jsonb_array_elements(...)` and `on conflict (collection,id) do update`.
  4. Commit the photos and publish.
- Full folder ids, rules and history: `docs/IMPORT-LOG.md`.
- **Import rules:**
  - Show a summary first (additions, updates, missing items, problems) and wait for a yes before bulk writes.
  - Match existing rows by ID or name and update them. Never duplicate.
  - **Never delete** rows that are missing from a newer sheet. List them for Shahin instead.
  - Never invent staff identities or contact details.
  - When a value looks odd, use the neighbouring columns to decide what it means. Ask if it's still unclear.
- **Display rules:**
  - The sheet columns are the final list of fields the app shows.
  - Do not show the Serial field on any card.
  - Dates are day/month.
  - Experience is calculated from the Joining Date and shown as "N years". The label is "Experience".
  - Confirmation Date shows "Not applicable" for Contractual/Mastertoll staff.
  - Notes are green; repair wording is orange.
  - Conditions such as "Repair needed" map to **Needs repair**.
- **Pitch Clay:**
  - Measured in **CFT**, shown as "150 CFT", with no thousands commas.
  - Labels: "In stock now", "January 2026 stock", "Used / given".
  - The stock bar colour follows % left: red <15, orange <35, yellow <60, otherwise green.
  - National figures will come from central data later. They are **not** the sum of the venue figures.
  - Whether "January 2026 Quantity" means stock on 1 January or clay received in 2026 is still undecided.

Imported so far: **Chattogram (venue 2)**: 36 assets, 1 Pitch Clay record, 34 staff, 92 photos.

## Open items
- More venues, when Shahin says they're ready.
- National Pitch Clay data source.
- The meaning of "January 2026 Quantity".
- Rework the Issues tab after the Chairman's feedback.
- Leaked-password protection is disabled in Supabase Auth (may need a paid plan).

## Other docs
- `docs/SETUP-SUPABASE.md`: setup notes.
- `docs/PLAN-NEXT.md`: agreed plan.
- `docs/IMPORT-LOG.md`: import history.
- `docs/forms/`: the venue data Excel form.
