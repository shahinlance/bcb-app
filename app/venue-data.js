/* BCB Grounds · Assets, Pitch Clay and Staff Members.
   Records come from each venue's Google Sheet (imported centrally). Every sheet column is
   kept in `fields` as [label, value, type] in sheet order, and the app shows exactly those.
   The one calculated field is Experience, worked out from the Joining Date. */
const VENUE_CODES = { 1: 'MIR', 2: 'CTG', 3: 'SYL', 4: 'FAT', 5: 'KHU', 6: 'BOG', 8: 'RAJ', 9: 'BAR' };
const CLAY_UNIT = 'CFT';
const STAFF_TEAMS = ['Office Team', 'Grounds Team'];

/* ── Scope: which venue the person is looking at ───────────────────── */
function visibleVenues() { return grounds; } // venue viewers' list is already trimmed at sign-in
function scopedVenue() {
  const list = visibleVenues();
  if (list.length === 1) return list[0].id;
  const v = state.dataVenue;
  return v && list.some(g => g.id === v) ? v : 'all';
}
function inScope(rec, venue = scopedVenue()) { return venue === 'all' || Number(rec.ground) === Number(venue); }
function venueName(id) { return G(Number(id))?.short || 'Unknown venue'; }
function venuePicker(screen) {
  const list = visibleVenues(); if (list.length < 2) return '';
  const cur = scopedVenue();
  const counts = id => (screen === 'staff' ? db.staff : db.assets).filter(r => Number(r.ground) === id).length;
  const withData = list.filter(g => counts(g.id));
  return `<label class="field data-venue-field">Venue<select data-venue-pick="${screen}"><option value="all" ${cur === 'all' ? 'selected' : ''}>All venues</option>${withData.map(g => `<option value="${g.id}" ${cur === g.id ? 'selected' : ''}>${esc(g.short)} (${counts(g.id)})</option>`).join('')}${list.filter(g => !counts(g.id)).length ? `<option disabled>── No data yet ──</option>${list.filter(g => !counts(g.id)).map(g => `<option value="${g.id}" ${cur === g.id ? 'selected' : ''}>${esc(g.short)}</option>`).join('')}` : ''}</select></label>`;
}

/* ── Field formatting ──────────────────────────────────────────────── */
function parseDay(v) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || '')); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null; }
function fmtDay(v) { const d = parseDay(v); return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : v; }
function yearsSince(v) {
  const d = parseDay(v); if (!d) return null;
  const now = new Date(); let y = now.getUTCFullYear() - d.getUTCFullYear();
  if (now.getUTCMonth() < d.getUTCMonth() || (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())) y--;
  return Math.max(0, y);
}
function fieldValue(rec, label, value, type) {
  if (/^experience/i.test(label) && rec.joining) { const y = yearsSince(rec.joining); return y == null ? null : `${y} year${y === 1 ? '' : 's'}`; }
  if (/^confirmation date/i.test(label) && (value == null || value === '') && /contract|master/i.test(rec.jobStatus || '')) return 'Not applicable';
  if (value == null || value === '') return null;
  if (type === 'date') return fmtDay(value);
  if (type === 'phone') return `<a href="tel:${esc(value)}">${esc(value)}</a>`;
  if (type === 'email') return `<a href="mailto:${esc(value)}">${esc(value)}</a>`;
  if (type === 'number') return Number(value).toLocaleString('en-GB');
  return esc(value);
}
function fieldTable(rec, skip = []) {
  return `<dl class="data-fields">${(rec.fields || []).filter(([l]) => !skip.includes(l)).map(([label, value, type]) => {
    const shown = fieldValue(rec, label, value, type);
    return `<div><dt>${esc(label)}</dt><dd class="${shown == null ? 'muted' : ''}">${shown == null ? 'Not provided' : (type === 'phone' || type === 'email' || /^experience|^confirmation/i.test(label) ? shown : shown)}</dd></div>`;
  }).join('')}</dl>`;
}

