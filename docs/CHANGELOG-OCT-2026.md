# BCB Grounds — updated editable app

Updated 27 October 2026 from Groundline-Editable-App.zip and the supplied BCB logo.

## Changes
1. Grounds Team: one Head of Turf Management profile, with five expandable staff categories.
2. Asset details: Responsible admin removed; consumable minimum stock retained.
3. All 22 venue overview pages end with a venue-filtered Grounds Team section. Single recorded members open individual profiles; multiple members open groups. Empty categories show staffing expectations (one Curator, 1–2 Deputy Curators, 1–2 Assistant Curators, 1–2 Head Groundsmen, multiple Groundsmen).
4. Staff bios show Full Name, Home District, Division, Country, Joining Date, Job Status, Experience (years), Mobile Number, Email Address. Work assignment screens/actions and profile work summaries are retired. Previous work records are retained as retiredWorkRecords rather than deleted when saving.
5. BCB Grounds branding and supplied BCB logo replace the old name and home symbol. Logo also used for browser and app icons.

## Data
Three existing demo identities and reference portraits are retained. Other staff and biographical details have not been supplied. No employees or contact details were invented. Venue membership currently reflects the existing demo venue associations; actual BCB rosters must be supplied for operational use.

This remains a browser-local prototype. Records do not synchronize between users or devices. Existing uploaded photos and browser-only changes are not part of the original ZIP.

## Editing
app/ contains editable HTML, CSS and JavaScript. No build step required. The former ?explore=1 view now opens the same app so retired assignment features cannot be reached there.

The historical Groundline-Product-Handoff.md is retained for reference. The five changes in this document supersede its work-assignment and branding directions. SOURCE-MANIFEST.json describes this updated package, not the original publication.

## Verification
All JavaScript files pass syntax checks. 92 automated checks cover the six designations, profiles, all 22 venue team sections, venue filtering, all 27 inventory asset detail views, removal of work UI, and logo display. Browser checks also verified the home logo, team navigation, head bio, venue team section and asset details.

## Additional updates — 27 October 2026
- Home greeting uses the saved app profile name. This prototype does not have shared sign-in; it cannot identify arbitrary signed-in visitors until authentication is implemented.
- Removed Grounds operations caption and shortened Home summary cards from 112px to 88px. Work assignment features remain disabled.
- Pitches tab is a venue-scoped directory. Add pitch supports a profile, operation status and up to four photos with taken date. Active pitches also appear under Pitches in operation. No real pitch roster was supplied, so the initial directory stays empty unless legacy report data exists.
- Each pitch holds multiple dated reports. Add Report appends history; Update report edits the selected report, preserving the others. Each report supports up to four photos and a taken date. Existing single venue reports migrate without loss.
- Venue Matches now shows Ongoing, Recent, Upcoming in order. Cancelled matches remain separately available.
- Existing supplied BCB LOGO (2).png has an alpha transparency channel and is retained. Home logo and its wrapper have transparent backgrounds. No new logo attachment was supplied in the latest message.
- Additional verification: 26 automated checks passed for pitch/report persistence logic, photo preservation, migration, validation, greeting and match phases. Browser checks confirmed save, update and reload persistence.
