-- BCB Grounds · 004a · New role: venue viewer (one venue, read-only)
-- Must run on its own, before 004b (Postgres needs the new value committed first).
alter type public.app_role add value if not exists 'venue_viewer' before 'super_admin';
