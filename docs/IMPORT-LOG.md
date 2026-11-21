# Venue data imports

Source: Google Drive folder **BCB Grounds data**, owned by the BCB data Google account.
Folder ID `1z8snfRuAzhqOYhSvwsncAVd913cTGZYQ`. There is one subfolder per venue, each holding the filled form (`docs/forms/BCB-Grounds-Venue-Data-Form.xlsx`) and its photos.
How: `scripts/import_venue.py` turns the workbook plus downloaded photos into records (`assets`, `pitchClay`, `staff`) and resized photos under `app/media/<code>/`, with random names that stay stable across re-imports. The records are upserted with SQL through the Supabase connector.
Target: Supabase project `wwugezaqtlkhunpbxakg`, table `public.records`. Inventory goes in collection `inventory` and staff in `team`.

## Rules
- Before writing anything, show the user a summary (added / updated / missing / problems) and wait for a yes.
- Match existing rows by asset code, or by name + venue for items and by name for staff. Update matches; never create duplicates.
- Never delete rows that are missing from a newer form. List them for the user instead.
- Skip the grey example row (row 4).

| Folder | App venue id | Drive folder ID |
|---|---|---|
| 01 - Mirpur (SBNCS) | 1 | 1Gc7hAvOmKhUnTayyOFwDb7A5wKP3xJ59 |
| 02 - Chattogram (BSSFLMRCS) | 2 | 16iFeJojVz-K3inN7lJl9SPSlHGEPZKvb |
| 03 - Sylhet (SICS) | 3 | 1H50pmVIQ1MublOhk3ERlLHD-YbdONxOr |
| 04 - Fatullah (SRGCS) | 4 | 1K6ix4eaKsLbHCD0anXBehBgQ6vKmzb3x |
| 05 - Khulna (DCS) | 5 | 1wJfdkK-IS6j4WthbHcaMpCgWzy9ARxYl |
| 06 - Rajshahi (DCS) | 8 | 1xPF5hsTt-w_Yn-db2Our-USb4MUBQmAG |
| 07 - Bogura (SCS) | 6 | 1t-jGsXPX-ZwSYfXEcCoPhgOthgyVgVdr |
| 08 - Barishal (KJDCS) | 9 | 10su0h-f8UILYFStRaSwtzvGX2UswuV7B |

Rented venues (09–22) have no folders yet.

## Log
| Date | Venue | What was loaded | Notes |
|---|---|---|---|
| 2026-11-20 | — | Folders set up, all empty | — |
| 2026-11-21 | 02 Chattogram (imported) | 36 assets, 1 Pitch Clay, 25 grounds team, 9 office team, 92 photos | Photos in `app/media/ctg/`. Open sheet issues: clay 2600−2600≠150; #19 no group; #24 no photo; 5 confirmation-before-joining dates (Office #1, #3, #8; Grounds #6, #9); Office #9 NID 12 digits; same mobile for GT #12/#19 |
| 2026-11-21 | 02 Chattogram (re-sync) | 16 records updated: clay January 2,750 (now adds up), #19 group Sharpner, confirmation dates corrected, GT #19 new mobile | Kept as decided: #24 no photo yet; Office #9 NID as given; Office #3 blood group blank. Importer now also reads dates written as words ("1 July 2024"). |