/* ── Photos: carousel + full screen ────────────────────────────────── */
function photoCarousel(photos, alt) {
  if (!photos?.length) return `<div class="data-carousel data-carousel--empty">${icon('box')}<span>No photo yet</span></div>`;
  return `<div class="data-carousel" data-carousel><div class="data-carousel-track" data-carousel-track>${photos.map((src, i) => `<button class="data-slide" data-photo-open="${i}" aria-label="Open photo ${i + 1} of ${photos.length}"><img src="${esc(src)}" alt="${esc(alt)} — photo ${i + 1}" loading="${i ? 'lazy' : 'eager'}" decoding="async"></button>`).join('')}</div>${photos.length > 1 ? `<div class="data-dots">${photos.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div><span class="data-count">1 / ${photos.length}</span>` : ''}</div>`;
}
function openPhotoViewer(photos, start, alt) {
  showModal(`<div class="photo-viewer"><div class="data-carousel-track" data-carousel-track data-viewer-track>${photos.map((src, i) => `<div class="data-slide"><img src="${esc(src)}" alt="${esc(alt)} — photo ${i + 1}"></div>`).join('')}</div>${photos.length > 1 ? `<p class="photo-viewer-hint">Swipe for more · ${photos.length} photos</p>` : ''}</div>`);
  const track = document.querySelector('[data-viewer-track]');
  if (track) requestAnimationFrame(() => { track.scrollLeft = start * track.clientWidth; });
}
document.addEventListener('scroll', e => {
  const t = e.target; if (!(t instanceof Element) || !t.matches('[data-carousel-track]')) return;
  const box = t.closest('[data-carousel]'); if (!box) return;
  const i = Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
  box.querySelectorAll('.data-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
  const c = box.querySelector('.data-count'); if (c) c.textContent = `${i + 1} / ${box.querySelectorAll('.data-slide').length}`;
}, true);

/* ── Pitch Clay ────────────────────────────────────────────────────── */
function clayUsed(rec) { return (rec.fields || []).filter(([l, v]) => /^(used in|given to)/i.test(l) && v != null && v !== '').reduce((s, [, v]) => s + Number(v || 0), 0); }
function clayOpening(rec) { const f = (rec.fields || []).find(([l]) => /january|received/i.test(l)); return f && f[1] != null && f[1] !== '' ? Number(f[1]) : null; }
function clayNum(n) { return n == null ? '—' : Number(n).toLocaleString('en-GB'); }
function venueClayCard(id, compact = false) {
  const rows = db.pitchClay.filter(r => Number(r.ground) === Number(id));
  if (!rows.length) return compact ? '' : `<section class="clay-card clay-card--empty">${clayHead('Pitch Clay', venueName(id))}<p>No Pitch Clay data for this venue yet.</p></section>`;
  const present = rows.reduce((s, r) => s + Number(r.present || 0), 0);
  const opening = rows.reduce((s, r) => s + (clayOpening(r) || 0), 0), used = rows.reduce((s, r) => s + clayUsed(r), 0);
  const expected = opening - used, mismatch = rows.some(r => clayOpening(r) != null) && Math.abs(expected - present) > 0.01;
  const openLabel = (rows[0].fields.find(([l]) => /january|received/i.test(l)) || ['January 2026'])[0].replace(/ quantity/i, '');
  const tag = compact ? 'button' : 'section';
  return `<${tag} class="clay-card" ${compact ? `data-go="clay" data-clay-venue="${id}" aria-label="Pitch Clay at ${esc(venueName(id))}: ${clayNum(present)} ${CLAY_UNIT} in stock"` : ''}>${clayHead('Pitch Clay', venueName(id))}
    <div class="clay-figures"><div><strong>${clayNum(present)}</strong><span>${CLAY_UNIT} in stock now</span></div><div><strong>${clayNum(opening)}</strong><span>${esc(openLabel)}</span></div><div><strong>${clayNum(used)}</strong><span>${CLAY_UNIT} used / given</span></div></div>
    ${opening ? `<div class="clay-bar" aria-label="${Math.round(used / opening * 100)}% used"><i style="width:${Math.min(100, used / opening * 100)}%"></i></div>` : ''}
    ${mismatch ? `<p class="clay-warn">${icon('alert')}Doesn't add up: ${clayNum(opening)} − ${clayNum(used)} = ${clayNum(expected)}, but stock shows ${clayNum(present)} ${CLAY_UNIT}.</p>` : ''}
    ${compact ? `<span class="clay-more">See details ${icon('chevron')}</span>` : rows.map(r => `<h4 class="clay-sub">${esc(r.color || 'Clay')}</h4>${fieldTable(r)}${r.photos?.length ? photoCarousel(r.photos, 'Pitch clay') : ''}`).join('')}
  </${tag}>`;
}
function clayHead(title, sub) { return `<div class="clay-head"><span class="clay-icon">${icon('ground')}</span><div><h3>${esc(title)}</h3><small>${esc(sub)}</small></div></div>`; }
function nationalClayCard() {
  const central = db.pitchClayCentral[0];
  const venues = visibleVenues().map(g => ({ g, rows: db.pitchClay.filter(r => Number(r.ground) === g.id) })).filter(x => x.rows.length);
  const max = Math.max(1, ...venues.map(x => x.rows.reduce((s, r) => s + Number(r.present || 0), 0)));
  return `<section class="clay-card clay-card--national">${clayHead('Pitch Clay · National', 'Central stock and distribution')}
    ${central ? `<div class="clay-figures">${(central.fields || []).slice(0, 3).map(([l, v]) => `<div><strong>${clayNum(v)}</strong><span>${esc(l)}</span></div>`).join('')}</div>${fieldTable(central)}` : `<p class="clay-pending">Central stock figures haven't been added yet.</p>`}
    ${venues.length ? `<h4 class="clay-sub">Stock at venues now (${CLAY_UNIT})</h4><div class="clay-venues">${venues.map(({ g, rows }) => { const p = rows.reduce((s, r) => s + Number(r.present || 0), 0); return `<button class="clay-venue" data-go="clay" data-clay-venue="${g.id}"><span>${esc(g.short)}</span><i style="width:${p / max * 100}%"></i><strong>${clayNum(p)}</strong></button>`; }).join('')}</div><p class="sub">Venue figures are each venue's own stock (some include 2024–2025 clay), so they are not added to the national total.</p>` : ''}
  </section>`;
}
function clayPage() {
  const v = state.clayVenue && visibleVenues().some(g => g.id === Number(state.clayVenue)) ? Number(state.clayVenue) : (visibleVenues().length === 1 ? visibleVenues()[0].id : null);
  return header('Pitch Clay', v ? venueName(v) : 'National and venue stock') + (v ? venueClayCard(v) : nationalClayCard());
}

/* ── Assets ────────────────────────────────────────────────────────── */
function assetCondTone(c) { return /needs repair|replace|repair needed|out of/i.test(c || '') ? 'coral' : /maint/i.test(c || '') ? 'amber' : ''; }
function assetGroupsFor(list) {
  const map = new Map();
  for (const a of list) { const k = a.group || 'Other'; if (!map.has(k)) map.set(k, []); map.get(k).push(a); }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}
function assetsPage(embedded = false) {
  const venue = embedded ? state.ground : scopedVenue();
  const list = db.assets.filter(a => inScope(a, venue));
  const repair = list.filter(a => assetCondTone(a.condition) === 'coral').length;
  const clay = venue === 'all' ? (visibleVenues().length === 1 ? venueClayCard(visibleVenues()[0].id, true) : nationalClayCard()) : venueClayCard(venue, true);
  const top = embedded ? '' : header('Assets', venue === 'all' ? 'All venues' : venueName(venue)) + venuePicker('assets');
  if (!list.length) return top + clay + empty('No assets yet', venue === 'all' ? 'Venue asset lists will appear here once imported.' : 'This venue\'s asset list hasn\'t been imported yet.');
  return top + clay + `<div class="summary-metrics">${summaryMetric(list.length, 'Asset items', 'box')}${summaryMetric(assetGroupsFor(list).length, 'Groups', 'box')}${summaryMetric(repair, 'Needs repair', 'alert')}</div>` +
    section('Asset groups') + `<div class="data-group-grid">${assetGroupsFor(list).map(([name, items]) => {
      const pic = items.find(a => a.photos?.length)?.photos[0], bad = items.filter(a => assetCondTone(a.condition) === 'coral').length;
      return `<button class="data-group" data-go="asset-group" data-asset-group="${esc(name)}" data-asset-venue="${venue}"><span class="data-group-pic">${pic ? `<img src="${esc(pic)}" alt="" loading="lazy">` : icon('box')}</span><strong>${esc(name)}</strong><small>${items.length} item${items.length === 1 ? '' : 's'}${bad ? ` · <b class="coral-text">${bad} need repair</b>` : ''}</small></button>`;
    }).join('')}</div>`;
}
function assetGroupPage() {
  const venue = state.assetVenue ?? scopedVenue(), name = state.assetGroup;
  const items = db.assets.filter(a => inScope(a, venue) && (a.group || 'Other') === name).sort((a, b) => Number(a.ground) - Number(b.ground) || a.serial - b.serial);
  return header(name, `${items.length} item${items.length === 1 ? '' : 's'} · ${venue === 'all' ? 'All venues' : venueName(venue)}`) + (items.length ? items.map(a =>
    `<button class="list-row data-row" data-go="asset-item" data-asset-id="${esc(a.id)}"><span class="data-thumb">${a.photos?.length ? `<img src="${esc(a.photos[0])}" alt="" loading="lazy">` : icon('box')}</span><div class="grow"><strong>${esc(a.name)}</strong><small>${esc([a.qty != null ? `${clayNum(a.qty)} ${a.unit || ''}`.trim() : '', venue === 'all' ? venueName(a.ground) : '', a.brand].filter(Boolean).join(' · '))}</small>${a.condition ? `<div class="chips" style="margin-top:6px">${chip(a.condition, assetCondTone(a.condition))}</div>` : ''}</div>${icon('chevron', 'chev')}</button>`).join('') : empty('Nothing here', 'No items in this group.'));
}
function assetItemPage() {
  const a = db.assets.find(x => x.id === state.assetId);
  if (!a) return header('Asset') + empty('Not found', 'This item may have been removed.');
  return header(a.name, `${venueName(a.ground)} · ${esc(a.group || 'Other')}`) + photoCarousel(a.photos, a.name) +
    `<div class="data-badges">${a.condition ? chip(a.condition, assetCondTone(a.condition)) : ''}${a.qty != null ? chip(`${clayNum(a.qty)} ${a.unit || ''}`.trim()) : ''}<span class="data-id">ID ${esc(a.id)}</span></div>` +
    section('Details') + fieldTable(a);
}

/* ── Staff Members ─────────────────────────────────────────────────── */
function staffInitials(n) { return String(n || '?').replace(/^(md\.?|mohammad)\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join(''); }
function staffAvatar(p, cls = '') { return p.photo ? `<img class="staff-avatar ${cls}" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">` : `<span class="staff-avatar staff-avatar--initials ${cls}" aria-hidden="true">${esc(staffInitials(p.name))}</span>`; }
function staffPage() {
  const venue = scopedVenue(), list = db.staff.filter(p => inScope(p, venue));
  const top = header('Staff Members', venue === 'all' ? 'All venues' : venueName(venue)) + venuePicker('staff');
  if (!list.length) return top + empty('No staff yet', 'Staff lists will appear here once each venue\'s sheet is imported.');
  return top + `<div class="summary-metrics">${summaryMetric(list.length, 'Staff', 'team')}${STAFF_TEAMS.map(t => summaryMetric(list.filter(p => p.team === t).length, t, 'team')).join('')}</div>` +
    STAFF_TEAMS.map(t => { const ps = list.filter(p => p.team === t); return `<button class="data-team" data-go="staff-group" data-staff-team="${t}" data-staff-venue="${venue}"><div class="data-team-faces">${ps.slice(0, 5).map(p => staffAvatar(p)).join('')}</div><div class="grow"><strong>${t}</strong><small>${ps.length} member${ps.length === 1 ? '' : 's'}${venue === 'all' ? ` · ${new Set(ps.map(p => p.ground)).size} venue(s)` : ''}</small></div>${icon('chevron', 'chev')}</button>`; }).join('');
}
function staffGroupPage() {
  const venue = state.staffVenue ?? scopedVenue(), team = state.staffTeam;
  const ps = db.staff.filter(p => inScope(p, venue) && p.team === team).sort((a, b) => Number(a.ground) - Number(b.ground) || a.serial - b.serial);
  return header(team, `${ps.length} member${ps.length === 1 ? '' : 's'} · ${venue === 'all' ? 'All venues' : venueName(venue)}`) +
    `<div class="staff-grid">${ps.map(p => `<button class="staff-card" data-go="staff-profile" data-staff-id="${esc(p.id)}">${staffAvatar(p)}<strong>${esc(p.name)}</strong><small>${esc(p.designation || '')}</small>${venue === 'all' ? `<small class="muted">${esc(venueName(p.ground))}</small>` : ''}</button>`).join('')}</div>`;
}
function staffProfilePage() {
  const p = db.staff.find(x => x.id === state.staffId);
  if (!p) return header('Staff member') + empty('Not found', 'This person may have been removed.');
  return header(p.name, `${esc(p.designation || '')} · ${esc(p.team)}`) +
    `<div class="staff-hero">${staffAvatar(p, 'staff-avatar--large')}<div><strong>${esc(p.name)}</strong><span>${esc(p.designation || '')}</span><span class="muted">${esc(venueName(p.ground))}</span></div></div>` +
    section('Details') + fieldTable(p, ['Full name', 'Designation']);
}

/* ── Venue page additions ──────────────────────────────────────────── */
function venueDataSummary(id) {
  const a = db.assets.filter(x => Number(x.ground) === id), s = db.staff.filter(x => Number(x.ground) === id);
  if (!a.length && !s.length && !db.pitchClay.some(x => Number(x.ground) === id)) return '';
  return `<section class="venue-data-summary">${venueClayCard(id, true)}<div class="data-venue-links">
    <button class="list-row" data-go="assets" data-data-venue="${id}"><div class="symbol">${icon('box')}</div><div class="grow"><strong>Assets</strong><small>${a.length} items · ${a.filter(x => assetCondTone(x.condition) === 'coral').length} need repair</small></div>${icon('chevron', 'chev')}</button>
    <button class="list-row" data-go="staff" data-data-venue="${id}"><div class="symbol">${icon('team')}</div><div class="grow"><strong>Staff Members</strong><small>${STAFF_TEAMS.map(t => `${s.filter(x => x.team === t).length} ${t.replace(' Team', '').toLowerCase()}`).join(' · ')}</small></div>${icon('chevron', 'chev')}</button></div></section>`;
}

/* ── Navigation wiring ─────────────────────────────────────────────── */
const VENUE_DATA_SCREENS = { assets: () => assetsPage(), 'asset-group': assetGroupPage, 'asset-item': assetItemPage, clay: clayPage, staff: staffPage, 'staff-group': staffGroupPage, 'staff-profile': staffProfilePage };
document.addEventListener('click', e => {
  const el = e.target.closest('[data-photo-open]');
  if (el) {
    e.preventDefault(); e.stopImmediatePropagation();
    const imgs = [...el.closest('[data-carousel]').querySelectorAll('img')].map(i => i.getAttribute('src'));
    openPhotoViewer(imgs, +el.dataset.photoOpen, el.querySelector('img')?.alt || 'Photo'); return;
  }
  const b = e.target.closest('[data-go]'); if (!b) return;
  const d = b.dataset, patch = {};
  if (d.assetGroup !== undefined) { patch.assetGroup = d.assetGroup; patch.assetVenue = d.assetVenue === 'all' ? 'all' : Number(d.assetVenue); }
  if (d.assetId) patch.assetId = d.assetId;
  if (d.staffTeam) { patch.staffTeam = d.staffTeam; patch.staffVenue = d.staffVenue === 'all' ? 'all' : Number(d.staffVenue); }
  if (d.staffId) patch.staffId = d.staffId;
  if (d.clayVenue) patch.clayVenue = Number(d.clayVenue);
  if (d.dataVenue) patch.dataVenue = Number(d.dataVenue);
  if (Object.keys(patch).length) Object.assign(state, patch);
}, true);
document.addEventListener('change', e => {
  const s = e.target.closest('[data-venue-pick]'); if (!s) return;
  state.dataVenue = s.value === 'all' ? null : Number(s.value); render();
});
