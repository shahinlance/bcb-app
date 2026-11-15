# Groundline product handoff

Prepared for Salman Tushar and the Product Manager on 26 October 2026.

This document consolidates the product directions and decisions from this conversation. It is a working handoff, not a word for word chat export. Later decisions below supersede earlier directions. Upload this file to a new ChatGPT conversation to continue planning or implementation.

## Prompt for the next ChatGPT

You are helping our Product Manager continue Groundline, a Bangladesh Cricket Board grounds operations app. Read this entire handoff first. Treat the final decisions as the baseline. Preserve existing navigation, page structure and flows unless we explicitly request a change. Use simple language, concrete content and minimal UI. Review the live app before proposing changes if browsing is available. Separate existing prototype behavior from production requirements. Never invent employees, contact information, inspection evidence or verified photos. Ask only for information that materially blocks work. Start by summarizing your understanding and identifying the next requested task. Uploading this document does not itself give access to the original Site project or its source repository.

## Product purpose and audience

The Chairman and a small group of senior BCB users need an easy morning view of grounds, equipment problems, work, approvals and match readiness. These users want complex operational information made simple. Avoid vague content, decorative clutter and generic AI looking UI.

Roles are Super Admin and Admin. Workers do not have app accounts or a worker interface. Responsible admins coordinate workers. The prototype also has a Visitor preview role; do not assume that is a confirmed production role.

## Current artifact and implementation

Live app: https://bcb-groundline.grittyjelly16.chatgpt.site/

Site title: Groundline — BCB Grounds Management

Site project ID: appgprj_6ad466f12a308191af1e77464c115bba

Latest completed publication in this conversation: version 21, source commit cd60d4782b2e3f581a7a963eda71510942bd7248.

This is an interactive prototype. Operational records and edits are stored in browser localStorage, not a shared production backend. Data does not automatically sync between users, devices or ChatGPT accounts. Browser demo records are not verified BCB operational records. Production authentication, shared database, permissions, upload storage and notifications need separate implementation and acceptance.

The existing implementation is buildless HTML CSS JavaScript. Source is organized as dist/index.html, style.css, client.css, client.js, app.js, issues.js, inventory.js, sheets.js, team.js, matches.js, profile.js and photos.js. The hosting manifest declares dist as the static directory. Default view is the client app; ?explore=1 opens the legacy screen explorer. Do not treat the explorer as the latest customer UI.

## Final design rules

Keep the current UX, navigation, flows and page structure. The visual direction is clean iOS style with restrained modern tonal colours. The earlier Google modern look reference was a visual inspiration, not permission to change flow.

Summary cards must have white surfaces, soft borders, coloured numbers and small soft icon backgrounds. Do not use saturated full card fills. Do not add arrows inside big number summary cards. Latest layout: filled icon on the left, number at upper right and label below it on the right. Icons must be proper filled shapes, not outline icons filled indiscriminately. Apply this shared pattern across Home, Issues, Inventory and Grounds Team.

The previous solid green red blue violet metric card design was rejected and superseded. Do not restore it.

Bottom navigation: the active item uses a filled icon; inactive items use stroke icons. Keep subtle colour accents, readable text and clear hierarchy. Photos should help explain equipment or ground issues. Reference photos must be labeled; never present stock images as live inspection evidence.

Greeting must read exactly Good Morning Mr. Chairman. Earlier Fahim and Chairman only variants are superseded.

## Navigation and Home

Final bottom navigation order: Home, Inventory, Grounds Team, Issues, Matches.

Issues and work belong to one module. Keep Issue reports and Work and reviews inside it; do not restore separate bottom navigation entries for Work or Requests.

Home includes grounds needing attention, operational metrics, primary Inventory and Grounds Team shortcuts and ground cards. Attention cards may show photos of the affected equipment. Metric shortcuts: Active work opens active work; To approve opens submitted requests; To review opens work ready for review.

The primary shortcuts should be large photo cards in a horizontal carousel. Inventory occupies about three grid shares and Grounds Team one share, with the Grounds Team card peeking from the right. Preserve this emphasis on the app's main features.

## Grounds and exact priority

Use short names throughout lists, cards and selectors. Show fuller names in ground details where confirmed. Preserve this exact order. First eight are BCB grounds; the rest are rented venues where BCB arranges play. This later list supersedes the original eight ground scope and ownership assumptions.

