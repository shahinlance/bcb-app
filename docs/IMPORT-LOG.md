# Venue data imports

Source: Google Drive folder **BCB Grounds data**, owned by the BCB data Google account.
Folder ID `1z8snfRuAzhqOYhSvwsncAVd913cTGZYQ`. There is one subfolder per venue, each holding the filled form (`docs/forms/BCB-Grounds-Venue-Data-Form.xlsx`) and its photos.
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
