# Next build: agreed with Shahin on 20 Nov 2026

**Status: waiting.** Shahin is finishing the Chattogram folder (asset photos, a few corrections). Do not import or build until he says it is ready. Chattogram is the first venue to import.

## Source format (per venue folder on Drive)
- One workbook per venue, with tabs **Pitch Clay**, **Inventory**, **Grounds Team** and **Office Team**. Row 1 is the header; data starts at row 2.
- Photo subfolders: **Inventory**, **Grounds Team** and **Office Team**. Each photo file is named by the row's **Serial** (e.g. `16.webp`). Extra photos of the same item are named `16-2`, `16-3` …
- Dates are day/month. If a date is ambiguous, check the neighbouring rows (a month cannot be greater than 12).

## Assets
- Groups and categories come from the sheet as-is: Equipment, Accessories, Pesticides / Fertilizers. Conditions also as-is, including "Needs repair or replacement".
- The asset page shows every sheet column. Assets with several photos get a swipeable carousel, and tapping a photo opens it full screen.
- "Asset code / ID" is the store-entry team's fixed asset ID. Shahin hasn't decided whether to keep it. The app's own key is venue + Serial (e.g. CTG-007).

## Pitch Clay (unit: **SQF**)
- Show it at the top of Assets, on each venue, and as a national card.
- **National figures come from their own central data**: how much was distributed to grounds this year, and the current central stock. They are NOT a sum of venue figures, because some venues hold 2024–2025 stock.
- Venue figures: present, the January 2026 / received amount, and usage per destination. Shahin is still deciding whether "January 2026 Quantity" means opening stock or received in 2026.

## Staff Members
- One tab with two groups, Office Team and Grounds Team. Member cards open a full profile with every sheet field (NID, blood group, etc. are fine to show; it's a closed group).
- Normalise mobile numbers and list the odd ones.

## Access (launch / test phase)
- **New role: Venue viewer.** One login per venue. They see only their own venue's data and are read-only. This must be enforced in the database (RLS on records select by venue).
- Central logins are mostly Visitors (view everything, read-only).
- Editing stays with Shahin (Super Admin) for now. Venue editing will be reviewed after about a month.