| Priority | Display name | Classification |
| --- | --- | --- |
| 1 | SBNCS, Mirpur | BCB ground |
| 2 | BSSFLMRCS, Chattogram | BCB ground |
| 3 | SICS, Sylhet | BCB ground |
| 4 | SRGCS, Fatullah | BCB ground |
| 5 | DCS, Khulna | BCB ground |
| 6 | DCS, Rajshahi | BCB ground |
| 7 | SCS, Bogura | BCB ground |
| 8 | KJDCS, Barishal | BCB ground |
| 9 | BKSP- 3 & 4 | Rented venue |
| 10 | NCG, Purbachal | Rented venue |
| 11 | Cox's Bazar Cricket Stadium | Rented venue |
| 12 | BT Ground, Teguria | Rented venue |
| 13 | City Club | Rented venue |
| 14 | DUG | Rented venue |
| 15 | JHG | Rented venue |
| 16 | Fens Cricket Academy | Rented venue |
| 17 | Cricketers Academy | Rented venue |
| 18 | PKSP- 1 & 2 | Rented venue |
| 19 | Narayangonj Dristict Stadium | Rented venue |
| 20 | Rangpur Cricket Garden | Rented venue |
| 21 | Ulab | Rented venue |
| 22 | Daffodils University | Rented venue |

The display spelling above follows the user's supplied list, including Narayangonj Dristict Stadium. Confirm official corrections before changing labels. Do not guess acronym expansions.

Ground detail includes overall status, pitch report and photos, work/issues, inventory and matches. Ground tabs are Overview, Inventory, Pitch and Matches. A new ground without reports should show No report or Awaiting first report, without invented assignments, photos or inspection results.

Technical continuity: preserve existing record IDs when changing order. Old records use Mirpur 1, Chattogram 2, Sylhet 3, Fatullah 4, Khulna 5, Bogura 6, Cox's Bazar 7 and Rajshahi 8. Priority is a separate field. Renumbering these IDs can break inventory and match relationships.

## Inventory

National Inventory shows equipment and supply groups, not a single asset masquerading as a group. Group cards show a clear type, photo, total quantity, ground coverage and repair or stock information. Opening Rollers should show the individual rollers across grounds. The current demo contains 20 rollers across the original eight record locations; do not imply every new venue has inventory.

Current groups include rollers, mowers, covers, water pumps, hydraulic oil, fertiliser and grass seed. Counts must come from records. Group detail supports individual inventory IDs, ground and condition filters, search and repair visibility.

Critical flow: Inventory inside a specific ground shows that ground's individual items. It must never jump to the national Inventory navigation page. Item detail and back navigation retain the ground context. Adding an item here locks the selected ground.

Add inventory fields and behavior:

- Item name and unique Inventory ID.
- Inventory of dropdown with NSC and BCB.
- Date added defaults to the current Bangladesh date and can be changed manually.
- Ground, equipment or consumable classification, quantity, unit and minimum stock where relevant.
- Assigned to, condition/status, notes and photos are part of the requested inventory information; verify the full production field model with the PM rather than inventing assignments.
- Clear repair, maintenance, operational and low stock states.
- Modal/sheet has a visible drag down dismissal option as well as normal close behavior. Preserve drafts appropriately between global and ground contexts.

Photos should be real equipment photographs when supplied. Current reference imagery is not evidence of an individual asset's condition.

## Issues and work

Issues identify a fault, affected ground, category, asset where applicable, urgency, status and evidence. Global filters include priority, ground, category and status; search covers machine/fault/location. Summary metrics include Active issues, Urgent and Unassigned.

Work supports assignment to the responsible admin, due date, priority, checklist, progress, blockers, completion evidence and review. Important states include Assigned, In progress, Blocked, Ready for review, Completed and Cancelled. Keep To approve and To review distinct: supply request approval is different from reviewing completed work.

Counts and ground attention indicators must be derived from actual records. Do not invent trends or readiness values. User requested equipment fault photos in attention cards where useful.

## Grounds Team

Directory hierarchy is designation group, then people in that designation, then View profile and employee details. Designation cards show designation name, actual member count, clear profile photos, names and a secondary View team action. Individual cards include View profile. Avoid vague staff summaries.

The prototype contains three demo staff records: Rafiqul Islam as National Curator, Arif Hossain as Curator and Mahmud Hasan as Curator. Workload and ground coverage are computed from records. Existing portraits are stock references, clearly labeled. They are not verified employee identity photos. Production needs approved staff data and actual portraits; do not fabricate email or phone numbers.

Employee profiles show designation, assigned grounds and work workload, including active, overdue and review counts. Assignment actions should retain the selected staff member.

## Matches and calendar

Critical flow: Matches inside a ground stays inside that ground and lists only fixtures for that ground. It must not jump to the national Matches navigation page. Adding a match there retains and locks the ground.

Ground match page order: Running matches, Upcoming matches, Add match, then a small Match history button near the bottom. The user explicitly rejected nested Running Upcoming History tabs. Do not reintroduce them. A modest filter may be considered only when needed without changing this order.

National Matches provides the calendar across grounds. Calendar should feel interactive and professional within the same design system: month navigation, month/year picker, Today, selected date, visible event markers/counts, date fixture list and a way to show all dates. Use Bangladesh dates, not hardcoded demo today values. Keyboard/date navigation and multi-day fixtures need to work.

Fixture details include ground, title, dates/times, format, responsible admin, pitch, status and preparation checklist. Add match and pitch update flows support photos where relevant.

Preparation meter uses a red to amber to green goal gradient, with percentage, completed tasks and blockers. Green ready state requires all preparation checks complete and no active blockers. Red signals danger or blocking work/issues. Do not claim a match can start merely because a checklist percentage is high; retain the responsible curator's final readiness confirmation. The shared meter appears in fixture cards and details.

## Account profile

The account profile is for the user's identity and account preferences. Show full name, email and phone with current value and a clear Change or Add action. Support easy editing, validation and save feedback.

Use a round portrait with a small camera/upload/change control beside it. Photo selection should provide simple crop/position/zoom behavior. Current prototype persists the photo locally. Default stock portrait is labeled as a reference until replaced; it is not verified identity.

Keep Activity log. Suitable account options currently include notification preferences, workspace details and About. Operational shortcuts such as inventory, transfers, supply requests and team management do not belong in the profile group. Share prototype and reset walkthrough were removed from the account profile. Do not add fake password or identity verification actions without real supporting systems.

## Content and data rules

Use real, specific content. Show honest empty states when data is absent. Never manufacture staff identities, verified photographs, reports, contact information, live inspections or production access. Prototype seed records and dates are demonstrations. The original request for real employee photos remains a production data dependency despite reference portraits in the prototype.

Dates should respect Asia/Dhaka. Keep the user's concise ground names and priority. New data must not overwrite or reset browser data without explicit authorization. This file contains no credentials and grants no project access.

## Acceptance checklist for future changes

1. Navigation remains Home Inventory Grounds Team Issues Matches with filled active icons and outline inactive icons.
2. Home greeting is Good Morning Mr. Chairman.
3. Summary cards retain white surfaces and subtle accents with no arrows, filled icon left and number over label at right.
4. All 22 venues appear in the exact priority order, with eight BCB and fourteen rented classifications.
5. Ground Inventory and Ground Matches remain scoped, including Add and Back flows.
6. Inventory group counts and individual item counts reflect actual records.
7. Team designation membership and workload derive from staff and work records.
8. Ground matches show Running then Upcoming then Add then small History access, with no nested status tabs.
9. Preparation readiness never ignores blockers.
10. Profile changes validate and save; reference imagery and missing contact information remain honest.
11. Changes are checked for readable contrast, label overflow, mobile layout and working actions.
12. Distinguish browser prototype completion from production implementation and data readiness.

## How the Product Manager can continue

Upload this Markdown file to ChatGPT and paste the prompt near the top. Then describe one concrete next task. For editing the same live Site, the PM needs separate authorized access to the Site and its source, or a source export supplied by the owner. A document upload alone transfers context, not editing rights, local browser records or this conversation's tool sessions.

Recommended first PM task: review the current app against this handoff, list production gaps separately from UI changes, confirm official staff/assets/venue details, and agree on the next delivery scope. Treat this as a recommendation, not an already approved roadmap.
